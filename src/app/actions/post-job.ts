"use server";

import { createJob } from "@/app/actions/jobs";
import { uploadJobImages } from "@/app/actions/upload";
import { redirect } from "next/navigation";

export async function handleCreateJobWithImages(formData: FormData) {
  console.log('[handleCreateJobWithImages] 🚀 Server action started');
  
  try {
    // First create the job
    console.log('[handleCreateJobWithImages] 📝 Step 1: Creating job...');
    const jobId = await createJob(formData);
    console.log('[handleCreateJobWithImages] ✅ Job created with ID:', jobId);

    // Then upload images if any
    console.log('[handleCreateJobWithImages] 📸 Step 2: Checking for image files...');
    const files = formData.getAll("files") as File[];
    const validFiles = files.filter((f) => f.size > 0);
    console.log('[handleCreateJobWithImages] Found', validFiles.length, 'valid files out of', files.length);
    
    if (validFiles.length > 0) {
      console.log('[handleCreateJobWithImages] 🎬 Uploading images...');
      try {
        await uploadJobImages(jobId, formData);
        console.log('[handleCreateJobWithImages] ✅ Images uploaded successfully');
      } catch (uploadError) {
        console.error('[handleCreateJobWithImages] ⚠️ Image upload failed:', uploadError);
        // Don't throw - job is created even if images fail
      }
    } else {
      console.log('[handleCreateJobWithImages] ℹ️ No images to upload');
    }

    // Redirect after everything is done
    console.log('[handleCreateJobWithImages] 🎉 All completed, redirecting to /browse');
    redirect("/browse");
  } catch (error) {
    // Don't catch redirect errors
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('[handleCreateJobWithImages] ❌ Error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create job'
    );
  }
}
