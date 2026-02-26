import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const storagePath = path.join("/");

    const supabase = await createSupabaseServerClient();

    // Get the file from Supabase Storage
    const { data, error } = await supabase.storage
      .from("job-images")
      .download(storagePath);

    if (error || !data) {
      console.error("[Image API] Error downloading image:", error);
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

    // Return the image with proper headers
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[Image API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
