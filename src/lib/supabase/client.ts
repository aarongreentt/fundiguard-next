"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      "[createSupabaseBrowserClient] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
    return null;
  }

  // createBrowserClient handles session persistence in SSR environments
  // It properly manages cookies for next-js and recovery after email verification
  const client = createBrowserClient(url, anonKey);
  
  console.log("[createSupabaseBrowserClient] Supabase client created successfully");
  
  return client;
}

