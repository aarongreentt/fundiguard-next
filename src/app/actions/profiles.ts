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
  if (role !== "client" && role !== "fundi") {
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
  revalidatePath("/profile");

  // Redirect to profile setup page after role selection
  redirect("/profile");
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

export async function updateProfileData(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("[updateProfileData] Auth error:", authError?.message);
    throw new Error("You must be signed in to continue");
  }

  console.log("[updateProfileData] Updating profile for user:", user.id);

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const hourlyRate = Number(formData.get("hourly_rate") ?? 0) || null;
  const experienceYears = Number(formData.get("experience_years") ?? 0) || null;
  const preferredBudgetMin = Number(formData.get("preferred_budget_min") ?? 0) || null;
  const preferredBudgetMax = Number(formData.get("preferred_budget_max") ?? 0) || null;

  // Validate required fields
  if (!firstName || !lastName || !location) {
    throw new Error("First name, last name, and location are required");
  }

  // Build update object with only available fields
  // Only include fields that the database schema actually has
  const updateData: any = {
    first_name: firstName,
    last_name: lastName,
    location,
    updated_at: new Date().toISOString(),
  };

  if (phone) updateData.phone = phone;
  if (bio) updateData.bio = bio;
  if (hourlyRate !== null) updateData.hourly_rate = hourlyRate;
  // Only include optional fields if they exist in the schema
  // Note: experience_years, preferred_budget_min/max may not exist in all schemas

  console.log("[updateProfileData] Updating with data:", updateData);

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.error("[updateProfileData] Database error:", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  console.log("[updateProfileData] Profile updated successfully");

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/pro-dashboard");

  return { success: true };
}

export async function changePassword(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("[changePassword] Auth error:", authError?.message);
    throw new Error("You must be signed in to continue");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  // Validation
  if (!currentPassword) {
    throw new Error("Current password is required");
  }
  if (!newPassword) {
    throw new Error("New password is required");
  }
  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters");
  }
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  console.log("[changePassword] Attempting to change password for user:", user.id);

  // Update password using Supabase auth
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("[changePassword] Password update error:", {
      message: error.message,
      code: error.code,
      status: error.status,
    });
    throw new Error(`Failed to update password: ${error.message}`);
  }

  console.log("[changePassword] Password updated successfully");

  revalidatePath("/profile");

  return { success: true };
}
