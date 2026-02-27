# Insurance Feature - Quick Start Guide

## What's New

✅ **Insurance Page** (`/insurance`) - New page for managing professional insurance certificates
✅ **Server Actions** - Backend CRUD operations for insurance policies
✅ **Supabase Integration** - Complete database schema with RLS policies
✅ **Pro-Dashboard Integration** - Insurance card and quick links

## Files Added/Modified

### New Files
- `src/app/insurance/page.tsx` - Insurance management page
- `src/app/actions/insurance.ts` - Server actions for CRUD operations
- `insurance-schema.sql` - Database schema and RLS policies
- `INSURANCE_INTEGRATION.md` - Complete integration guide

### Modified Files
- `src/app/pro-dashboard/page.tsx` - Added Insurance card and header button

## Quick Setup

### 1. Create Database Schema

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy contents of `insurance-schema.sql` and run

### 2. Create Storage Bucket

1. Go to **Storage** → **Buckets**
2. Click **Create new bucket**
3. Name: `insurance_certificates`
4. Set to **Public**

### 3. Test the Feature

1. Go to `http://localhost:3000/pro-dashboard`
2. Click the **📋 Insurance** button
3. Click **Upload Certificate**
4. Fill in test data and upload a PDF

## Features

### Insurance Page
- **View Policies**: See all active, pending, and expired policies
- **Upload Certificate**: Add new insurance policies with PDFs
- **Coverage Tracking**: View total coverage amount
- **Delete Policies**: Remove outdated policy records
- **Download Certificates**: Access uploaded PDFs

### Pro-Dashboard Integration
- **Insurance Status Card**: Shows current coverage status
- **Manage Insurance Link**: Quick access to insurance management
- **Coverage Summary**: Display total active coverage

## Server Actions

```typescript
// Fetch all user's policies
const policies = await getInsurancePolicies();

// Get active policies only
const active = await getActivePolicies();

// Get total coverage amount
const total = await getTotalCoverage();

// Create new policy
await createInsurancePolicy(formData);

// Delete policy
await deleteInsurancePolicy(policyId);

// Update verification status (admin only)
await updatePolicyVerification(policyId, 'verified');
```

## Database Schema

### insurance_policies Table
```sql
- id (UUID) - Primary key
- user_id (UUID) - Links to auth.users
- provider (TEXT) - Insurance company name
- policy_number (TEXT) - Policy reference
- start_date (DATE) - Coverage start
- expiry_date (DATE) - Coverage end
- coverage_amount (BIGINT) - Amount in KSh
- certificate_url (TEXT) - Storage URL
- verification_status (TEXT) - pending|verified|expired|rejected
- uploaded_at (TIMESTAMP) - When uploaded
- verified_at (TIMESTAMP) - When verified
- notes (TEXT) - Admin notes
```

## Security

✅ **Row Level Security (RLS)**
- Users can only access their own policies
- All queries filtered by `auth.uid()`

✅ **File Upload Security**
- Files stored in user-specific folders: `{user_id}/{timestamp}-{filename}`
- Only PDF files accepted (can be enforced)
- 5MB file size limit (configurable)

✅ **Access Control**
- INSERT/UPDATE/DELETE requires authentication
- Verification requires admin role (to be implemented)

## Usage Example

### In Server Components
```tsx
import { getActivePolicies, getTotalCoverage } from '@/app/actions/insurance';

export default async function Page() {
  const policies = await getActivePolicies();
  const coverage = await getTotalCoverage();
  
  return (
    <div>
      <p>Active Coverage: KSh {coverage.toLocaleString()}</p>
      <p>Policies: {policies.length}</p>
    </div>
  );
}
```

### In Client Components
```tsx
'use client';

import { createInsurancePolicy } from '@/app/actions/insurance';

export default function Form() {
  const handleSubmit = async (formData: FormData) => {
    try {
      await createInsurancePolicy(formData);
      // Success
    } catch (error) {
      // Handle error
    }
  };

  return <form onSubmit={handleSubmit}>/* ... */</form>;
}
```

## Next Steps

1. ✅ **Database Setup** - Run `insurance-schema.sql`
2. ✅ **Storage Setup** - Create `insurance_certificates` bucket
3. ⏳ **Test Upload** - Upload a test certificate
4. ⏳ **Admin Verification** - Verify policies in Supabase SQL Editor
5. ⏳ **Profile Integration** - Show insurance status in user profiles
6. ⏳ **Client Visibility** - Let clients see insurance status when browsing fundis

## Troubleshooting

### "Upload failed"
- Check bucket exists and is public
- Verify RLS policies are correct
- Check file size is under 5MB

### "Cannot fetch policies"
- Verify you're logged in
- Check RLS policies allow SELECT
- Verify user_id in database

### "Policy already exists"
- `policy_number` is unique per user
- Use a different number or delete the old policy

## API Endpoints (Optional)

If you need REST endpoints instead of server actions:

```typescript
// GET /api/insurance
// GET /api/insurance/[id]
// POST /api/insurance
// PATCH /api/insurance/[id]
// DELETE /api/insurance/[id]
```

Examples available in `src/app/api/` folder.

## Questions?

See `INSURANCE_INTEGRATION.md` for the complete integration guide.
