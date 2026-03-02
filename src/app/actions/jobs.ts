"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export async function createJob(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be signed in to post a job");
  }

  const title = String(formData.get("title") ?? "");
  const category = String(formData.get("category") ?? "");
  const location = String(formData.get("location") ?? "");
  const description = String(formData.get("description") ?? "");
  const budgetMin = Number(formData.get("budget_min") ?? 0);
  const budgetMax = Number(formData.get("budget_max") ?? 0);
  
  // Get latitude/longitude from location (defaulting to Nairobi center)
  const latitude = Number(formData.get("latitude") ?? -1.2921);
  const longitude = Number(formData.get("longitude") ?? 36.8219);

  if (!title.trim()) {
    throw new Error("Title is required");
  }

  if (!location.trim()) {
    throw new Error("Location is required");
  }

  if (budgetMin <= 0 || budgetMax <= 0) {
    throw new Error("Budget must be greater than 0");
  }

  if (budgetMin >= budgetMax) {
    throw new Error("Maximum budget must be greater than minimum budget");
  }

  console.log("[createJob] Creating job with:", {
    title,
    category,
    location,
    description,
    budgetMin,
    budgetMax,
    latitude,
    longitude,
  });

  const { data, error } = await supabase.from("jobs").insert({
    client_id: user.id,
    title,
    category,
    location,
    latitude,
    longitude,
    budget_min: budgetMin,
    budget_max: budgetMax,
    description,
    status: "open",
  })
  .select("id")
  .single();

  if (error) {
    console.error("[createJob] Error creating job:", error);
    throw new Error(error.message);
  }

  console.log("[createJob] Job created successfully with ID:", data.id);
  revalidatePath("/browse");
  revalidatePath("/dashboard");
  return data.id;
}

export async function deleteJob(jobId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to delete a job");
  }

  // Verify the user owns the job
  const { data: job } = await supabase
    .from("jobs")
    .select("client_id")
    .eq("id", jobId)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    throw new Error("You can only delete your own jobs");
  }

  // Delete the job (cascade will delete bids and images)
  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/browse");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
