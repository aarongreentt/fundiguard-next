-- Enable RLS on profiles table and add read policies
-- This migration ensures users can read their own profile data

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Allow users to read their own profile
CREATE POLICY "profiles_read_own" ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to read any public profile (for browsing)
CREATE POLICY "profiles_read_public" ON public.profiles FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (during signup)
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "profiles_read_own" ON public.profiles IS 'Users can read their own profile';
COMMENT ON POLICY "profiles_read_public" ON public.profiles IS 'Anyone can read public profiles (for browsing)';
COMMENT ON POLICY "profiles_update_own" ON public.profiles IS 'Users can update their own profile';
COMMENT ON POLICY "profiles_insert_own" ON public.profiles IS 'Users can create their own profile';
