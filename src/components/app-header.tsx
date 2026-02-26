import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { getMyRole } from "@/lib/profiles";

export async function AppHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user ? await getMyRole() : null;
  const dashboardHref = role === "pro" ? "/pro-dashboard" : "/dashboard";

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold">
            FundiGuard.ke
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground">
              Browse Jobs
            </Link>
            <Link href="/post-job" className="text-sm text-muted-foreground hover:text-foreground">
              Post a Job
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <Button asChild variant="secondary">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          ) : (
            <>
              <Link
                href={role ? dashboardHref : "/onboarding/role"}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
