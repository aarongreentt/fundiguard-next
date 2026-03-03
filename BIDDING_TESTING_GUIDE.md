# Jobs & Bidding System - Testing Guide

## Setup
- Dev server running at http://localhost:3000
- Migrations applied to Supabase database
- Database schema includes jobs, job_images, bids, pro_profiles, profiles tables

## Testing Checklist

### Phase 1: Job Creation (Client)
- [ ] Sign in as client user
- [ ] Go to /post-job
- [ ] Fill form: title, description, category, location, budget range
- [ ] Upload job images
- [ ] Submit
- [ ] Check console logs: `[createJob] ✅ Job created successfully`
- [ ] Verify job appears in /jobs/[id]
- [ ] Verify job appears on /browse page

### Phase 2: Job Status Management (Client)
- [ ] View your posted job
- [ ] Scroll to "Manage Job Status" card (only visible if you're job owner)
- [ ] Try changing status: open → in_progress → completed
- [ ] Check console: `[updateJobStatus] ✅ Job status updated to: [status]`
- [ ] Verify status badge updates

### Phase 3: Bidding - Fundi (Pro) User
- [ ] Sign in as different user (fundi/pro role)
- [ ] Go to /browse
- [ ] Click on a job posted by client
- [ ] Scroll to "Place a bid" form (should be visible)
- [ ] Fill form: Amount, Estimated days, Message
- [ ] Submit bid
- [ ] Check server logs: `[createBid] ✅ Bid created successfully`
- [ ] Verify bid appears in the bids list

### Phase 4: Bid Management - Fundi (Pro) User
- [ ] View your bids in the bids list
- [ ] Try to edit: Click "Edit" button (shows form with pre-filled data)
- [ ] Try to delete: Click "Delete" (only works within 1 hour)
- [ ] Check console: `[deleteBid] ✅ Bid deleted`

### Phase 5: Bid Acceptance - Client
- [ ] Sign back in as client who posted the job
- [ ] View your job that has bids
- [ ] Scroll to bids list
- [ ] Try to accept a bid: Click "Accept" on a pending bid
- [ ] Check console: `[updateBidStatus] ✅ Bid updated to accepted`
- [ ] Verify bid status changes to "accepted"
- [ ] Verify other fundis cannot bid anymore

### Phase 6: Bid Rejection - Client
- [ ] View same job
- [ ] Click "Reject" on a different pending bid
- [ ] Check console: `[updateBidStatus] ✅ Bid updated to rejected`
- [ ] Verify bid status changes to "rejected"

### Server Console Debugging
Look for these log patterns:

**Bid Creation:**
```
[createBid] 🔄 Creating bid for job: [jobId]
[createBid] 👤 User: [userId]
[createBid] 💰 Amount: [amount] Days: [days] Message: [msg]
[createBid] ✅ Job is open, inserting bid...
[createBid] ✅ Bid created successfully
```

**Bid Status Update:**
```
[updateBidStatus] 🔄 Updating bid [bidId] to status: [status]
[updateBidStatus] 👤 User: [userId]
[updateBidStatus] ✅ Permission check passed, updating bid...
[updateBidStatus] ✅ Bid updated to [status]
```

**Job Detail Page:**
```
[Job Page] 📋 Job: [jobId] | Bids from DB: [count] bids
[Job Page] 💰 Bid details: [{id, pro_id, amount, status}...]
[Job Page] 🖼️ Images from DB for job [jobId] : [count] images
[Job Page] ✅ Accepted bid: [bidId or "none"]
[Job Page] 🎯 Can bid: [true/false]
[Job Page] 👁️ Can see bids: [true/false]
```

## Database Schema Verification

### Jobs Table
```sql
SELECT * FROM public.jobs LIMIT 1;
-- Should have: id, client_id, title, description, category, location, 
-- latitude, longitude, budget_range, status, created_at, updated_at
```

### Bids Table
```sql
SELECT * FROM public.bids LIMIT 1;
-- Should have: id, job_id, pro_id, amount, estimated_days, message, status, created_at, updated_at
-- UNIQUE constraint on (job_id, pro_id) to prevent duplicate bids
```

## Troubleshooting

### Issue: "Column does not exist" errors
**Solution:** Run `supabase db push` to apply migrations

### Issue: Bid form doesn't appear
**Solution:** Check if:
- You're not the job owner
- Job status is "open"
- No bid has been accepted on this job
- You have a "fundi" role

### Issue: "Can only update bids for your own jobs" error
**Solution:** You must be the client who posted the job to accept/reject bids

### Issue: "You can only delete your own bids" error
**Solution:** You must be the pro/fundi who created the bid

### Issue: Bid won't delete - "Can only cancel within 1 hour"
**Solution:** Bids can only be deleted within 1 hour of creation. This is by design.

## Features Summary

✅ **Fundi Features:**
- Browse open jobs
- Place bids on jobs
- Edit own pending bids (within 1 hour)
- Delete own pending bids (within 1 hour)
- View their bids on job detail pages

✅ **Client Features:**
- Post jobs with images
- Change job status (open → in_progress → completed)
- View all bids on their jobs
- Accept one bid per job (locks other fundis from bidding)
- Reject bids

✅ **Database Features:**
- Automatic RLS policies for security
- UNIQUE constraint prevents duplicate bids
- Cascade delete for job images and bids
- Status enums for job and bid states
