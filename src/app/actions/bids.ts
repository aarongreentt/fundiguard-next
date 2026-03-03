"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export async function createBid(jobId: string, formData: FormData) {
  console.log('[createBid] 🔄 Creating bid for job:', jobId);
  
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to place a bid");
  }

  console.log('[createBid] 👤 User:', user.id);

  const amountRaw = String(formData.get("amount") ?? "");
  const estimatedDaysRaw = String(formData.get("estimatedDays") ?? "");
  const message = String(formData.get("message") ?? "");

  const amount = amountRaw ? Number(amountRaw) : null;
  const estimatedDays = estimatedDaysRaw ? Number(estimatedDaysRaw) : null;

  console.log('[createBid] 💰 Amount:', amount, 'Days:', estimatedDays, 'Message:', message);

  if (!amount || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  if (!estimatedDays || Number.isNaN(estimatedDays) || estimatedDays <= 0) {
    throw new Error("Estimated days must be a positive number");
  }

  // Verify job exists and is open
  const { data: job } = await supabase
    .from("jobs")
    .select("id, status")
    .eq("id", jobId)
    .maybeSingle();

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "open") {
    throw new Error("Cannot bid on closed jobs");
  }

  console.log('[createBid] ✅ Job is open, inserting bid...');

  const { error } = await supabase.from("bids").insert({
    job_id: jobId,
    pro_id: user.id,
    amount,
    estimated_days: estimatedDays,
    message,
    status: "pending",
  });

  if (error) {
    console.error('[createBid] ❌ Error:', error);
    throw new Error(error.message);
  }

  console.log('[createBid] ✅ Bid created successfully');
  
  // Create conversation between bidder and job owner
  console.log('[createBid] 💬 Creating conversation for messaging...');
  const { data: jobWithClient } = await supabase
    .from("jobs")
    .select("client_id")
    .eq("id", jobId)
    .single();

  if (jobWithClient) {
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("job_id", jobId)
      .eq("client_id", jobWithClient.client_id)
      .eq("fundi_id", user.id)
      .maybeSingle();

    if (!existingConv) {
      const { error: convError } = await supabase.from("conversations").insert({
        job_id: jobId,
        client_id: jobWithClient.client_id,
        fundi_id: user.id,
      });

      if (convError) {
        console.warn('[createBid] ⚠️ Failed to create conversation:', convError);
        // Don't throw - bid was created successfully
      } else {
        console.log('[createBid] ✅ Conversation created');
      }
    } else {
      console.log('[createBid] ℹ️ Conversation already exists');
    }
  }
  
  revalidatePath(`/jobs/${jobId}`);
}

export async function updateBidStatus(bidId: string, status: "accepted" | "rejected") {
  console.log('[updateBidStatus] 🔄 Updating bid', bidId, 'to status:', status);
  
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to update a bid");
  }

  console.log('[updateBidStatus] 👤 User:', user.id);

  // Verify the user owns the job this bid belongs to
  const { data: bid } = await supabase
    .from("bids")
    .select("job_id")
    .eq("id", bidId)
    .maybeSingle();

  if (!bid) {
    console.error('[updateBidStatus] ❌ Bid not found:', bidId);
    throw new Error("Bid not found");
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("client_id")
    .eq("id", bid.job_id)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    console.error('[updateBidStatus] ❌ Not job owner. Job client_id:', job?.client_id, 'User:', user.id);
    throw new Error("You can only update bids for your own jobs");
  }

  console.log('[updateBidStatus] ✅ Permission check passed, updating bid...');

  const { error } = await supabase
    .from("bids")
    .update({ status })
    .eq("id", bidId);

  if (error) {
    console.error('[updateBidStatus] ❌ Error:', error);
    throw new Error(error.message);
  }

  console.log('[updateBidStatus] ✅ Bid updated to', status);
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
  console.log('[deleteBid] 🔄 Deleting bid:', bidId);
  
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to delete a bid");
  }

  console.log('[deleteBid] 👤 User:', user.id);

  const { data: bid } = await supabase
    .from("bids")
    .select("job_id, pro_id, created_at")
    .eq("id", bidId)
    .maybeSingle();

  if (!bid) {
    console.error('[deleteBid] ❌ Bid not found:', bidId);
    throw new Error("Bid not found");
  }

  if (bid.pro_id !== user.id) {
    console.error('[deleteBid] ❌ Not bid owner. Bid pro_id:', bid.pro_id, 'User:', user.id);
    throw new Error("You can only delete your own bids");
  }

  // Check if bid is within 1 hour window
  const createdAt = new Date(bid.created_at);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  console.log('[deleteBid] ⏰ Bid created at:', createdAt, 'One hour ago:', oneHourAgo);

  if (createdAt < oneHourAgo) {
    console.error('[deleteBid] ❌ Bid too old to cancel');
    throw new Error("You can only cancel bids within 1 hour of posting");
  }

  const { error } = await supabase.from("bids").delete().eq("id", bidId);

  if (error) {
    console.error('[deleteBid] ❌ Error:', error);
    throw new Error(error.message);
  }

  console.log('[deleteBid] ✅ Bid deleted');
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
