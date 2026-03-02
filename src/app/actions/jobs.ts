"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export async function createJob(formData: FormData) {
  console.log('[createJob] 🚀 Starting job creation...');
  const supabase = await createSupabaseServerClient();
  
  console.log('[createJob] 🔐 Getting authenticated user...');
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('[createJob] ❌ No authenticated user');
    throw new Error("You must be signed in to post a job");
  }
  console.log('[createJob] ✅ User authenticated:', user.id);

  console.log('[createJob] 📖 Reading form data...');
  const title = String(formData.get("title") ?? "");
  const category = String(formData.get("category") ?? "");
  const location = String(formData.get("location") ?? "");
  const description = String(formData.get("description") ?? "");
  const budgetMin = Number(formData.get("budget_min") ?? 0);
  const budgetMax = Number(formData.get("budget_max") ?? 0);

  console.log('[createJob] 📋 Form data extracted:', {
    title: title.length > 0 ? '✓' : '✗',
    category: category.length > 0 ? '✓' : '✗',
    location: location.length > 0 ? '✓' : '✗',
    description: description.length > 0 ? '✓' : '✗',
    budgetMin,
    budgetMax,
  });

  // Validation
  console.log('[createJob] 🔍 Validating form data...');
  if (!title.trim()) {
    console.error('[createJob] ❌ Missing title');
    throw new Error("Title is required");
  }

  if (!location.trim()) {
    console.error('[createJob] ❌ Missing location');
    throw new Error("Location is required");
  }

  if (budgetMin <= 0 || budgetMax <= 0) {
    console.error('[createJob] ❌ Invalid budget:', { budgetMin, budgetMax });
    throw new Error("Budget must be greater than 0");
  }

  if (budgetMin >= budgetMax) {
    console.error('[createJob] ❌ Budget min >= max:', { budgetMin, budgetMax });
    throw new Error("Maximum budget must be greater than minimum budget");
  }

  // Format budget range as string (KES 1000 - KES 5000)
  const budgetRange = `KES ${budgetMin.toLocaleString()} - KES ${budgetMax.toLocaleString()}`;
  console.log('[createJob] ✅ All validations passed');
  console.log('[createJob] 💰 Budget range formatted:', budgetRange);

  console.log('[createJob] 🗂️ Creating job in database...', {
    client_id: user.id,
    title,
    category,
    location,
    budget_range: budgetRange,
    status: 'open',
  });

  const { data, error } = await supabase.from("jobs").insert({
    client_id: user.id,
    title,
    category,
    location,
    budget_range: budgetRange,
    description,
    status: "open",
  })
  .select("id")
  .single();

  if (error) {
    console.error('[createJob] ❌ Database error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    // Provide helpful error message based on error type
    if (error.code === '23505') {
      throw new Error(`Job with this title already exists`);
    } else if (error.code === '23502') {
      throw new Error(`Missing required field. Please fill all required fields and try again.`);
    } else if (error.code === '23514') {
      throw new Error(`Invalid status value. Job status must be: open, in_progress, completed, cancelled, or closed.`);
    }
    throw new Error(`Failed to create job: ${error.message}`);
  }

  console.log('[createJob] ✅ Job created successfully with ID:', data.id);
  console.log('[createJob] 🔄 Revalidating paths...');
  revalidatePath("/browse");
  revalidatePath("/dashboard");
  console.log('[createJob] ✓ Paths revalidated');
  
  return data.id;
}

export async function deleteJob(jobId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to delete a job");
  }

  // Verify the user owns the job
  const { data: job } = await supabase
    .from("jobs")
    .select("client_id")
    .eq("id", jobId)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    throw new Error("You can only delete your own jobs");
  }

  // Delete the job (cascade will delete bids and images)
  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/browse");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
