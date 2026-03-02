# Post Job Process - Complete Debugging Guide

## Overview
This guide provides comprehensive debugging information for the post job workflow, including logging checkpoints, potential issues, and testing steps.

## Architecture Flow

```
Client (Browser)
    ↓
[PostJobPage] Form submission → handleCreateJobWithImages (server action)
    ↓
[post-job.ts] Orchestration layer
    ├─→ [jobs.ts] createJob() - Insert job record
    ├─→ [upload.ts] uploadJobImages() - Upload images to storage
    └─→ redirect("/browse") - Navigate to browse page
```

## Step-by-Step Debugging

### 1. CLIENT-SIDE: Form Submission Initiation
**File:** `src/app/post-job/page.tsx`
**Key Function:** `handleSubmit()`

**Console Logs to Expect:**
```
[PostJobPage] 🚀 Submit button clicked
[PostJobPage] ✅ Validation passed
[PostJobPage] 📝 Form data: { title, category, location, budget_min-max, description }
[PostJobPage] 📸 Files to upload: X
[PostJobPage] File 1: filename.jpg (XXX.XX KB)
[PostJobPage] 📦 FormData entries before adding files
[PostJobPage] 🎬 Adding files to FormData...
[PostJobPage] ✓ Added file: filename.jpg
[PostJobPage] 🌐 Calling server action handleCreateJobWithImages...
[PostJobPage] ⏱️ Submission started at: [ISO timestamp]
```

**Common Issues at This Stage:**
- ❌ Form validation fails (check error messages in red box)
- ❌ Files not selected properly
- ❌ FormData not constructed correctly

**How to Debug:**
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Fill out form completely (all 4 steps)
4. Click "Post Job" button
5. Check console for the above logs
6. If submission fails, error will show in console and red alert box

---

### 2. SERVER-SIDE: Orchestration
**File:** `src/app/actions/post-job.ts`
**Key Function:** `handleCreateJobWithImages()`

**Console Logs to Expect (in Terminal where npm run dev is running):**
```
[handleCreateJobWithImages] 🚀 Server action started
[handleCreateJobWithImages] 📝 Step 1: Creating job...
[handleCreateJobWithImages] ✅ Job created with ID: [uuid]
[handleCreateJobWithImages] 📸 Step 2: Checking for image files...
[handleCreateJobWithImages] Found X valid files out of X
[handleCreateJobWithImages] 🎬 Uploading images...
[handleCreateJobWithImages] ✅ Images uploaded successfully
[handleCreateJobWithImages] 🎉 All steps completed, redirecting to /browse
```

**Common Issues at This Stage:**
- ❌ Job creation fails (see Step 3 for details)
- ❌ Image upload fails (see Step 4 for details)
- ❌ User not authenticated

---

### 3. DATABASE: Job Creation
**File:** `src/app/actions/jobs.ts`
**Key Function:** `createJob()`

**Console Logs to Expect:**
```
[createJob] 🚀 Starting job creation...
[createJob] 🔐 Getting authenticated user...
[createJob] ✅ User authenticated: [user-id]
[createJob] 📖 Reading form data...
[createJob] 📋 Form data extracted: { title: ✓, category: ✓, location: ✓, description: ✓, budgetMin, budgetMax }
[createJob] 🔍 Validating form data...
[createJob] ✅ All validations passed
[createJob] 💰 Budget range formatted: KES X,XXX - KES X,XXX
[createJob] 🗂️ Creating job in database... { client_id, title, category, location, budget_range, status }
[createJob] ✅ Job created successfully with ID: [uuid]
[createJob] 🔄 Revalidating paths...
[createJob] ✓ Paths revalidated
```

**Validation Rules:**
- Title: Required, non-empty
- Category: Required
- Location: Required, non-empty
- Budget Min: > 0
- Budget Max: > 0
- Budget Min < Budget Max

**Database Schema (Required Fields):**
```sql
jobs table:
  - client_id (UUID) ✓
  - title (TEXT) ✓
  - category (VARCHAR) ✓
  - location (VARCHAR) ✓
  - budget_range (VARCHAR) - Format: "KES 1,000 - KES 5,000" ✓
  - description (TEXT) ✓
  - status (VARCHAR) - Default: "open" ✓
```

