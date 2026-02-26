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

  const urlsWithIds = await Promise.all(
    images.map(async (img) => {
      try {
        // Try signed URL with longer expiry
        const { data, error } = await supabase.storage
          .from("job-images")
          .createSignedUrl(img.storage_path, 60 * 60 * 24 * 30); // 30 days expiry

        if (error) {
          console.error("Signed URL error for", img.storage_path, ":", error);
          // Fallback to public URL
          const { data: publicData } = supabase.storage
            .from("job-images")
            .getPublicUrl(img.storage_path);
          return { id: img.id, url: publicData.publicUrl };
        }

        if (!data) {
          console.error("No data from signed URL for", img.storage_path);
          return null;
        }

        return { id: img.id, url: data.signedUrl };
      } catch (err) {
        console.error("Error getting image URL for", img.storage_path, ":", err);
        // Fallback to public URL as last resort
        try {
          const { data: publicData } = supabase.storage
            .from("job-images")
            .getPublicUrl(img.storage_path);
          return { id: img.id, url: publicData.publicUrl };
        } catch (fallbackErr) {
          console.error("Fallback public URL also failed:", fallbackErr);
          return null;
        }
      }
    })
  );

  const validImages = urlsWithIds.filter((item): item is { id: string; url: string } => item !== null);

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
