"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSupabaseClient } from "@/lib/hooks/useSupabaseClient";

export function SignOutButton() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  return (
    <Button
      variant="secondary"
      disabled={!supabase}
      onClick={async () => {
        if (!supabase) {
          console.error("Supabase not configured");
          return;
        }
        await supabase.auth.signOut();
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
