import { redirect } from "next/navigation";

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
  if (role !== "pro") {
    redirect("/dashboard");
  }

  const { data: bids } = await supabase
    .from("bids")
    .select("id,amount,status,created_at,job_id,pro_id,jobs!inner(title,category,location)")
    .eq("pro_id", user!.id)
    .order("created_at", { ascending: false });

  type BidWithJob = {
    id: string;
    amount: number | null;
    status: string | null;
    created_at: string;
    job_id: string;
    pro_id: string;
    jobs: {
      title: string;
      category: string;
      location: string;
    };
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Pro dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Signed in as: {user?.email ?? user?.id}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My bids</CardTitle>
            <CardDescription>Bids you placed</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {!(bids && bids.length) ? (
              <p className="text-sm text-muted-foreground">No bids yet.</p>
            ) : (
              (bids as BidWithJob[]).map((bid) => (
                <div key={bid.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">KSh {bid.amount}</span>
                    <Badge variant={bid.status === "pending" ? "default" : "secondary"}>{bid.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{bid.jobs.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{bid.jobs.category} · {bid.jobs.location}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Placeholder for pro profile stats.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Add bio, skills, ratings later.
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