**Common Issues at This Stage:**
- ❌ User not authenticated: "You must be signed in to post a job"
- ❌ Missing required fields: Check error message for which field
- ❌ Invalid budget: "Budget must be greater than 0"
- ❌ Budget validation: "Maximum budget must be greater than minimum budget"
- ❌ Database error: Check full error details in console

**Database Error Details Format:**
```
Error creating job: {
  code: [error code],
  message: [human readable message],
  details: [detailed info],
  hint: [suggested fix]
}
```

---

### 4. STORAGE: Image Upload
**File:** `src/app/actions/upload.ts`
**Key Function:** `uploadJobImages()`

**Console Logs to Expect:**
```
[uploadJobImages] 🚀 Starting image upload for job: [job-id]
[uploadJobImages] 🔐 Getting authenticated user...
[uploadJobImages] ✅ User authenticated: [user-id]
[uploadJobImages] 🔍 Verifying job ownership...
[uploadJobImages] ✅ Job ownership verified
[uploadJobImages] 📸 Processing X files...
[uploadJobImages] 🎬 Uploading file: filename.jpg (XXX.XX KB)
[uploadJobImages] 📁 Target path: [user-id]/[job-id]/filename.jpg
[uploadJobImages] ✅ File uploaded successfully
[uploadJobImages] 📝 Recording file in database...
[uploadJobImages] ✓ File recorded in database
[uploadJobImages] ✅ All files uploaded successfully. Total: X
[uploadJobImages] 🔄 Revalidating paths...
[uploadJobImages] ✓ Paths revalidated
```

**Storage Configuration:**
- Bucket: `job-images`
- Path Format: `{user-id}/{job-id}/{timestamp}-{random}.{ext}`
- Database Table: `job_images`
  - Fields: `job_id`, `storage_path`

**Common Issues at This Stage:**
- ❌ User not authenticated: "You must be signed in to upload images"
- ❌ Insufficient permissions: Storage bucket permissions
- ❌ Job ownership: "You can only upload images for your own jobs"
- ❌ Storage error: "Failed to upload [filename]: [error]"
- ❌ Database error: "Failed to track image: [error]"

**File Size Limits:**
- Individual file: ~100 MB (check Supabase storage limits)
- Multiple files: Up to 5 files per job

---

## Testing Checklist

### Pre-Submission Tests
- [ ] User is logged in (check /dashboard or /profile for confirmation)
- [ ] Form has all required fields filled:
  - [ ] Job Title (not empty)
  - [ ] Category (selected from dropdown)
  - [ ] Location (not empty)
  - [ ] Description (not empty)
  - [ ] Budget Min (> 0)
  - [ ] Budget Max (> Budget Min)
  - [ ] At least 1 image (for step 3)
- [ ] Images are valid image files (jpg, png, etc.)
- [ ] Images are not corrupted

### Submission Tests

**Test 1: Minimal Job (No Images)**
1. Navigate to `/post-job`
2. Fill in all fields
3. Skip step 3 images (click Next to move to review)
4. Click "Post Job"
5. **Expected:** Job appears in `/browse` without images

**Test 2: Job With Images**
1. Navigate to `/post-job`
2. Fill in all fields
3. Upload 1-5 images on step 3
4. Review on step 4
5. Click "Post Job"
6. **Expected:** Job appears in `/browse` with images displayed

**Test 3: Validation Tests**
1. Try submitting with invalid budget (max < min)
   - **Expected:** Error message on step 2
2. Try submitting with empty title
   - **Expected:** Error message on step 1
3. Try submitting without images (if required)
   - **Expected:** Error message on step 3

**Test 4: Error Recovery**
1. Start job submission, trigger an error
2. Check that error appears in red box
3. Verify you can correct and re-submit
4. **Expected:** Second submission succeeds

---

## Console Log Reading Guide

### Error Patterns

