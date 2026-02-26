export async function createSupabaseClerkServerClient(): Promise<never> {
  throw new Error(
    "Clerk auth has been removed. Use Supabase Auth helpers in src/lib/supabase/*."
  );
}
