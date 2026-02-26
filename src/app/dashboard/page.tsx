import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { getMyRole } from "@/lib/profiles";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = await getMyRole();
  if (!role) {
    redirect("/onboarding/role");
  }
  if (role !== "client") {
    redirect("/pro-dashboard");
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id,title,category,location,status,created_at")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: bids } = await supabase
    .from("bids")
    .select("id,amount,status,created_at,job_id,pro_id")
    .in(
      "job_id",
      (jobs ?? []).map((j) => j.id)
    )
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Client dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as: {user?.email ?? user?.id}</p>
        </div>
        <Button asChild>
          <Link href="/post-job">Post a job</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My jobs</CardTitle>
            <CardDescription>Jobs you posted</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {!(jobs && jobs.length) ? (
              <p className="text-sm text-muted-foreground">No jobs posted yet.</p>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/jobs/${job.id}`} className="text-sm font-medium hover:underline">
                      {job.title}
                    </Link>
                    <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{job.category} · {job.location}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent bids</CardTitle>
            <CardDescription>Bids on your jobs</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {!(bids && bids.length) ? (
              <p className="text-sm text-muted-foreground">No bids yet.</p>
            ) : (
              bids.map((bid) => (
                <div key={bid.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">KSh {bid.amount}</span>
                    <Badge variant={bid.status === "pending" ? "default" : "secondary"}>{bid.status}</Badge>
                  </div>
                  <Link href={`/jobs/${bid.job_id}`} className="mt-1 text-xs text-muted-foreground hover:underline">
                    View job
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
