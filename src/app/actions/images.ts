"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export async function deleteJobImage(imageId: string, jobId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to delete images");
  }

  // Get the image record
  const { data: image } = await supabase
    .from("job_images")
    .select("job_id,storage_path")
    .eq("id", imageId)
    .maybeSingle();

  if (!image) {
    throw new Error("Image not found");
  }

  // Verify user owns the job
  const { data: job } = await supabase
    .from("jobs")
    .select("client_id")
    .eq("id", image.job_id)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    throw new Error("You can only delete images from your own jobs");
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("job-images")
    .remove([image.storage_path]);

  if (storageError) {
    throw new Error(`Failed to delete image from storage: ${storageError.message}`);
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from("job_images")
    .delete()
    .eq("id", imageId);

  if (dbError) {
    throw new Error(`Failed to delete image record: ${dbError.message}`);
  }

  revalidatePath(`/jobs/${jobId}`);
}
