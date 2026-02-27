import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase credentials!");
  console.error("Required environment variables:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nThese should be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

interface BucketConfig {
  name: string;
  public: boolean;
  fileSizeLimit: number;
  description: string;
}

const buckets: BucketConfig[] = [
  {
    name: "avatars",
    public: true,
    fileSizeLimit: 5242880, // 5MB
    description: "User profile avatars",
  },
  {
    name: "verification-documents",
    public: false,
    fileSizeLimit: 10485760, // 10MB
    description: "Fundi verification documents",
  },
  {
    name: "portfolio-images",
    public: true,
    fileSizeLimit: 10485760, // 10MB
    description: "Fundi portfolio images",
  },
];

async function setupStorageBuckets() {
  try {
    console.log("🚀 Starting FundiGuard storage bucket setup...\n");

    let successCount = 0;
    let alreadyExistsCount = 0;

    for (const bucket of buckets) {
      try {
        console.log(`📦 Setting up bucket: ${bucket.name}`);
        console.log(`   Description: ${bucket.description}`);
        console.log(`   Public: ${bucket.public}`);
        console.log(`   Max file size: ${bucket.fileSizeLimit / 1024 / 1024}MB`);

        const { data, error } = await supabase.storage.createBucket(
          bucket.name,
          {
            public: bucket.public,
            fileSizeLimit: bucket.fileSizeLimit,
          }
        );

        if (error) {
          if (error.message.includes("already exists")) {
            console.log(
              `   ✓ Already exists (no action needed)\n`
            );
            alreadyExistsCount++;
          } else {
            console.error(`   ✗ Error: ${error.message}\n`);
            throw error;
          }
        } else {
          console.log(`   ✓ Created successfully\n`);
          successCount++;
        }
      } catch (error) {
        console.error(`   ✗ Failed to setup ${bucket.name}:`, error);
        throw error;
      }
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Storage bucket setup complete!");
    console.log(
      `   Created: ${successCount} | Already existed: ${alreadyExistsCount}`
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📋 Next steps:");
    console.log("1. ✓ Storage buckets are ready");
    console.log("2. Apply storage policies via SQL migration:");
    console.log("   File: supabase/migrations/20260227000004_storage_policies.sql");
    console.log("3. Test file uploads from the application");
    console.log("4. Verify RLS policies in Supabase console\n");

    console.log("📣 Storage setup instructions for team:");
    console.log("   - Copy .env.local to CI/CD secrets if deploying");
    console.log("   - Run this script in any new environment: npx ts-node lib/supabase/setup-storage-improved.ts");
    console.log("   - Ensure SUPABASE_SERVICE_ROLE_KEY is kept secure\n");
  } catch (error) {
    console.error("❌ Storage setup failed:", error);
    process.exit(1);
  }
}

setupStorageBuckets();
