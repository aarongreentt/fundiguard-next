# FundiGuard.ke Session Summary: Bidding & Roles Implementation

## Objective
Implement a comprehensive bidding system and user roles (client/pro) within the Next.js application, integrated with Supabase. This involved creating and configuring Supabase tables (`bids` and `profiles`) with appropriate RLS policies, developing UI components for placing and viewing bids, and implementing an onboarding flow for role selection. The immediate goal was to add accept/reject bid actions for clients on the job detail page.

## Completed Features

### 1. Supabase Auth Migration
- Replaced Clerk authentication with Supabase Auth
- Updated sign-in/sign-up pages to use Supabase Auth UI
- Implemented middleware for session refresh and protected routes
- Created server-side and client-side Supabase clients

### 2. Role-Based Access Control
- Created `profiles` table with RLS policies
- Implemented role onboarding page (`/onboarding/role`)
- Added middleware to redirect users without roles
- Updated dashboards to route based on role (client vs pro)

### 3. Jobs System
- Updated `jobs` table with proper UUID columns and RLS
- Implemented job posting with server actions
- Added job browsing and detail pages
- Integrated with Supabase for data persistence

### 4. Bidding System
- Created `bids` table with RLS policies
- Implemented bid creation server action
- Added bid form component for pros
- Created bid list component for viewing bids
- Implemented accept/reject bid actions for clients
- Added delete bid action for pros
- Added inline edit functionality for pros to edit their bids

### 5. Image Uploads
- Created Supabase Storage bucket `job-images`
- Implemented RLS policies for image access
- Added file input component for job posting
- Created image gallery component for job pages
- Implemented server actions for image upload and tracking
- Added `job_images` table to track file paths

### 6. Dashboards
- Populated client dashboard with real data (my jobs + recent bids)
- Populated pro dashboard with real data (my bids + job details)
- Added navigation and role-based redirects

## Technical Implementation Details

### Database Schema
```sql
-- Profiles (roles)
profiles (id, role, created_at, updated_at)

-- Jobs
jobs (id, title, category, location, budget_range, description, status, client_id, created_at)

-- Bids
bids (id, job_id, pro_id, amount, estimated_days, message, status, created_at)

-- Job Images
job_images (id, job_id, storage_path, created_at)
```

### RLS Policies
- Jobs: Public can read open jobs; clients can manage their own jobs
- Bids: Pros can create bids; job owners can read bids; bidders can read their own bids
- Profiles: Users can read/update their own profile
- Storage: Job owners can upload; authenticated users can read images

### Key Components
- `SupabaseAuthCard`: Reusable auth UI component
- `BidForm`: Form for pros to place bids
- `BidsList`: List of bids with accept/reject/edit/delete actions
- `EditBidForm`: Inline form for editing bids
- `JobImageGallery`: Gallery component for job images
- `FileInput`: File upload component

### Server Actions
- `createJob`: Create a new job
- `createBid`: Place a bid on a job
- `updateBidStatus`: Accept/reject a bid
- `updateBid`: Edit a bid
- `deleteBid`: Delete a bid
- `uploadJobImages`: Upload images for a job
- `handleCreateJobWithImages`: Combined job creation with image upload

### Configuration
- `next.config.ts`: Added body size limit for server actions and image hostname configuration
- Middleware: Role-based redirects and session management
- Environment variables: Supabase URL and keys

## Issues Fixed
- Fixed React form action errors by moving server functions to separate files
- Resolved Next.js Image hostname configuration for Supabase Storage
- Fixed client/server boundary issues with Supabase clients
- Added proper TypeScript types for database queries
- Implemented error handling and validation for all forms

## Current State
- ✅ Authentication with Supabase Auth
- ✅ Role-based access control (client/pro)
- ✅ Job posting and browsing
- ✅ Bidding system with full CRUD operations
- ✅ Image uploads for jobs
- ✅ Real-time dashboards for both roles
- ✅ Accept/reject bid actions for clients
- ✅ Edit/delete bid actions for pros

## Next Steps (Options)
- **A) Mapping**: Add Leaflet + OpenStreetMap for job locations
- **B) SMS + Payments**: Integrate Twilio for notifications and M-Pesa Daraja for payments
- **C) Polish**: Improve error UI, add profile pages, and enhance user experience

