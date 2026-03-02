"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export async function uploadJobImages(jobId: string, formData: FormData) {
  console.log('[uploadJobImages] 🚀 Starting image upload for job:', jobId);
  
  const supabase = await createSupabaseServerClient();
  
  console.log('[uploadJobImages] 🔐 Getting authenticated user...');
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('[uploadJobImages] ❌ No authenticated user');
    throw new Error("You must be signed in to upload images");
  }
  console.log('[uploadJobImages] ✅ User authenticated:', user.id);

  // Verify the user owns the job
  console.log('[uploadJobImages] 🔍 Verifying job ownership...');
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("client_id")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError) {
    console.error('[uploadJobImages] ❌ Error fetching job:', jobError);
    throw new Error(`Failed to fetch job: ${jobError.message}`);
  }

  if (!job || job.client_id !== user.id) {
    console.error('[uploadJobImages] ❌ Permission denied. Job client_id:', job?.client_id, 'User id:', user.id);
    throw new Error("You can only upload images for your own jobs");
  }
  console.log('[uploadJobImages] ✅ Job ownership verified');

  const files = formData.getAll("files") as File[];
  const uploadedPaths: string[] = [];

  console.log('[uploadJobImages] 📸 Processing', files.length, 'files...');

  for (const file of files) {
    if (!file || file.size === 0) {
      console.log('[uploadJobImages] ⏭️ Skipping empty file');
      continue;
    }

    console.log('[uploadJobImages] 🎬 Uploading file:', file.name, '(' + (file.size / 1024).toFixed(2) + ' KB)');
    
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${user.id}/${jobId}/${fileName}`;

    console.log('[uploadJobImages] 📁 Target path:', filePath);

    const { error: uploadError } = await supabase.storage
      .from("job-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('[uploadJobImages] ❌ Upload error for', file.name, ':', uploadError);
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }

    console.log('[uploadJobImages] ✅ File uploaded successfully');
    uploadedPaths.push(filePath);

    // Track in job_images table
    console.log('[uploadJobImages] 📝 Recording file in database...');
    const { error: insertError } = await supabase.from("job_images").insert({
      job_id: jobId,
      storage_path: filePath,
    });

    if (insertError) {
      console.error('[uploadJobImages] ❌ Database insert error:', insertError);
      throw new Error(`Failed to track image: ${insertError.message}`);
    }
    
    console.log('[uploadJobImages] ✓ File recorded in database');
  }

  console.log('[uploadJobImages] ✅ All files uploaded successfully. Total:', uploadedPaths.length);
  console.log('[uploadJobImages] 🔄 Revalidating paths...');
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
  console.log('[uploadJobImages] ✓ Paths revalidated');
}
