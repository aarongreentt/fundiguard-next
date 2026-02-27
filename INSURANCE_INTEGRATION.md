# Insurance Feature Integration Guide

## Overview
This guide covers the integration of the insurance management feature for professional fundis (service providers).

## Setup Steps

### 1. Create Supabase Storage Bucket

In your Supabase project dashboard:

1. Go to **Storage** → **Buckets**
2. Click **Create new bucket**
3. Name it: `insurance_certificates`
4. Set to **Public** (so certificates can be viewed)
5. File size limit: 10MB (adjust as needed)

#### Storage RLS Policy

Add this RLS policy to the `insurance_certificates` bucket:

```sql
-- Allow users to upload their own certificates
CREATE POLICY "Users can upload their own insurance certificates"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'insurance_certificates' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to read their own certificates
CREATE POLICY "Users can read their own insurance certificates"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'insurance_certificates'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own certificates
CREATE POLICY "Users can delete their own insurance certificates"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'insurance_certificates'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 2. Create Database Schema

Run the SQL from `insurance-schema.sql` in your Supabase SQL Editor:

1. Open Supabase dashboard
2. Go to **SQL Editor**
3. Click **New query**
4. Copy the contents of `insurance-schema.sql`
5. Execute the query

This creates:
- `insurance_policies` table
- Indexes for performance
- RLS policies for security
- Views for easier queries

### 3. Update Environment Variables

Add to your `.env.local`:

```env
# Supabase Storage
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1/object/public/insurance_certificates
```

This is optional - the code generates URLs dynamically.

### 4. Database Schema

#### insurance_policies Table

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Links to auth.users |
| `provider` | TEXT | Insurance company name |
| `policy_number` | TEXT | Policy reference number |
| `start_date` | DATE | When coverage starts |
| `expiry_date` | DATE | When coverage ends |
| `coverage_amount` | BIGINT | Amount in KSh |
| `certificate_url` | TEXT | Storage URL to PDF |
| `verification_status` | TEXT | pending, verified, expired, rejected |
| `uploaded_at` | TIMESTAMP | When uploaded |
| `verified_at` | TIMESTAMP | When admin verified |
| `notes` | TEXT | Admin notes |
| `created_at` | TIMESTAMP | Record created |
| `updated_at` | TIMESTAMP | Record updated |

## Features Implementation

### File Structure

```
src/
├── app/
│   ├── insurance/
│   │   └── page.tsx          # Main insurance page
│   └── actions/
│       └── insurance.ts       # Server actions (CRUD operations)
└── components/
    └── profile/
        └── (uses insurance data)
```

### Server Actions (insurance.ts)

- **getInsurancePolicies()** - Fetch all user policies
- **getInsurancePolicy()** - Fetch single policy
- **createInsurancePolicy()** - Upload new policy
- **updatePolicyVerification()** - Update verification status
- **deleteInsurancePolicy()** - Delete policy
- **getActivePolicies()** - Get verified & active policies
- **getTotalCoverage()** - Calculate total coverage amount

### Insurance Page Features

1. **Coverage Dashboard**
   - Active policies count
   - Total coverage amount
   - Pending approvals

2. **Upload Form**
   - Provider name
   - Policy number
   - Start/expiry dates
   - Coverage amount
   - PDF upload

3. **Policy Management**
   - View active policies
   - View pending policies
   - View expired policies
   - Download certificates
   - Delete policies

## Usage in Other Components

### Import in Server Components

```tsx
import { getActivePolicies, getTotalCoverage } from '@/app/actions/insurance';

export default async function Page() {
  const policies = await getActivePolicies();
  const coverage = await getTotalCoverage();
  
  return (
    <div>
      <p>Active Policies: {policies.length}</p>
      <p>Coverage: KSh {coverage.toLocaleString()}</p>
    </div>
  );
}
```

### Import in Client Components

```tsx
'use client';

import { createInsurancePolicy, deleteInsurancePolicy } from '@/app/actions/insurance';

export default function Component() {
  const handleUpload = async (formData: FormData) => {
    try {
      await createInsurancePolicy(formData);
      // Success
    } catch (error) {
      // Handle error
    }
  };
}
```

## Security Considerations

1. **Row Level Security (RLS)**
   - Users can only access their own policies
   - Verified by `user_id` matching `auth.uid()`

2. **File Upload Security**
   - Files uploaded to user-specific folder: `{user_id}/{timestamp}-{filename}`
   - Only PDF files accepted
   - Size limit: 5MB (configurable)

3. **Verification Status**
   - Only admins can mark as "verified" (implement admin check in production)
   - Status is either: pending, verified, expired, rejected

## Testing

### Test Upload
1. Go to `/insurance`
2. Click "Upload Certificate"
3. Fill form with test data
4. Upload a PDF file
5. Verify record appears in "Under Review"

### Test Verification
In Supabase SQL Editor, manually update:
```sql
UPDATE public.insurance_policies
SET verification_status = 'verified',
    verified_at = now()
WHERE id = 'policy-id';
```

### Test Expiry
Create a policy with a past expiry date to test the expired section.

## Integration with Pro-Dashboard

The Pro-Dashboard shows:
- Insurance status card (Active/Expired/Pending)
- Quick link to manage insurance
- Visual indicator of coverage status

## Next Steps

1. Run the SQL schema
2. Create storage bucket
3. Update environment variables
4. Test the insurance page
5. Connect profile page to show insurance status
6. Add insurance verification to admin panel

## Troubleshooting

### "Policy already exists"
The `policy_number` is unique per user. Delete the old policy or use a different number.

### "File upload failed"
- Check bucket exists and is public
- Verify RLS policies are set correctly
- Check file size is under 5MB

### "Cannot fetch policies"
- Verify user is authenticated
- Check RLS policies allow SELECT
- Check user_id matches in database

## API Endpoints (Optional)

If you need REST API endpoints instead of server actions:

```typescript
// src/app/api/insurance/route.ts
export async function GET(request: Request) {
  // Fetch policies
}

export async function POST(request: Request) {
  // Create policy
}
```

See `src/app/api/` for examples.
