import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export type UserRole = "client" | "pro";

export async function getMyRole(): Promise<UserRole | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return null;
  }

  const role = data?.role;
  return role === "client" || role === "pro" ? role : null;
}
