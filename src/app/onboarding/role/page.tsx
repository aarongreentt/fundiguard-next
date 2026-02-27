import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { setMyRole } from "@/app/actions/profiles";
import { COLORS, ANIMATIONS, SHADOWS, BORDER_RADIUS } from "@/lib/design-tokens";

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
    <main style={{ backgroundColor: COLORS['bg-light'], minHeight: '100vh' }} className="px-4 py-12 md:py-20 flex items-center justify-center">
      <div
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: COLORS['text-dark'] }}
          >
            Welcome to FundiGuard
          </h1>
          <p
            className="text-lg"
            style={{ color: COLORS['text-muted'] }}
          >
            What's your role?
          </p>
        </div>

        <div>
          <Card style={{ boxShadow: SHADOWS.lg, backgroundColor: 'white' }}>
            <CardHeader style={{ borderBottom: `1px solid ${COLORS['border-light']}` }}>
              <CardTitle style={{ color: COLORS['text-dark'] }}>Choose your account type</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={setMyRole} className="space-y-4">
                <div
                  style={{
                    backgroundColor: COLORS['bg-light'],
                    borderRadius: BORDER_RADIUS.md,
                    border: `2px solid ${COLORS['border-light']}`,
                    padding: '16px',
                    cursor: 'pointer',
                  }}
                  className="hover:shadow-md transition-all"
                >
                  <Label className="flex items-center gap-3 cursor-pointer mb-0">
                    <input type="radio" name="role" value="client" defaultChecked className="w-5 h-5" />
                    <div>
                      <p className="font-semibold" style={{ color: COLORS['text-dark'] }}>
                        I want to hire
                      </p>
                      <p className="text-xs" style={{ color: COLORS['text-muted'] }}>
                        Post jobs and hire trusted professionals
                      </p>
                    </div>
                  </Label>
                </div>

                <div
                  style={{
                    backgroundColor: COLORS['bg-light'],
                    borderRadius: BORDER_RADIUS.md,
                    border: `2px solid ${COLORS['border-light']}`,
                    padding: '16px',
                    cursor: 'pointer',
                  }}
                  className="hover:shadow-md transition-all"
                >
                  <Label className="flex items-center gap-3 cursor-pointer mb-0">
                    <input type="radio" name="role" value="pro" className="w-5 h-5" />
                    <div>
                      <p className="font-semibold" style={{ color: COLORS['text-dark'] }}>
                        I want to work
                      </p>
                      <p className="text-xs" style={{ color: COLORS['text-muted'] }}>
                        Bid on jobs and grow your business
                      </p>
                    </div>
                  </Label>
                </div>

                <div
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    className="w-full text-white font-semibold py-6 text-base"
                    style={{ backgroundColor: COLORS['energy-orange'] }}
                  >
                    Continue
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
