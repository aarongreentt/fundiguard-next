"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { initializeUserProfile } from "@/app/actions/profiles";

export function SupabaseAuthCard({
  view,
}: {
  view: "sign_in" | "sign_up";
}) {
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Listen for auth state changes to auto-create profile on signup
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // When user signs up (first time they get a session), create their profile
      if (event === "SIGNED_IN" && session?.user) {
        try {
          await initializeUserProfile();
        } catch (error) {
          console.error("Failed to initialize profile:", error);
          // Don't block signup if profile creation fails - user can still proceed
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

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
