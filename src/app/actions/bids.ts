"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export async function createBid(jobId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to place a bid");
  }

  const amountRaw = String(formData.get("amount") ?? "");
  const estimatedDaysRaw = String(formData.get("estimatedDays") ?? "");
  const message = String(formData.get("message") ?? "");

  const amount = amountRaw ? Number(amountRaw) : null;
  const estimatedDays = estimatedDaysRaw ? Number(estimatedDaysRaw) : null;

  if (!amount || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  if (!estimatedDays || Number.isNaN(estimatedDays) || estimatedDays <= 0) {
    throw new Error("Estimated days must be a positive number");
  }

  const { error } = await supabase.from("bids").insert({
    job_id: jobId,
    pro_id: user.id,
    amount,
    estimated_days: estimatedDays,
    message,
    status: "pending",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/jobs/${jobId}`);
}

export async function updateBidStatus(bidId: string, status: "accepted" | "rejected") {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to update a bid");
  }

  // Verify the user owns the job this bid belongs to
  const { data: bid } = await supabase
    .from("bids")
    .select("job_id")
    .eq("id", bidId)
    .maybeSingle();

  if (!bid) {
    throw new Error("Bid not found");
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("client_id")
    .eq("id", bid.job_id)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    throw new Error("You can only update bids for your own jobs");
  }

  const { error } = await supabase
    .from("bids")
    .update({ status })
    .eq("id", bidId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/jobs/${bid.job_id}`);
  revalidatePath("/dashboard"); // client dashboard
}

export async function updateBid(bidId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to update a bid");
  }

  const { data: bid } = await supabase
    .from("bids")
    .select("pro_id,job_id")
    .eq("id", bidId)
    .maybeSingle();

  if (!bid) {
    throw new Error("Bid not found");
  }

  if (bid.pro_id !== user.id) {
    throw new Error("You can only edit your own bids");
  }

  const amountRaw = String(formData.get("amount") ?? "");
  const estimatedDaysRaw = String(formData.get("estimatedDays") ?? "");
  const message = String(formData.get("message") ?? "");

  const amount = amountRaw ? Number(amountRaw) : null;
  const estimatedDays = estimatedDaysRaw ? Number(estimatedDaysRaw) : null;

  if (!amount || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  if (!estimatedDays || Number.isNaN(estimatedDays) || estimatedDays <= 0) {
    throw new Error("Estimated days must be a positive number");
  }

  const { error } = await supabase
    .from("bids")
    .update({ amount, estimated_days: estimatedDays, message })
    .eq("id", bidId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/jobs/${bid.job_id}`);
  revalidatePath("/pro-dashboard");
}

export async function deleteBid(bidId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to delete a bid");
  }

  const { data: bid } = await supabase
    .from("bids")
    .select("job_id, pro_id, created_at")
    .eq("id", bidId)
    .maybeSingle();

  if (!bid) {
    throw new Error("Bid not found");
  }

  if (bid.pro_id !== user.id) {
    throw new Error("You can only delete your own bids");
  }

  // Check if bid is within 1 hour window
  const createdAt = new Date(bid.created_at);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  if (createdAt < oneHourAgo) {
    throw new Error("You can only cancel bids within 1 hour of posting");
  }

  const { error } = await supabase.from("bids").delete().eq("id", bidId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/jobs/${bid.job_id}`);
  revalidatePath("/pro-dashboard");
}

export async function canCancelBid(bidId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  
  const { data: bid } = await supabase
    .from("bids")
    .select("created_at")
    .eq("id", bidId)
    .maybeSingle();

  if (!bid) return false;

  const createdAt = new Date(bid.created_at);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  return createdAt > oneHourAgo;
}

export async function getAcceptedBidForJob(jobId: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data } = await supabase
    .from("bids")
    .select("id,pro_id,amount,estimated_days")
    .eq("job_id", jobId)
    .eq("status", "accepted")
    .maybeSingle();

  return data;
}
