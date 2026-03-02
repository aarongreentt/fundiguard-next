"use client";

import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

// Singleton pattern to ensure only one GoTrueClient instance
let supabaseClientInstance: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function useSupabaseClient() {
  return useMemo(() => {
    if (!supabaseClientInstance) {
      console.log("[useSupabaseClient] Creating new Supabase client instance");
      supabaseClientInstance = createSupabaseBrowserClient();
    } else {
      console.log("[useSupabaseClient] Reusing existing Supabase client instance");
    }
    return supabaseClientInstance!; // Non-null assertion since we just created it if needed
  }, []);
}

