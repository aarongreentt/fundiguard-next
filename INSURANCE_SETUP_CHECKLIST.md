# Insurance Feature - Setup Checklist

## Pre-Setup
- [ ] Supabase project is created
- [ ] Project credentials are available
- [ ] You have admin access to Supabase dashboard
- [ ] Node.js 18+ is installed

---

## Step 1: Database Schema Setup

### 1.1 Run SQL Migration
- [ ] Open Supabase Dashboard
- [ ] Go to **SQL Editor** → **New Query**
- [ ] Open `insurance-schema.sql` file
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click **Execute**
- [ ] Verify no errors

### 1.2 Verify Tables Created
- [ ] Go to **Table Editor**
- [ ] Confirm `insurance_policies` table exists
- [ ] Check columns:
  - [ ] `id` (UUID)
  - [ ] `user_id` (UUID)
  - [ ] `provider` (TEXT)
  - [ ] `policy_number` (TEXT)
  - [ ] `start_date` (DATE)
  - [ ] `expiry_date` (DATE)
  - [ ] `coverage_amount` (BIGINT)
  - [ ] `certificate_url` (TEXT)
  - [ ] `verification_status` (TEXT)
  - [ ] `uploaded_at` (TIMESTAMP)
  - [ ] `verified_at` (TIMESTAMP)
  - [ ] `notes` (TEXT)

### 1.3 Verify Indexes Created
In SQL Editor, run:
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'insurance_policies';
```
- [ ] Found index on `user_id`
- [ ] Found index on `verification_status`
- [ ] Found index on `expiry_date`

### 1.4 Verify RLS Enabled
In SQL Editor, run:
```sql
SELECT relname FROM pg_class JOIN pg_namespace 
ON pg_class.relnamespace = pg_namespace.oid 
WHERE pg_namespace.nspname = 'public' 
AND pg_class.relkind = 'r' 
AND relrowsecurity = true;
```
- [ ] `insurance_policies` appears in results

---

## Step 2: Storage Setup

### 2.1 Create Storage Bucket
- [ ] Go to Supabase Dashboard
- [ ] Click **Storage** (left sidebar)
- [ ] Click **Create new bucket**
- [ ] Bucket name: `insurance_certificates`
- [ ] Set to **Public**
- [ ] Leave other settings default
- [ ] Click **Create bucket**

### 2.2 Verify Bucket
- [ ] Storage shows `insurance_certificates` bucket
- [ ] Click bucket name
- [ ] Confirm "Public" is shown

### 2.3 Test Upload (Optional)
- [ ] In bucket, click **Upload**
- [ ] Select a test PDF file
- [ ] Verify upload succeeds
- [ ] Delete test file

---

## Step 3: Code Setup

### 3.1 Verify Files Exist
- [ ] `src/app/insurance/page.tsx` exists
- [ ] `src/app/actions/insurance.ts` exists
- [ ] `src/app/api/insurance/route.ts` exists
- [ ] `src/app/api/insurance/[id]/route.ts` exists
- [ ] `insurance-schema.sql` exists
- [ ] `INSURANCE_INTEGRATION.md` exists
- [ ] `INSURANCE_QUICKSTART.md` exists

### 3.2 Verify Build
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] `/insurance` route appears in output
- [ ] `/api/insurance` routes appear in output

### 3.3 Verify Dev Server
```bash
npm run dev
```
- [ ] Dev server starts without errors
- [ ] Navigate to `http://localhost:3000/insurance`
- [ ] Page loads without errors

---

## Step 4: Manual Testing

### 4.1 Test Upload Form
- [ ] Navigate to `http://localhost:3000/insurance`
- [ ] Click "Upload Certificate"
- [ ] Form appears with fields:
  - [ ] Insurance Provider
  - [ ] Policy Number
  - [ ] Start Date
  - [ ] Expiry Date
  - [ ] Coverage Amount
  - [ ] Certificate PDF File

### 4.2 Test Validation
- [ ] Try to submit empty form
- [ ] Error message appears: "Please fill in all required fields"
- [ ] Try to submit form without PDF
- [ ] Error message appears

### 4.3 Test File Upload
- [ ] Select a PDF file (< 5MB)
- [ ] Fill all form fields
- [ ] Click "Upload Certificate"
- [ ] Success message appears
- [ ] Form clears

### 4.4 Test Policy Display
- [ ] Uploaded policy appears in "Under Review"
- [ ] Policy shows:
  - [ ] Provider name
  - [ ] Policy number
  - [ ] Coverage amount
  - [ ] "Pending" badge
  - [ ] Upload date

### 4.5 Test Dashboard Display
- [ ] Navigate to `/pro-dashboard`
- [ ] Insurance card appears
- [ ] Shows status "Active" (or appropriate status)
- [ ] Click "Manage Insurance" button
- [ ] Navigates to `/insurance`

---

## Step 5: Database Testing

### 5.1 Check Uploaded Policy
In Supabase SQL Editor:
```sql
SELECT * FROM insurance_policies ORDER BY uploaded_at DESC LIMIT 1;
```
- [ ] Policy appears in results
- [ ] All fields populated correctly
- [ ] `verification_status` = 'pending'

