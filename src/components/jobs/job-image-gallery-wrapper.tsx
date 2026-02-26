import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
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
  const supabase = await createSupabaseServerClient();

  // Generate public URLs server-side using Supabase client
  const publicUrls: Record<string, string> = {};
  
  for (const img of images) {
    try {
      const { data } = supabase.storage
        .from("job-images")
        .getPublicUrl(img.storage_path);
      
      if (data?.publicUrl) {
        publicUrls[img.id] = data.publicUrl;
        console.log("[Server] Generated URL for", img.storage_path, ":", data.publicUrl);
      } else {
        console.warn("[Server] No public URL data for", img.storage_path);
      }
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
