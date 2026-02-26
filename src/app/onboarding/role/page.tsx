import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { setMyRole } from "@/app/actions/profiles";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=/onboarding/role");
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (data?.role === "client") {
    redirect("/dashboard");
  }

  if (data?.role === "pro") {
    redirect("/pro-dashboard");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Choose your account type</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={setMyRole} className="grid gap-4">
            <div className="grid gap-2">
              <Label>
                <input type="radio" name="role" value="client" defaultChecked />{" "}
                I want to hire (Client)
              </Label>
              <Label>
                <input type="radio" name="role" value="pro" />{" "}
                I want to work (Pro)
              </Label>
            </div>

            <div className="flex items-center justify-end">
              <Button type="submit">Continue</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
