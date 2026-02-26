"use server";

import { createJob } from "@/app/actions/jobs";
import { uploadJobImages } from "@/app/actions/upload";
import { redirect } from "next/navigation";

export async function handleCreateJobWithImages(formData: FormData) {
  // First create the job
  const jobId = await createJob(formData);
  // Then upload images if any
  const files = formData.getAll("files") as File[];
  if (files.some((f) => f.size > 0)) {
    await uploadJobImages(jobId, formData);
  }
  // Redirect after everything is done
  redirect("/browse");
}
