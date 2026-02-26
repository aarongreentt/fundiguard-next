"use client";

import { useTransition } from "react";
import { JobImageGallery, type JobImage } from "./job-image-gallery";
import { deleteJobImage } from "@/app/actions/images";

interface JobImageGalleryWrapperProps {
  images: JobImage[];
  isJobOwner: boolean;
  jobId: string;
}

export function JobImageGalleryWrapper({
  images,
  isJobOwner,
  jobId,
}: JobImageGalleryWrapperProps) {
  const [isPending, startTransition] = useTransition();

  // Generate public URLs from storage paths
  const publicUrls: Record<string, string> = {};
  images.forEach((img) => {
    // Construct the public URL based on Supabase standard format
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (baseUrl) {
      publicUrls[img.id] = `${baseUrl}/storage/v1/object/public/job-images/${img.storage_path}`;
    }
  });

  const handleDeleteImage = async (imageId: string) => {
    startTransition(async () => {
      try {
        await deleteJobImage(imageId, jobId);
      } catch (error) {
        console.error("Failed to delete image:", error);
        throw error;
      }
    });
  };

  return (
    <JobImageGallery
      images={images}
      publicUrls={publicUrls}
      isJobOwner={isJobOwner}
      onDeleteImage={handleDeleteImage}
    />
  );
}
