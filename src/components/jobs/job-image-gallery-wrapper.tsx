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
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Generate public URLs manually to avoid encoding issues
  const publicUrls: Record<string, string> = {};
  
  for (const img of images) {
    try {
      // Construct the public URL manually
      const publicUrl = `${baseUrl}/storage/v1/object/public/job-images/${img.storage_path}`;
      publicUrls[img.id] = publicUrl;
      console.log("[Server] Generated URL for", img.storage_path, ":", publicUrl);
    } catch (err) {
      console.error("[Server] Failed to generate URL for", img.storage_path, ":", err);
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
