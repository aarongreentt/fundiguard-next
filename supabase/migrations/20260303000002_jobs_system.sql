-- JOB POSTING SYSTEM SCHEMA
-- Tables: jobs, job_images, bids (optional future)
-- Created for the job posting feature

-- 12. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  budget_range VARCHAR(100) NOT NULL, -- Format: "KES 1,000 - KES 5,000"
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Add missing columns to existing jobs table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'latitude') THEN
    ALTER TABLE public.jobs ADD COLUMN latitude DECIMAL(10, 8);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'longitude') THEN
    ALTER TABLE public.jobs ADD COLUMN longitude DECIMAL(11, 8);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'updated_at') THEN
    ALTER TABLE public.jobs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- 13. Job Images Table
CREATE TABLE IF NOT EXISTS public.job_images (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL,
  storage_path TEXT NOT NULL, -- Path to image in Supabase storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_images_job FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE,
  UNIQUE(job_id, storage_path)
);

-- 14. Bids Table (for future bidding system)
CREATE TABLE IF NOT EXISTS public.bids (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL,
  pro_id UUID NOT NULL,
  amount DECIMAL(15, 2),
  estimated_days INT,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bids_job FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_bids_pro FOREIGN KEY (pro_id) REFERENCES public.pro_profiles(id) ON DELETE CASCADE,
  UNIQUE(job_id, pro_id)
);

-- Add missing columns to existing bids table if they don't exist
DO $$ 
BEGIN
  -- Rename fundi_id to pro_id if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bids' AND column_name = 'fundi_id') THEN
    ALTER TABLE public.bids RENAME COLUMN fundi_id TO pro_id;
  END IF;
  -- Rename proposed_budget to amount if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bids' AND column_name = 'proposed_budget') THEN
    ALTER TABLE public.bids RENAME COLUMN proposed_budget TO amount;
  END IF;
  -- Rename proposal_text to message if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bids' AND column_name = 'proposal_text') THEN
    ALTER TABLE public.bids RENAME COLUMN proposal_text TO message;
  END IF;
END $$;

-- ========== INDEXES FOR PERFORMANCE ==========
CREATE INDEX IF NOT EXISTS idx_jobs_client ON public.jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON public.jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_job_images_job ON public.job_images(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_job ON public.bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_pro ON public.bids(pro_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);

-- ========== ROW LEVEL SECURITY POLICIES ==========

-- Enable RLS on jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow users to view all open jobs
CREATE POLICY "Anyone can view open jobs" ON public.jobs
  FOR SELECT USING (status = 'open');

-- Allow clients to view their own jobs (any status)
CREATE POLICY "Clients can view own jobs" ON public.jobs
  FOR SELECT USING (client_id = auth.uid());

-- Allow clients to insert jobs
CREATE POLICY "Clients can create jobs" ON public.jobs
  FOR INSERT WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'client'
    )
  );

-- Allow clients to update their own jobs
CREATE POLICY "Clients can update own jobs" ON public.jobs
  FOR UPDATE USING (client_id = auth.uid());

-- Allow clients to delete their own jobs
CREATE POLICY "Clients can delete own jobs" ON public.jobs
  FOR DELETE USING (client_id = auth.uid());

-- Enable RLS on job_images table
ALTER TABLE public.job_images ENABLE ROW LEVEL SECURITY;

-- Allow users to view images of open jobs
CREATE POLICY "Anyone can view open job images" ON public.job_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_images.job_id AND status = 'open'
    )
  );

-- Allow job owners to view all their job images
CREATE POLICY "Clients can view own job images" ON public.job_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_images.job_id AND client_id = auth.uid()
    )
  );

-- Allow clients to insert images for their jobs
CREATE POLICY "Clients can upload job images" ON public.job_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_images.job_id AND client_id = auth.uid()
    )
  );

-- Allow clients to delete their job images
CREATE POLICY "Clients can delete own job images" ON public.job_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_images.job_id AND client_id = auth.uid()
    )
  );

-- Enable RLS on bids table (for future use)
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Allow fundis to view bids on open jobs
CREATE POLICY "Fundis can view bids on open jobs" ON public.bids
  FOR SELECT USING (
    pro_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = bids.job_id AND client_id = auth.uid()
    )
  );

-- Allow fundis to create bids
CREATE POLICY "Fundis can create bids" ON public.bids
  FOR INSERT WITH CHECK (
    pro_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'fundi'
    ) AND
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = bids.job_id AND status = 'open'
    )
  );

-- ========== HELPER VIEWS ==========

-- Jobs with image count
CREATE OR REPLACE VIEW jobs_with_image_count AS
SELECT 
  j.id,
  j.client_id,
  j.title,
  j.description,
  j.category,
  j.location,
  j.latitude,
  j.longitude,
  j.budget_range,
  j.status,
  j.created_at,
  j.updated_at,
  COUNT(i.id) as image_count
FROM public.jobs j
LEFT JOIN public.job_images i ON j.id = i.job_id
GROUP BY j.id;

-- Jobs with bid count
CREATE OR REPLACE VIEW jobs_with_bid_count AS
SELECT 
  j.id,
  j.client_id,
  j.title,
  j.category,
  j.location,
  j.latitude,
  j.longitude,
  j.budget_range,
  j.status,
  j.created_at,
  COUNT(b.id) as bid_count,
  COUNT(CASE WHEN b.status = 'accepted' THEN 1 END) as accepted_bids
FROM public.jobs j
LEFT JOIN public.bids b ON j.id = b.job_id
GROUP BY j.id;

-- ========== COMMENTS FOR DOCUMENTATION ==========
COMMENT ON TABLE public.jobs IS 'Stores job postings from clients. Status: open, in_progress, completed, cancelled, closed';
COMMENT ON TABLE public.job_images IS 'Stores image references for jobs uploaded to Supabase storage';
COMMENT ON TABLE public.bids IS 'Stores bid proposals from fundis on job postings';
COMMENT ON COLUMN public.jobs.budget_range IS 'Formatted as string: "KES 1,000 - KES 5,000" for display purposes';
COMMENT ON COLUMN public.job_images.storage_path IS 'Path in Supabase storage bucket job-images, format: {user-id}/{job-id}/{filename}';
