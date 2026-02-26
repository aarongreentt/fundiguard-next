import { JobImageGalleryClient } from "./job-image-gallery-client";
import { type JobImage } from "./job-image-gallery";

interface JobImageGalleryWrapperProps {
  images: JobImage[];
  isJobOwner: boolean;
  jobId: string;
}

export async function JobImageGalleryWrapper({
  images,
  isJobOwner,
  jobId,
}: JobImageGalleryWrapperProps) {
  // Generate proxy URLs through our own API instead of direct Supabase URLs
  const publicUrls: Record<string, string> = {};
  
  for (const img of images) {
    try {
      // Use our own API endpoint to proxy images from Supabase
      const proxyUrl = `/api/images/${img.storage_path}`;
      publicUrls[img.id] = proxyUrl;
      console.log("[Server] Generated proxy URL for", img.storage_path, ":", proxyUrl);
    } catch (err) {
      console.error("[Server] Failed to generate proxy URL for", img.storage_path, ":", err);
    }
  }

  console.log("[Server] Public URLs dict:", publicUrls);

  return (
    <JobImageGalleryClient
      images={images}
      publicUrls={publicUrls}
      isJobOwner={isJobOwner}
      jobId={jobId}
    />
  );
}
