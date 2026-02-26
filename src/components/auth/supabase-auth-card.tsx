"use client";

import Link from "next/link";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SupabaseAuthCard({
  view,
}: {
  view: "sign_in" | "sign_up";
}) {
  const supabase = createSupabaseBrowserClient();

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{view === "sign_in" ? "Sign in" : "Sign up"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{ theme: ThemeSupa }}
            view={view}
          />
          {view === "sign_in" ? (
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="underline">
                Sign up
              </Link>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="underline">
                Sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
