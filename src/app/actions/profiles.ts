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
    throw new Error("You must be signed in to continue");
  }

  const role = String(formData.get("role") ?? "");
  if (role !== "client" && role !== "pro") {
    throw new Error("Invalid role");
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      role,
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(error.message);
  }

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
    throw new Error("You must be signed in to continue");
  }

  const serviceLatitude = Number(formData.get("serviceLatitude") ?? 0);
  const serviceLongitude = Number(formData.get("serviceLongitude") ?? 0);
  const serviceRadiusKm = Number(formData.get("serviceRadiusKm") ?? 15);

  if (!serviceLatitude || !serviceLongitude) {
    throw new Error("Service location is required");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      service_latitude: serviceLatitude,
      service_longitude: serviceLongitude,
      service_radius_km: serviceRadiusKm,
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/pro-dashboard");
  revalidatePath("/profile");
  return { success: true };
}
