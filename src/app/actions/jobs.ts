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
  const budgetRange = String(formData.get("budgetRange") ?? "");
  const description = String(formData.get("description") ?? "");

  if (!title.trim()) {
    throw new Error("Title is required");
  }

  const { data, error } = await supabase.from("jobs").insert({
    client_id: user.id,
    title,
    category,
    location,
    budget_range: budgetRange,
    description,
    status: "open",
  })
  .select("id")
  .single();

  if (error) {
    throw new Error(error.message);
  }

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
