import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { COLORS, ANIMATIONS, SHADOWS, BORDER_RADIUS } from "@/lib/design-tokens";
import { createBid, updateBidStatus, getAcceptedBidForJob } from "@/app/actions/bids";
import { deleteJob } from "@/app/actions/jobs";
import { BidForm } from "@/components/bids/bid-form";
import { BidsList, type BidRow } from "@/components/bids/bids-list";
import { JobImageGalleryWrapper } from "@/components/jobs/job-image-gallery-wrapper";
import { type JobImage } from "@/components/jobs/job-image-gallery";
import { DeleteJobButton } from "@/components/jobs/delete-job-button";
import { TomTomMap } from "@/components/maps/tomtom-map";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id,title,category,location,budget_range,status,client_id,description,latitude,longitude")
    .eq("id", id)
    .maybeSingle();

  if (jobError || !job) {
    notFound();
  }

  const { data: bids } = await supabase
    .from("bids")
    .select("id,pro_id,amount,estimated_days,message,status,created_at")
    .eq("job_id", id)
    .order("created_at", { ascending: false });

  const { data: images } = await supabase
    .from("job_images")
    .select("id,job_id,storage_path,created_at")
    .eq("job_id", id)
    .order("created_at", { ascending: false });

  console.log("[Job Page] Images from DB for job", id, ":", images);

  const acceptedBid = (bids ?? []).find((b) => b.status === "accepted");
  
  const canBid = Boolean(user && user.id !== job.client_id && job.status === "open" && !acceptedBid);
  const canSeeBids = Boolean(
    user && (user.id === job.client_id || (bids ?? []).some((b) => b.pro_id === user.id))
  );
  const isJobOwner = Boolean(user && user.id === job.client_id);

  return (
    <main style={{ backgroundColor: COLORS['bg-light'], minHeight: '100vh' }} className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Job Header Card */}
        <div>
          <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }}>
            <CardHeader style={{ borderBottom: `1px solid ${COLORS['border-light']}` }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1
                    className="text-3xl md:text-4xl font-bold mb-2"
                    style={{ color: COLORS['text-dark'] }}
                  >
                    {job.title}
                  </h1>
                  <p
                    className="text-lg"
                    style={{ color: COLORS['text-muted'] }}
                  >
                    {job.category} · {job.location}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge 
                    variant={job.status === "open" ? "default" : "secondary"}
                    style={{ 
                      backgroundColor: job.status === "open" ? COLORS['trust-green'] : COLORS['text-muted'],
                      color: 'white'
                    }}
                  >
                    {job.status.toUpperCase()}
                  </Badge>
                  {isJobOwner && (
                    <DeleteJobButton jobId={id} />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm mb-2" style={{ color: COLORS['text-muted'] }}>
                    Budget Range
                  </p>
                  <p className="text-2xl font-bold" style={{ color: COLORS['energy-orange'] }}>
                    {job.budget_range}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-2" style={{ color: COLORS['text-muted'] }}>
                    Description
                  </p>
                  <p className="text-base" style={{ color: COLORS['text-dark'] }}>
                    {job.description || "No description provided"}
                  </p>
                </div>
              </div>

              {acceptedBid && (
                <div
                  style={{
                    backgroundColor: `${COLORS['trust-green']}15`,
                    borderRadius: BORDER_RADIUS.md,
                    border: `2px solid ${COLORS['trust-green']}`,
                    padding: '16px',
                  }}
                >
                  <p className="font-semibold" style={{ color: COLORS['trust-green'] }}>
                    ✓ Bid Accepted
                  </p>
                  <p className="text-sm mt-2" style={{ color: COLORS['text-muted'] }}>
                    Professional assigned: <span className="font-bold">KSh {acceptedBid.amount}</span> for <span className="font-bold">{acceptedBid.estimated_days} days</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Images Gallery */}
        {images && images.length > 0 && (
          <div className="mt-6">
            <JobImageGalleryWrapper 
              images={images as JobImage[]} 
              isJobOwner={isJobOwner}
              jobId={id}
            />
          </div>
        )}

        {/* Map Section */}
        {job.latitude && job.longitude && (
          <div className="mt-6">
            <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }}>
              <CardHeader style={{ borderBottom: `1px solid ${COLORS['border-light']}` }}>
                <CardTitle style={{ color: COLORS['text-dark'] }}>Job Location</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <TomTomMap
                  latitude={job.latitude}
                  longitude={job.longitude}
                  zoom={15}
                  height="300px"
                  markerLabel={job.location}
                  interactive={false}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bid Section */}
        {canBid && (
          <div className="mt-6">
            <BidForm action={createBid.bind(null, job.id)} />
          </div>
        )}

        {acceptedBid && !isJobOwner && (
          <div className="mt-6">
            <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }}>
              <CardContent className="pt-8 text-center">
                <p style={{ color: COLORS['text-muted'] }}>
                  This job has been awarded to another professional.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bids List */}
        {canSeeBids && (
          <div className="mt-6">
            <BidsList bids={(bids as BidRow[]) ?? []} isJobOwner={isJobOwner} currentUserId={user?.id} />
          </div>
        )}
      </div>
    </main>
  );
}
