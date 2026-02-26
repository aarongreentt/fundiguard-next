"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export async function uploadJobImages(jobId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to upload images");
  }

  // Verify the user owns the job
  const { data: job } = await supabase
    .from("jobs")
    .select("client_id")
    .eq("id", jobId)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    throw new Error("You can only upload images for your own jobs");
  }

  const files = formData.getAll("files") as File[];
  const uploadedPaths: string[] = [];

  for (const file of files) {
    if (!file || file.size === 0) continue;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${user.id}/${jobId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("job-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }

    uploadedPaths.push(filePath);

    // Track in job_images table
    const { error: insertError } = await supabase.from("job_images").insert({
      job_id: jobId,
      storage_path: filePath,
    });

    if (insertError) {
      throw new Error(`Failed to track image: ${insertError.message}`);
    }
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
}
