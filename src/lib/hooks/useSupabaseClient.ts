"use client";

import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

// Singleton pattern to ensure only one GoTrueClient instance
let supabaseClientInstance: SupabaseClient = null;

export function useSupabaseClient() {
  return useMemo(() => {
    if (!supabaseClientInstance) {
      console.log("[useSupabaseClient] Creating new Supabase client instance");
      supabaseClientInstance = createSupabaseBrowserClient();
      if (!supabaseClientInstance) {
        console.error("[useSupabaseClient] Failed to create Supabase client - environment variables may not be configured");
      }
    } else {
      console.log("[useSupabaseClient] Reusing existing Supabase client instance");
    }
    return supabaseClientInstance;
  }, []);
}

