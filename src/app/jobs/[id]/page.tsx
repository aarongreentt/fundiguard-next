import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { createBid, updateBidStatus, getAcceptedBidForJob } from "@/app/actions/bids";
import { deleteJob } from "@/app/actions/jobs";
import { BidForm } from "@/components/bids/bid-form";
import { BidsList, type BidRow } from "@/components/bids/bids-list";
import { JobImageGallery, type JobImage } from "@/components/jobs/job-image-gallery";
import { DeleteJobButton } from "@/components/jobs/delete-job-button";

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
    .select("id,title,category,location,budget_range,status,client_id,description")
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

  const acceptedBid = (bids ?? []).find((b) => b.status === "accepted");
  
  const canBid = Boolean(user && user.id !== job.client_id && job.status === "open" && !acceptedBid);
  const canSeeBids = Boolean(
    user && (user.id === job.client_id || (bids ?? []).some((b) => b.pro_id === user.id))
  );
  const isJobOwner = Boolean(user && user.id === job.client_id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <CardDescription>
                  {job.category} · {job.location}
                </CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
                {isJobOwner && (
                  <DeleteJobButton jobId={id} />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm text-muted-foreground">Budget: {job.budget_range}</p>
            {job.description ? <p className="text-sm text-muted-foreground">{job.description}</p> : null}
            {acceptedBid && (
              <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-200">
                <p className="text-sm font-medium text-green-900">✓ Bid Accepted</p>
                <p className="text-xs text-green-700 mt-1">No further bids can be placed for this job. Professional assigned: KSh {acceptedBid.amount} for {acceptedBid.estimated_days} days</p>
              </div>
            )}
          </CardContent>
        </Card>

        {images && images.length > 0 ? <JobImageGallery images={images as JobImage[]} /> : null}

        {canBid ? <BidForm action={createBid.bind(null, job.id)} /> : null}
        {acceptedBid && !isJobOwner ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">This job has been awarded to another professional.</p>
            </CardContent>
          </Card>
        ) : null}
        {canSeeBids ? <BidsList bids={(bids as BidRow[]) ?? []} isJobOwner={isJobOwner} currentUserId={user?.id} /> : null}
      </div>
    </main>
  );
}