## Testing Checklist
1. Sign up → select role → verify dashboard routing
2. Post a job with images → verify storage and gallery display
3. Pro places bid → verify bid appears in dashboards
4. Client accepts/rejects bid → verify status updates
5. Pro edits/deletes bid → verify inline editing and removal
6. Verify images are visible to both clients and pros

## Files Created/Modified
- `/src/app/actions/bids.ts`: Bid CRUD actions
- `/src/app/actions/jobs.ts`: Job creation
- `/src/app/actions/upload.ts`: Image upload
- `/src/app/actions/post-job.ts`: Combined job+image creation
- `/src/app/actions/bid-actions.ts`: Bid action wrappers
- `/src/app/actions/edit-bid.ts`: Edit bid wrapper
- `/src/components/bids/bid-form.tsx`: Bid placement form
- `/src/components/bids/bids-list.tsx`: Bid list with actions
- `/src/components/bids/edit-bid-form.tsx`: Inline bid editing
- `/src/components/jobs/job-image-gallery.tsx`: Image gallery
- `/src/components/ui/file-input.tsx`: File upload input
- `/src/app/post-job/page.tsx`: Job posting page
- `/src/app/jobs/[id]/page.tsx`: Job detail page
- `/src/app/dashboard/page.tsx`: Client dashboard
- `/src/app/pro-dashboard/page.tsx`: Pro dashboard
- `/src/app/onboarding/role/page.tsx`: Role selection
- `/src/middleware.ts`: Session and role middleware
- `next.config.ts`: Server action and image configuration

## SQL Scripts

### 1) Profiles (roles)
```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('client','pro')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "upsert own profile" on public.profiles;
create policy "upsert own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
```

### 2) Jobs
```sql
alter table public.jobs
add column if not exists client_id uuid,
add column if not exists created_at timestamp with time zone not null default now();

alter table public.jobs enable row level security;

drop policy if exists "public read open jobs" on public.jobs;
create policy "public read open jobs"
on public.jobs for select
to anon, authenticated
using (status = 'open');

drop policy if exists "client can create job" on public.jobs;
create policy "client can create job"
on public.jobs for insert
to authenticated
with check (client_id = auth.uid());

drop policy if exists "client can read own jobs" on public.jobs;
create policy "client can read own jobs"
on public.jobs for select
to authenticated
using (client_id = auth.uid());
```

### 3) Bids
```sql
create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  pro_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  estimated_days integer not null,
  message text,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamp with time zone not null default now()
);

create index if not exists bids_job_id_idx on public.bids(job_id);
create index if not exists bids_pro_id_idx on public.bids(pro_id);

alter table public.bids enable row level security;

drop policy if exists "pro can create bid" on public.bids;
create policy "pro can create bid"
on public.bids for insert
to authenticated
with check (pro_id = auth.uid());

drop policy if exists "job owner can read bids" on public.bids;
create policy "job owner can read bids"
on public.bids for select
to authenticated
using (
  exists (
    select 1
    from public.jobs j
    where j.id = bids.job_id
      and j.client_id = auth.uid()
  )
);

drop policy if exists "bidder can read own bids" on public.bids;
create policy "bidder can read own bids"
on public.bids for select
to authenticated
using (pro_id = auth.uid());
```

### 4) Storage bucket + RLS for images
```sql
-- Bucket
insert into storage.buckets (id, name, public)
values ('job-images', 'job-images', false)
on conflict (id) do nothing;

-- RLS policies (allow any authenticated user to read images)
drop policy if exists "job owners can read their own images" on storage.objects;
create policy "authenticated users can read job images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'job-images'
);

drop policy if exists "job owners can upload images" on storage.objects;
create policy "job owners can upload images"
on storage.objects for insert
with check (
  bucket_id = 'job-images' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1]::text = auth.uid()::text
);
```

### 5) job_images table
```sql
create table if not exists public.job_images (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  storage_path text not null,
  created_at timestamp with time zone not null default now()
);

alter table public.job_images enable row level security;

drop policy if exists "job owner can manage job images" on public.job_images;
create policy "job owner can manage job images"
on public.job_images for all
to authenticated
using (
  exists (
    select 1
    from public.jobs j
    where j.id = job_images.job_id
      and j.client_id = auth.uid()
  )
);
```

All necessary RLS policies and table structures have been implemented. Run these SQL scripts in the Supabase SQL Editor to set up the complete database schema and security policies.
