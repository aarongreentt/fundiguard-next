import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { NextRequest, NextResponse } from "next/server";

// Cache static images for 1 year
export const revalidate = 31536000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const startTime = Date.now();
  try {
    const { path } = await params;
    const storagePath = path.join("/");

    // Log request start
    console.log(`[Image API] 📸 Fetching: ${storagePath}`);

    const supabase = await createSupabaseServerClient();

    // Get the file from Supabase Storage
    const { data, error } = await supabase.storage
      .from("job-images")
      .download(storagePath);

    if (error || !data) {
      const errorMsg = error?.message || "File not found";
      console.error(`[Image API] ❌ Error downloading ${storagePath}:`, errorMsg);
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Get file type from path
    const extension = storagePath.split(".").pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };
    const contentType = contentTypeMap[extension || ""] || "image/jpeg";

    const duration = Date.now() - startTime;
    console.log(`[Image API] ✅ Served ${storagePath} (${duration}ms)`);

    // Return the image with proper headers and aggressive caching
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Served-From": "supabase-storage",
        "X-Response-Time": `${duration}ms`,
      },
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error("[Image API] 💥 Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
