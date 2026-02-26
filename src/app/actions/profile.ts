"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export async function updateUserProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to update your profile");
  }

  const fullName = String(formData.get("fullName") ?? "");
  const email = user.email;
  const role = String(formData.get("role") ?? "");

  // Email update
  if (email && email !== user.email) {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      throw new Error(`Failed to update email: ${error.message}`);
    }
  }

  // Profile update
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    role,
    full_name: fullName,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }

  revalidatePath("/profile");
}

export async function getUserProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,role,full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name || "",
    role: profile?.role || "",
  };
}
