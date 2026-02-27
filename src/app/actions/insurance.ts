"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export interface InsurancePolicy {
  id: string;
  user_id: string;
  provider: string;
  policy_number: string;
  start_date: string;
  expiry_date: string;
  coverage_amount: number;
  certificate_url: string;
  verification_status: "verified" | "pending" | "expired" | "rejected";
  uploaded_at: string;
  verified_at?: string;
  notes?: string;
}

// Fetch all insurance policies for current user
export async function getInsurancePolicies() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to continue");
  }

  const { data, error } = await supabase
    .from("insurance_policies")
    .select("*")
    .eq("user_id", user.id)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching insurance policies:", error);
    throw new Error(error.message);
  }

  return data as InsurancePolicy[];
}

// Fetch single policy
export async function getInsurancePolicy(policyId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to continue");
  }

  const { data, error } = await supabase
    .from("insurance_policies")
    .select("*")
    .eq("id", policyId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as InsurancePolicy;
}

// Create new insurance policy
export async function createInsurancePolicy(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to continue");
  }

  const provider = String(formData.get("provider") ?? "");
  const policyNumber = String(formData.get("policyNumber") ?? "");
  const startDate = String(formData.get("startDate") ?? "");
  const expiryDate = String(formData.get("expiryDate") ?? "");
  const coverageAmount = Number(formData.get("coverageAmount") ?? 0);
  const certificateFile = formData.get("certificateFile") as File;

  // Validation
  if (!provider || !policyNumber || !expiryDate || !coverageAmount || !certificateFile) {
    throw new Error("Missing required fields");
  }

  if (new Date(expiryDate) < new Date()) {
    throw new Error("Expiry date cannot be in the past");
  }

  try {
    // Upload certificate to storage
    const fileName = `${user.id}/${Date.now()}-${certificateFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("insurance_certificates")
      .upload(fileName, certificateFile);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("insurance_certificates")
      .getPublicUrl(fileName);

    const certificateUrl = urlData.publicUrl;

    // Create policy record
    const { error: insertError } = await supabase
      .from("insurance_policies")
      .insert({
        user_id: user.id,
        provider,
        policy_number: policyNumber,
        start_date: startDate || new Date().toISOString().split("T")[0],
        expiry_date: expiryDate,
        coverage_amount: coverageAmount,
        certificate_url: certificateUrl,
        verification_status: "pending",
        uploaded_at: new Date().toISOString(),
      });

    if (insertError) {
      throw new Error(`Failed to create policy: ${insertError.message}`);
    }

    revalidatePath("/insurance");
    return { success: true, message: "Policy uploaded successfully" };
  } catch (error) {
    console.error("Error creating insurance policy:", error);
    throw error;
  }
}

// Update policy verification status (admin only in production)
export async function updatePolicyVerification(
  policyId: string,
  status: "verified" | "pending" | "rejected",
  notes?: string
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to continue");
  }

  // In production, verify user is admin
  const policy = await getInsurancePolicy(policyId);
  if (policy.user_id !== user.id) {
    throw new Error("Not authorized");
  }

  const { error } = await supabase
    .from("insurance_policies")
    .update({
      verification_status: status,
      verified_at: status === "verified" ? new Date().toISOString() : null,
      notes,
    })
    .eq("id", policyId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/insurance");
  return { success: true, message: "Policy status updated" };
}

// Delete insurance policy
export async function deleteInsurancePolicy(policyId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to continue");
  }

  const policy = await getInsurancePolicy(policyId);
  if (policy.user_id !== user.id) {
    throw new Error("Not authorized");
  }

  // Delete certificate from storage
  const pathParts = policy.certificate_url.split("/");
  const fileName = pathParts.slice(-2).join("/");

  await supabase.storage.from("insurance_certificates").remove([fileName]).catch(() => {
    // Silently ignore if file doesn't exist
  });

  // Delete policy record
  const { error } = await supabase
    .from("insurance_policies")
    .delete()
    .eq("id", policyId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/insurance");
  return { success: true, message: "Policy deleted" };
}

// Get active policies (verified and not expired)
export async function getActivePolicies() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("insurance_policies")
    .select("*")
    .eq("user_id", user.id)
    .eq("verification_status", "verified")
    .gt("expiry_date", new Date().toISOString())
    .order("expiry_date", { ascending: false });

  if (error) {
    console.error("Error fetching active policies:", error);
    return [];
  }

  return data as InsurancePolicy[];
}

// Get total coverage amount
export async function getTotalCoverage() {
  const policies = await getActivePolicies();
  return policies.reduce((sum, policy) => sum + (policy.coverage_amount || 0), 0);
}
