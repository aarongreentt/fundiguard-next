"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export async function setMyRole(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[setMyRole] No user found");
    throw new Error("You must be signed in to continue");
  }

  const role = String(formData.get("role") ?? "");
  if (role !== "client" && role !== "pro") {
    console.error("[setMyRole] Invalid role:", role);
    throw new Error("Invalid role");
  }

  console.log("[setMyRole] Setting role for user:", user.id, "role:", role);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      role,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("[setMyRole] Database error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Failed to set role: ${error.message}`);
  }

  console.log("[setMyRole] Role updated successfully for user:", user.id);

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/pro-dashboard");

  redirect(role === "client" ? "/dashboard" : "/pro-dashboard");
}

export async function updateServiceArea(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[updateServiceArea] No user found");
    throw new Error("You must be signed in to continue");
  }

  const serviceLatitude = Number(formData.get("serviceLatitude") ?? 0);
  const serviceLongitude = Number(formData.get("serviceLongitude") ?? 0);
  const serviceRadiusKm = Number(formData.get("serviceRadiusKm") ?? 15);

  if (!serviceLatitude || !serviceLongitude) {
    console.error("[updateServiceArea] Missing service location");
    throw new Error("Service location is required");
  }

  console.log("[updateServiceArea] Updating service area for user:", user.id, {
    latitude: serviceLatitude,
    longitude: serviceLongitude,
    radius: serviceRadiusKm,
  });

  const { error } = await supabase
    .from("profiles")
    .update({
      service_latitude: serviceLatitude,
      service_longitude: serviceLongitude,
      service_radius_km: serviceRadiusKm,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[updateServiceArea] Database error:", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    throw new Error(`Failed to update service area: ${error.message}`);
  }

  console.log("[updateServiceArea] Service area updated successfully");

  revalidatePath("/pro-dashboard");
  revalidatePath("/profile");
  return { success: true };
}

export async function initializeUserProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("[initializeUserProfile] Auth error:", authError?.message);
    throw new Error("You must be signed in to continue");
  }

  console.log("[initializeUserProfile] Initializing profile for user:", user.id);

  // Check if profile already exists
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error("[initializeUserProfile] Error checking existing profile:", selectError);
  }

  console.log("[initializeUserProfile] Existing profile:", existingProfile);

  // Only create if it doesn't exist
  if (!existingProfile) {
    console.log("[initializeUserProfile] Creating new profile record...");
    const { data, error } = await supabase.from("profiles").insert({
      id: user.id,
      // role is null until they select it in onboarding
      // all other fields will use database defaults
    });

    if (error) {
      console.error("[initializeUserProfile] Error creating profile:", error);
      throw new Error(error.message);
    }
    console.log("[initializeUserProfile] Profile created successfully:", data);
  } else {
    console.log("[initializeUserProfile] Profile already exists, skipping creation");
  }

  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true };
}
