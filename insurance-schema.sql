-- Create insurance_policies table
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  start_date DATE,
  expiry_date DATE NOT NULL,
  coverage_amount BIGINT NOT NULL,
  certificate_url TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (verification_status IN ('verified', 'pending', 'expired', 'rejected')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, policy_number)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_insurance_policies_user_id ON public.insurance_policies(user_id);

-- Create index on verification_status for filtering
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON public.insurance_policies(verification_status);

-- Create index on expiry_date for checking active policies
CREATE INDEX IF NOT EXISTS idx_insurance_policies_expiry ON public.insurance_policies(expiry_date);

-- Enable RLS on insurance_policies table
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own policies
CREATE POLICY "Users can view their own insurance policies"
  ON public.insurance_policies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own policies
CREATE POLICY "Users can insert their own insurance policies"
  ON public.insurance_policies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own policies
CREATE POLICY "Users can update their own insurance policies"
  ON public.insurance_policies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own policies
CREATE POLICY "Users can delete their own insurance policies"
  ON public.insurance_policies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a view for active policies (optional but useful)
CREATE OR REPLACE VIEW public.active_insurance_policies AS
SELECT * 
FROM public.insurance_policies
WHERE verification_status = 'verified' 
  AND expiry_date > CURRENT_DATE
ORDER BY expiry_date DESC;

-- Create a view for user's total coverage
CREATE OR REPLACE VIEW public.user_total_coverage AS
SELECT 
  user_id,
  SUM(CASE WHEN verification_status = 'verified' AND expiry_date > CURRENT_DATE 
    THEN coverage_amount 
    ELSE 0 
  END) as total_active_coverage,
  COUNT(CASE WHEN verification_status = 'verified' AND expiry_date > CURRENT_DATE 
    THEN 1 
  END) as active_policy_count
FROM public.insurance_policies
GROUP BY user_id;
