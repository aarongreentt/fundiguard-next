import { redirect } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { getMyRole } from "@/lib/profiles";
import { filterJobsByServiceArea, sortJobsByDistance, formatDistance } from "@/lib/geo";
import { COLORS, ANIMATIONS, SHADOWS, BORDER_RADIUS } from "@/lib/design-tokens";

type BidRow = {
  id: string;
  amount: number | null;
  status: string | null;
  created_at: string;
  job_id: string;
  pro_id: string;
  jobs: Array<{
    title: string;
    category: string;
    location: string;
  }>;
};

type JobRow = {
  id: string;
  title: string;
  category: string;
  location: string;
  budget_range: string;
  status: string;
  latitude: number;
  longitude: number;
  client_id: string;
};

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = await getMyRole();
  if (!role) {
    redirect("/onboarding/role");
  }
  if (role !== "pro") {
    redirect("/dashboard");
  }

  // Get pro's bids
  const { data: bids } = await supabase
    .from("bids")
    .select("id,amount,status,created_at,job_id,pro_id,jobs!inner(title,category,location)")
    .eq("pro_id", user!.id)
    .order("created_at", { ascending: false });

  const typedBids = (bids as BidRow[]) || [];

  // Get pro's service area
  const { data: profile } = await supabase
    .from("profiles")
    .select("service_latitude,service_longitude,service_radius_km")
    .eq("id", user!.id)
    .maybeSingle();

  // Get available jobs (not yet bid on)
  const { data: allJobs } = await supabase
    .from("jobs")
    .select("id,title,category,location,budget_range,status,latitude,longitude,client_id")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const jobsData = (allJobs as JobRow[]) || [];
  
  // Filter out jobs the pro already bid on
  const bidJobIds = new Set(typedBids.map(b => b.job_id));
  const availableJobs = jobsData.filter(j => !bidJobIds.has(j.id));

  // Filter jobs by service area if profile location is set
  let jobsInArea = availableJobs;
  if (profile?.service_latitude && profile?.service_longitude) {
    jobsInArea = filterJobsByServiceArea(
      availableJobs,
      profile.service_latitude,
      profile.service_longitude,
      profile.service_radius_km || 15
    );

    // Sort by distance
    const sorted = sortJobsByDistance(
      jobsInArea,
      profile.service_latitude,
      profile.service_longitude
    );
    jobsInArea = sorted.map(item => ({
      ...item.job,
      distance_km: item.distance,
    }));
  }

  return (
    <main style={{ backgroundColor: COLORS['bg-light'], minHeight: '100vh' }} className="px-4 py-8 md:py-12">
      <div
        className="mx-auto max-w-6xl"
      >
        {/* Header Section */}
        <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-2"
              style={{ color: COLORS['text-dark'] }}
            >
              Professional Dashboard
            </h1>
            <p
              className="text-lg"
              style={{ color: COLORS['text-muted'] }}
            >
              Manage your bids and find new opportunities
            </p>
          </div>
          <Button asChild className="text-white" style={{ backgroundColor: COLORS['trust-green'] }}>
            <Link href="/insurance">
              📋 Insurance
            </Link>
          </Button>
        </div>

        {/* Stats and Service Area Container */}
        <div
          className="grid gap-6 lg:grid-cols-3 mb-8"
        >
          {/* My Bids Card */}
          <div
            className="lg:col-span-2"
          >
            <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }} className="h-full">
              <CardHeader style={{ borderBottom: `1px solid ${COLORS['border-light']}` }}>
                <CardTitle className="text-xl" style={{ color: COLORS['text-dark'] }}>
                  My Bids
                </CardTitle>
                <CardDescription style={{ color: COLORS['text-muted'] }}>
                  {typedBids.length} bids placed
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!typedBids.length ? (
                  <p style={{ color: COLORS['text-muted'] }} className="text-sm text-center py-8">
                    No bids yet. <Link href="/browse" className="underline font-semibold" style={{ color: COLORS['energy-orange'] }}>Browse jobs now</Link>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {typedBids.map((bid, idx) => (
                      <div
                        key={bid.id}
                      >
                        <Link href={`/jobs/${bid.job_id}`}>
                          <div
                            style={{
                              backgroundColor: COLORS['bg-light'],
                              borderRadius: BORDER_RADIUS.md,
                              padding: '16px',
                            }}
                            className="hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <span className="font-semibold text-sm" style={{ color: COLORS['trust-green'] }}>
                                KSh {bid.amount}
                              </span>
                              <Badge
                                variant={
                                  bid.status === "pending"
                                    ? "default"
                                    : bid.status === "accepted"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {bid.status}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm" style={{ color: COLORS['text-dark'] }}>
                              {bid.jobs[0]?.title}
                            </p>
                            <p className="text-xs mt-1" style={{ color: COLORS['text-muted'] }}>
                              {bid.jobs[0]?.category} · {bid.jobs[0]?.location}
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Service Area Card */}
          <div>
            <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }} className="h-full">
              <CardHeader style={{ borderBottom: `1px solid ${COLORS['border-light']}` }}>
                <CardTitle className="text-xl" style={{ color: COLORS['text-dark'] }}>
                  Service Area
                </CardTitle>
                <CardDescription style={{ color: COLORS['text-muted'] }}>
                  Your work radius
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {profile?.service_latitude && profile?.service_longitude ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: COLORS['text-muted'] }}>
                        Radius
                      </p>
                      <p className="text-2xl font-bold" style={{ color: COLORS['trust-green'] }}>
                        {profile.service_radius_km || 15} km
                      </p>
                    </div>
                    <div style={{ backgroundColor: COLORS['bg-light'], padding: '12px', borderRadius: BORDER_RADIUS.md }}>
                      <p className="text-xs" style={{ color: COLORS['text-muted'] }}>
                        Available Jobs
                      </p>
                      <p className="text-2xl font-bold" style={{ color: COLORS['energy-orange'] }}>
                        {jobsInArea.length}
                      </p>
                    </div>
                    <Button asChild className="w-full text-white" style={{ backgroundColor: COLORS['trust-green'] }}>
                      <Link href="/profile">Edit Service Area</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <p style={{ color: COLORS['text-muted'] }} className="text-sm">
                      Set your service area to see available jobs nearby.
                    </p>
                    <Button asChild className="w-full text-white" style={{ backgroundColor: COLORS['energy-orange'] }}>
                      <Link href="/profile">Set up Service Area</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insurance Card */}
          <div>
            <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }} className="h-full">
              <CardHeader style={{ borderBottom: `1px solid ${COLORS['border-light']}` }}>
                <CardTitle className="text-xl" style={{ color: COLORS['text-dark'] }}>
                  Professional Insurance
                </CardTitle>
                <CardDescription style={{ color: COLORS['text-muted'] }}>
                  Coverage status
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 text-center">
                  <div style={{ backgroundColor: COLORS['trust-green'] + '15', padding: '12px', borderRadius: BORDER_RADIUS.md }}>
                    <p className="text-xs" style={{ color: COLORS['text-muted'] }}>
                      Status
                    </p>
                    <p className="text-2xl font-bold mt-2" style={{ color: COLORS['trust-green'] }}>
                      Active
                    </p>
                  </div>
                  <p style={{ color: COLORS['text-muted'] }} className="text-sm">
                    Keep your professional insurance updated to build client trust.
                  </p>
                  <Button asChild className="w-full text-white" style={{ backgroundColor: COLORS['trust-green'] }}>
                    <Link href="/insurance">Manage Insurance</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available Jobs Section */}
        {jobsInArea.length > 0 && (
          <div>
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: COLORS['text-dark'] }}
            >
              Available Jobs in Your Area
            </h2>
            <div
              className="grid gap-4 md:grid-cols-2"
            >
              {jobsInArea.slice(0, 6).map((job: any, idx: number) => (
                <div
                  key={job.id}
                >
                  <Link href={`/jobs/${job.id}`}>
                    <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }} className="h-full cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-sm line-clamp-2" style={{ color: COLORS['text-dark'] }}>
                              {job.title}
                            </p>
                            <p className="text-xs mt-2" style={{ color: COLORS['text-muted'] }}>
                              {job.category}
                            </p>
                          </div>
                          <Badge variant="default" style={{ backgroundColor: COLORS['trust-green'] }}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 mt-4 pt-4" style={{ borderTop: `1px solid ${COLORS['border-light']}` }}>
                          <p className="text-xs" style={{ color: COLORS['text-muted'] }}>
                            📍 {job.location}
                          </p>
                          {job.distance_km !== undefined && (
                            <p className="text-xs font-semibold" style={{ color: COLORS['energy-orange'] }}>
                              {formatDistance(job.distance_km)}
                            </p>
                          )}
                          <p className="text-sm font-bold" style={{ color: COLORS['trust-green'] }}>
                            {job.budget_range}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>

            {jobsInArea.length > 6 && (
              <div
                className="text-center mt-8"
              >
                <Button asChild className="text-white px-8 py-6 font-semibold" style={{ backgroundColor: COLORS['energy-orange'] }}>
                  <Link href="/browse">
                    View all {jobsInArea.length} available jobs
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {profile?.service_latitude && jobsInArea.length === 0 && availableJobs.length > 0 && (
          <div>
            <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }} className="mt-8">
              <CardContent className="pt-8">
                <p className="text-center" style={{ color: COLORS['text-muted'] }}>
                  No jobs available in your service area. Try expanding your radius or browse all jobs.
                </p>
                <div className="text-center mt-4">
                  <Button asChild className="text-white" style={{ backgroundColor: COLORS['energy-orange'] }}>
                    <Link href="/browse">Browse all jobs</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
