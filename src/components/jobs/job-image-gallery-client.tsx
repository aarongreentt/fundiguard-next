"use client";

import { useTransition } from "react";
import { JobImageGallery, type JobImage } from "./job-image-gallery";
import { deleteJobImage } from "@/app/actions/images";

interface JobImageGalleryClientProps {
  images: JobImage[];
  publicUrls: Record<string, string>;
  isJobOwner: boolean;
  jobId: string;
}

export function JobImageGalleryClient({
  images,
  publicUrls,
  isJobOwner,
  jobId,
}: JobImageGalleryClientProps) {
  const [isPending, startTransition] = useTransition();

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
