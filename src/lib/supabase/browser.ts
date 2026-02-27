import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

export function createSupabaseBrowserClient() {
  // In browser, NEXT_PUBLIC_ variables are available from process.env
  const url = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL 
    : env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    : env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
    return null;
  }

  return createClient(url, anonKey);
}
