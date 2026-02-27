import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { getMyRole } from "@/lib/profiles";
import { COLORS, ANIMATIONS, SHADOWS, BORDER_RADIUS } from "@/lib/design-tokens";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = await getMyRole();
  if (!role) {
    redirect("/onboarding/role");
  }
  if (role !== "client") {
    redirect("/pro-dashboard");
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id,title,category,location,status,created_at")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: bids } = await supabase
    .from("bids")
    .select("id,amount,status,created_at,job_id,pro_id")
    .in(
      "job_id",
      (jobs ?? []).map((j) => j.id)
    )
    .order("created_at", { ascending: false });

  return (
    <main style={{ backgroundColor: COLORS['bg-light'], minHeight: '100vh' }} className="px-4 py-8 md:py-12">
      <div
        className="mx-auto max-w-6xl"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-2"
              style={{ color: COLORS['text-dark'] }}
            >
              Client Dashboard
            </h1>
            <p
              style={{ color: COLORS['text-muted'] }}
              className="text-base"
            >
              Welcome back! Manage your jobs and bids
            </p>
          </div>
          <div>
            <Button asChild className="font-semibold text-white px-8 py-6" style={{ backgroundColor: COLORS['energy-orange'] }}>
              <Link href="/post-job">Post a New Job</Link>
            </Button>
          </div>
        </div>

        {/* Cards Section */}
        <div
          className="grid gap-6 md:grid-cols-2"
        >
          {/* Jobs Card */}
          <div>
            <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }} className="h-full">
              <CardHeader style={{ borderBottom: `1px solid ${COLORS['border-light']}` }}>
                <CardTitle className="text-xl" style={{ color: COLORS['text-dark'] }}>
                  My Jobs
                </CardTitle>
                <CardDescription style={{ color: COLORS['text-muted'] }}>
                  {jobs?.length ?? 0} jobs posted
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!(jobs && jobs.length) ? (
                  <p style={{ color: COLORS['text-muted'] }} className="text-sm text-center py-8">
                    No jobs posted yet. <Link href="/post-job" className="underline font-semibold" style={{ color: COLORS['energy-orange'] }}>Create one now</Link>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job, idx) => (
                      <div
                        key={job.id}
                        style={{ backgroundColor: COLORS['bg-light'], borderRadius: BORDER_RADIUS.md }}
                        className="p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <Link href={`/jobs/${job.id}`} className="font-medium text-sm hover:underline" style={{ color: COLORS['text-dark'] }}>
                            {job.title}
                          </Link>
                          <Badge variant={job.status === "open" ? "default" : "secondary"}>
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-xs" style={{ color: COLORS['text-muted'] }}>
                          {job.category} · {job.location}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bids Card */}
          <div>
            <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }} className="h-full">
              <CardHeader style={{ borderBottom: `1px solid ${COLORS['border-light']}` }}>
                <CardTitle className="text-xl" style={{ color: COLORS['text-dark'] }}>
                  Recent Bids
                </CardTitle>
                <CardDescription style={{ color: COLORS['text-muted'] }}>
                  {bids?.length ?? 0} bids received
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!(bids && bids.length) ? (
                  <p style={{ color: COLORS['text-muted'] }} className="text-sm text-center py-8">
                    No bids yet. Post a job to receive bids
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bids.map((bid, idx) => (
                      <div
                        key={bid.id}
                        style={{ backgroundColor: COLORS['bg-light'], borderRadius: BORDER_RADIUS.md }}
                        className="p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="font-semibold text-sm" style={{ color: COLORS['trust-green'] }}>
                            KSh {bid.amount}
                          </span>
                          <Badge variant={bid.status === "pending" ? "default" : "secondary"}>
                            {bid.status}
                          </Badge>
                        </div>
                        <Link href={`/jobs/${bid.job_id}`} className="text-xs hover:underline" style={{ color: COLORS['text-muted'] }}>
                          View job
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