### 5.2 Test Verification (Admin)
In SQL Editor:
```sql
UPDATE insurance_policies
SET verification_status = 'verified',
    verified_at = now()
WHERE YOUR_POLICY_ID_HERE;
```
- [ ] Replace `YOUR_POLICY_ID_HERE` with actual policy ID
- [ ] Execute query
- [ ] On insurance page, policy moves to "Active Policies"

### 5.3 Test Active Policies View
```sql
SELECT * FROM active_insurance_policies;
```
- [ ] Verified policy appears (if not expired)
- [ ] Pending/expired policies don't appear

### 5.4 Test Coverage Calculation
```sql
SELECT * FROM user_total_coverage;
```
- [ ] Shows total coverage amount
- [ ] Shows count of active policies

---

## Step 6: Advanced Testing

### 6.1 Test Expiry Date Handling
- [ ] Upload policy with past expiry date
- [ ] Policy appears in "Expired Policies" section
- [ ] Not counted in total coverage
- [ ] Does not appear in "Active Policies" view

### 6.2 Test File Download
- [ ] In "Active Policies", click "Download PDF"
- [ ] Browser downloads the PDF file
- [ ] File opens correctly

### 6.3 Test Deletion
- [ ] In a policy row, click delete button (trash icon)
- [ ] Confirm dialog appears
- [ ] Click "Delete"
- [ ] Policy disappears from list
- [ ] Success message shows

### 6.4 Test API Endpoints (Optional)
```bash
# Get all policies
curl http://localhost:3000/api/insurance \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create policy
curl -X POST http://localhost:3000/api/insurance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "provider=Test Insurance" \
  -F "policyNumber=TEST-001" \
  -F "expiryDate=2025-12-31" \
  -F "coverageAmount=500000" \
  -F "certificateFile=@certificate.pdf"
```

---

## Step 7: Security Verification

### 7.1 Test RLS Enforcement
- [ ] Open browser incognito/private window
- [ ] Try to access `/insurance` without logging in
- [ ] Should redirect to login or show error
- [ ] After login, user can only see their own policies

### 7.2 Test Direct Database Access
In SQL as different users:
- [ ] Login as User A
- [ ] Upload policy
- [ ] Login as User B
- [ ] Cannot see User A's policies (RLS enforced)

### 7.3 Test File Access Control
- [ ] Get certificate URL
- [ ] Try to access in public (should work)
- [ ] Try to delete certificate as different user
- [ ] Should fail (only original uploader can delete)

---

## Step 8: Success Criteria

All of the following should be true:

- [ ] Database schema created and verified
- [ ] Storage bucket created and public
- [ ] Insurance page loads and renders correctly
- [ ] Upload form accepts and validates input
- [ ] Files upload successfully to storage
- [ ] Policies appear in correct sections
- [ ] Pro-Dashboard shows insurance card
- [ ] Database queries return expected results
- [ ] RLS policies prevent unauthorized access
- [ ] File downloads work correctly
- [ ] Policies can be deleted
- [ ] No errors in browser console
- [ ] No errors in server logs

---

## Step 9: Post-Setup

### 9.1 Environment Variables (if needed)
- [ ] Add to `.env.local` if using environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 9.2 Documentation
- [ ] Read `INSURANCE_INTEGRATION.md` for complete details
- [ ] Read `INSURANCE_QUICKSTART.md` for quick reference
- [ ] Reference `INTEGRATION_SUMMARY.md` for features list

### 9.3 Team Handoff
- [ ] Test with actual user accounts
- [ ] Document any custom requirements
- [ ] Create admin verification process
- [ ] Plan for insurance renewal reminders

---

## Troubleshooting

If you encounter issues:

1. **Check Logs**
   ```bash
   # Terminal logs
   npm run dev
   
   # Supabase logs
   Supabase Dashboard → Logs
   ```

2. **Database Issues**
   - Verify RLS policies in Supabase
   - Check SSL certificate settings
   - Verify API key permissions

3. **Storage Issues**
   - Verify bucket is public
   - Check file size limits
   - Verify file permissions

4. **Upload Failures**
   - Clear browser cache
   - Check file format (PDF)
   - Check network in DevTools

See **INSURANCE_INTEGRATION.md** → Troubleshooting section

---

## Support Resources

- 📖 **INSURANCE_INTEGRATION.md** - Full integration guide
- 🚀 **INSURANCE_QUICKSTART.md** - Quick reference
- 📋 **INTEGRATION_SUMMARY.md** - Feature overview
- 💾 **insurance-schema.sql** - Database schema
- 🔧 **src/app/actions/insurance.ts** - Code documentation

---

## Sign-Off

- [ ] Setup completed by: ________________
- [ ] Date: ________________
- [ ] All checks passed: ☐ Yes ☐ No
- [ ] Ready for production: ☐ Yes ☐ No
- [ ] Notes:
  ```
  ________________________________
  ________________________________
  ```

---

**Status**: 🟢 Ready to proceed to next step
