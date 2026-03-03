import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log('[GET /api/jobs] 📦 Fetching jobs with thumbnails and image proxies...');
  
  try {
    const supabase = await createSupabaseServerClient();

    // Fetch all open jobs with their images
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (error) {
      console.error('[GET /api/jobs] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[GET /api/jobs] Found', jobs?.length || 0, 'open jobs');

    // Get first image and count for each job
    if (jobs && jobs.length > 0) {
      const jobsWithImages = await Promise.all(
        jobs.map(async (job) => {
          const { data: images, count } = await supabase
            .from("job_images")
            .select("storage_path")
            .eq("job_id", job.id)
            .order("created_at", { ascending: true })
            .limit(1);

          let imageUrl = null;
          if (images && images.length > 0) {
            const storagePath = images[0].storage_path;
            // Use local image proxy for faster loading
            imageUrl = `/api/images/${storagePath}`;
            console.log('[GET /api/jobs] Job', job.id, 'image proxy URL:', imageUrl);
          }

          return {
            ...job,
            image_count: count || 0,
            image_url: imageUrl,
          };
        })
      );

      return NextResponse.json(jobsWithImages);
    }

    return NextResponse.json(jobs || []);
  } catch (error) {
    console.error('[GET /api/jobs] Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
