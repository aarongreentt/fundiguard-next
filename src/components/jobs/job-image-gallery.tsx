import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export type JobImage = {
  id: string;
  job_id: string;
  storage_path: string;
  created_at: string;
};

export async function JobImageGallery({ images }: { images: JobImage[] }) {
  console.log("[JobImageGallery] Received images:", images);

  if (images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Images</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No images uploaded.</p>
        </CardContent>
      </Card>
    );
  }

  const supabase = await createSupabaseServerClient();

  const urlsWithIds = images.map((img) => {
    try {
      console.log("[JobImageGallery] Processing image path:", img.storage_path);
      
      // Use public URL directly since bucket has public read access
      const { data } = supabase.storage
        .from("job-images")
        .getPublicUrl(img.storage_path);
      
      const url = data?.publicUrl;
      console.log("[JobImageGallery] Generated URL:", url);
      
      if (url) {
        return { id: img.id, url };
      }
      return null;
    } catch (err) {
      console.error("[JobImageGallery] Error getting image URL for", img.storage_path, ":", err);
      return null;
    }
  });

  const validImages = urlsWithIds.filter((item): item is { id: string; url: string } => item !== null);
  console.log("[JobImageGallery] Valid images:", validImages);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Images ({validImages.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {validImages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Failed to load images.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {validImages.map(({ id, url }) => (
              <div key={id} className="relative aspect-square rounded-md overflow-hidden border bg-gray-100">
                <Image
                  src={url}
                  alt="Job image"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
