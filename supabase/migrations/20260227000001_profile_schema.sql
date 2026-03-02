-- FULL SCHEMA MIGRATION - INCREMENTALLY BUILT
-- All 11 tables, indexes, and constraints

-- 1. Extended Profiles Table (TESTED - WORKS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(255),
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) CHECK (role IN ('client', 'fundi')),
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(255),
  private_profile BOOLEAN DEFAULT FALSE,
  show_phone BOOLEAN DEFAULT TRUE,
  show_email BOOLEAN DEFAULT FALSE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Fundi (Professional) Profile Table
CREATE TABLE IF NOT EXISTS public.pro_profiles (
  id UUID PRIMARY KEY,
  hourly_rate DECIMAL(10, 2),
  experience_years INT CHECK (experience_years >= 0 AND experience_years <= 60),
  average_rating DECIMAL(3, 2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_reviews INT DEFAULT 0,
  total_jobs_completed INT DEFAULT 0,
  is_pro BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(20) DEFAULT 'not_started' CHECK (verification_status IN ('not_started', 'pending', 'verified', 'rejected')),
  verification_submitted_at TIMESTAMP WITH TIME ZONE,
  verification_approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  service_latitude DECIMAL(10, 8),
  service_longitude DECIMAL(11, 8),
  service_radius_km INT DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Client Profile Table
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY,
  preferred_budget_min DECIMAL(10, 2),
  preferred_budget_max DECIMAL(10, 2),
  preferred_categories JSONB DEFAULT '[]'::jsonb,
  total_jobs_posted INT DEFAULT 0,
  total_spent DECIMAL(15, 2) DEFAULT 0,
  average_rating_given DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Specialties Table
CREATE TABLE IF NOT EXISTS public.specialties (
  id BIGSERIAL PRIMARY KEY,
  fundi_id UUID NOT NULL,
  specialty VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(fundi_id, specialty)
);

-- 5. Service Areas Table
CREATE TABLE IF NOT EXISTS public.service_areas (
  id BIGSERIAL PRIMARY KEY,
  fundi_id UUID NOT NULL,
  area_name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(fundi_id, area_name)
);

-- 6. Portfolio Table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id BIGSERIAL PRIMARY KEY,
  fundi_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGSERIAL PRIMARY KEY,
  reviewer_id UUID NOT NULL,
  reviewed_id UUID NOT NULL,
  job_id BIGINT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT no_self_review CHECK (reviewer_id != reviewed_id)
);

-- 8. Saved Fundis Table (Client's Favorites)
CREATE TABLE IF NOT EXISTS public.saved_fundis (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL,
  fundi_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, fundi_id)
);

-- 9. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_categories JSONB DEFAULT '[]'::jsonb,
  preferred_locations JSONB DEFAULT '[]'::jsonb,
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(3) DEFAULT 'KES',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Verification Documents Table
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id BIGSERIAL PRIMARY KEY,
  fundi_id UUID NOT NULL,
  doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('identity', 'police_clearance', 'address')),
  document_url TEXT NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verification_date TIMESTAMP WITH TIME ZONE,
  is_approved BOOLEAN,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Profile Completion Status Table
CREATE TABLE IF NOT EXISTS public.profile_completion_status (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID NOT NULL UNIQUE,
  completed_fields JSONB DEFAULT '{}'::jsonb,
  completion_percentage INT DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== FOREIGN KEY CONSTRAINTS (added after all tables exist) ==========
ALTER TABLE public.pro_profiles ADD CONSTRAINT fk_pro_profiles_profiles FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.client_profiles ADD CONSTRAINT fk_client_profiles_profiles FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.specialties ADD CONSTRAINT fk_specialties_pro_profiles FOREIGN KEY (fundi_id) REFERENCES public.pro_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.service_areas ADD CONSTRAINT fk_service_areas_pro_profiles FOREIGN KEY (fundi_id) REFERENCES public.pro_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.portfolio_items ADD CONSTRAINT fk_portfolio_pro_profiles FOREIGN KEY (fundi_id) REFERENCES public.pro_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.verification_documents ADD CONSTRAINT fk_verification_pro_profiles FOREIGN KEY (fundi_id) REFERENCES public.pro_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.reviews ADD CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.reviews ADD CONSTRAINT fk_reviews_reviewed FOREIGN KEY (reviewed_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.saved_fundis ADD CONSTRAINT fk_saved_fundis_client FOREIGN KEY (client_id) REFERENCES public.client_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.saved_fundis ADD CONSTRAINT fk_saved_fundis_fundi FOREIGN KEY (fundi_id) REFERENCES public.pro_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_preferences ADD CONSTRAINT fk_user_preferences_profiles FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.profile_completion_status ADD CONSTRAINT fk_profile_completion_status_profiles FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_pro_profiles_verification ON public.pro_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_pro_profiles_is_pro ON public.pro_profiles(is_pro);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON public.reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_fundis_client ON public.saved_fundis(client_id);
CREATE INDEX IF NOT EXISTS idx_saved_fundis_fundi ON public.saved_fundis(fundi_id);
CREATE INDEX IF NOT EXISTS idx_specialties_fundi ON public.specialties(fundi_id);
CREATE INDEX IF NOT EXISTS idx_service_areas_fundi ON public.service_areas(fundi_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_fundi ON public.portfolio_items(fundi_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_fundi ON public.verification_documents(fundi_id);
CREATE INDEX IF NOT EXISTS idx_preferences_user ON public.user_preferences(user_id);

-- ========== ROW LEVEL SECURITY ==========
-- RLS policies disabled for now - will be applied separately
-- to avoid transaction timing issues with table creation
