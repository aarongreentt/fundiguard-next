import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockJobs } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

type SupabaseJobRow = {
  id: string;
  title: string | null;
  category: string | null;
  location: string | null;
  budget_range: string | null;
  status: string | null;
};

export default async function Page() {
  let jobs = mockJobs;
  let source: "mock" | "supabase" = "mock";

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("id,title,category,location,budget_range,status")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      source = "supabase";
      jobs = (data as SupabaseJobRow[]).map((j) => ({
        id: j.id,
        title: j.title ?? "Untitled job",
        category: j.category ?? "General",
        location: j.location ?? "",
        budgetRange: j.budget_range ?? "",
        status: j.status === "open" ? "open" : "assigned",
      }));
    }
  } catch {
    // Fall back to mock data if env vars aren't set yet.
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Browse jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing {source === "supabase" ? "Supabase" : "mock"} data.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`} className="block">
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{job.title}</CardTitle>
                    <CardDescription>
                      {job.category} · {job.location}
                    </CardDescription>
                  </div>
                  <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Budget: {job.budgetRange}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
