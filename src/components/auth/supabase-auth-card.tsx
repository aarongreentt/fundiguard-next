"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  // Memoize the supabase client to prevent recreating it on every render
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    // Listen for auth state changes to auto-create profile on signup and redirect on signin
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[SupabaseAuthCard] Auth state changed:", event, session?.user?.id);
      
      if (event === "SIGNED_IN" && session?.user) {
        try {
          console.log("[SupabaseAuthCard] User signed in:", session.user.id);
          
          // Initialize profile if needed
          if (view === "sign_up") {
            console.log("[SupabaseAuthCard] Initializing profile for new user");
            const result = await initializeUserProfile();
            console.log("[SupabaseAuthCard] Profile initialized successfully:", result);
          }
          
          // Delay redirect slightly to ensure auth session is fully established
          console.log("[SupabaseAuthCard] Redirecting to dashboard...");
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 500);
        } catch (error) {
          console.error("[SupabaseAuthCard] Error during signin:", error);
          // Still redirect even if profile creation fails
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 500);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router, view]);

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