**Authentication Error:**
```
[createJob] ❌ No authenticated user
[createJob] Error: You must be signed in to post a job
```
→ **Solution:** Check if user is logged in, check auth token validity

**Validation Error:**
```
[createJob] ❌ Invalid budget: { budgetMin, budgetMax }
[createJob] Error: Maximum budget must be greater than minimum budget
```
→ **Solution:** Check budget_min and budget_max values in form

**Database Error:**
```
[createJob] ❌ Database error: {
  code: "23502",
  message: "null value in column...",
  details: "...",
  hint: "..."
}
```
→ **Solution:** Required field is missing or null

**Storage Error:**
```
[uploadJobImages] ❌ Upload error for filename.jpg: ...
```
→ **Solution:** Check storage bucket permissions, file size, or storage quota

---

## Real-Time Monitoring

### Browser Console
```javascript
// Open DevTools (F12) → Console tab
// Watch for [PostJobPage] logs while submitting

// To filter logs:
console.clear(); // Clear previous logs
// Then submit form to see only new logs
```

### Terminal/Server Logs
```bash
# Terminal where `npm run dev` is running
# Watch for [createJob], [handleCreateJobWithImages], [uploadJobImages] logs
# Shows: ✅ successes, ❌ errors, 📝 debug info
```

### Navigation Result
After successful submission:
- [ ] Browser redirects to `/browse`
- [ ] New job appears in job list
- [ ] Job shows correct title, location, category
- [ ] Images display correctly (if uploaded)
- [ ] Budget range shows correctly formatted

---

## Debugging Tools

### Log-Based Debugging
1. Open DevTools Console (F12)
2. Type: `localStorage.debug = '*'` (enables verbose logging)
3. Refresh page
4. Submit form
5. Review all console logs

### Network Inspection
1. Open DevTools → Network tab
2. Submit form
3. Look for POST request to server action
4. Check request payload (should include FormData)
5. Check response (should contain job ID or error)

### Storage Inspection
1. After successful upload, check Supabase:
2. Go to: Storage → job-images bucket
3. Verify files appear in: `user-id/job-id/` folder
4. Check Database → job_images table for records

---

## Common Issues & Solutions

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| Red error box appears | Form or server validation failed | Check error message, read console logs |
| Page doesn't redirect | Redirect failed | Check browser network errors, server logs |
| Images not saved | Upload failed | Check storage bucket permissions, file size |
| Job created but no images | Image upload skipped | Was step 3 skipped? Are files valid? |
| Validation passes but submit fails | Server error | Check terminal/dev server logs for errors |
| Budget formatted incorrectly | Locale/number format | Budget should format with commas: KES 1,000 |
| User gets permission error | Not authenticated or wrong user | Sign in again, check user ID |

---

## Database Query Monitoring

### Check Created Jobs
```sql
-- Check jobs created by current user
SELECT id, title, category, budget_range, status, created_at
FROM jobs
WHERE client_id = [user-id]
ORDER BY created_at DESC;
```

### Check Job Images
```sql
-- Check images for specific job
SELECT job_id, storage_path, created_at
FROM job_images
WHERE job_id = [job-id]
ORDER BY created_at;
```

---

## Summary: Full Request Flow

1. **User fills form** → All fields validated client-side
2. **User clicks "Post Job"** → `handleSubmit()` triggered
3. **FormData constructed** → Includes all fields + files
4. **Server action called** → `handleCreateJobWithImages()`
5. **Job created in DB** → Returns job ID
6. **Files uploaded to storage** → Tracked in job_images table
7. **Paths revalidated** → Cache updated
8. **Redirect to /browse** → User sees new job

**Logging:** Each step has detailed console logs with ✅/❌ indicators

---

## Need Further Help?

1. **Check console logs** - Most errors are logged with context
2. **Verify authentication** - Must be signed in as client
3. **Validate form data** - All required fields must be filled
4. **Check server logs** - Watch terminal where `npm run dev` runs
5. **Inspect network** - Check browser Network tab for request/response
6. **Database state** - Verify data in Supabase dashboard
