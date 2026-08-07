-- Migration: Mentor Profiles and Lifecycle State Machine
-- Enforces Domain-Driven Design constraints and OS Database Standards

-------------------------------------------------------------------------------
-- 1. ENUMS (Domain Lifecycle)
-------------------------------------------------------------------------------
CREATE TYPE mentor_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'suspended',
  'archived'
);

-------------------------------------------------------------------------------
-- 2. MENTOR PROFILES (The Aggregate Root)
-------------------------------------------------------------------------------
CREATE TABLE public.mentor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Core Domain Data
  bio TEXT,
  headline TEXT,
  hourly_rate DECIMAL(10,2),
  
  -- Lifecycle State Machine tracking
  status mentor_status NOT NULL DEFAULT 'draft',
  
  -- Audit & Tracking
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

-- Indexes for performance (search/filtering)
CREATE INDEX idx_mentor_profiles_status ON public.mentor_profiles(status);

-- RLS: Public can ONLY view approved mentors
CREATE POLICY "Public can view approved mentors"
  ON public.mentor_profiles FOR SELECT
  USING (status = 'approved' AND is_deleted = FALSE);

-- RLS: Mentors can view their own profile regardless of status
CREATE POLICY "Users can view their own mentor profile"
  ON public.mentor_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: Only the user can update their profile, but NOT the status (which requires a Command via Edge Function)
-- We enforce this at the application/API layer but provide a base RLS policy here.
CREATE POLICY "Users can update their own mentor profile"
  ON public.mentor_profiles FOR UPDATE
  USING (auth.uid() = user_id AND is_deleted = FALSE);
-- Note: Security boundary around changing status to 'approved' is enforced by the Edge Function running under SERVICE_ROLE.

-------------------------------------------------------------------------------
-- 3. MENTOR SKILLS (Sub-entity)
-------------------------------------------------------------------------------
CREATE TABLE public.mentor_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  years_experience INTEGER CHECK (years_experience >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id, skill_name)
);

ALTER TABLE public.mentor_skills ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_mentor_skills_skill ON public.mentor_skills(skill_name);

-- Public can view skills of approved mentors
CREATE POLICY "Public can view skills of approved mentors"
  ON public.mentor_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.id = mentor_skills.mentor_id AND mp.status = 'approved'
    )
  );

-- Users can view their own skills
CREATE POLICY "Users can view own skills"
  ON public.mentor_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.id = mentor_skills.mentor_id AND mp.user_id = auth.uid()
    )
  );

-- Users can insert their own skills
CREATE POLICY "Users can insert own skills"
  ON public.mentor_skills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.id = mentor_skills.mentor_id AND mp.user_id = auth.uid()
    )
  );

-- Users can delete their own skills
CREATE POLICY "Users can delete own skills"
  ON public.mentor_skills FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.id = mentor_skills.mentor_id AND mp.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_mentor_profiles_modtime
BEFORE UPDATE ON public.mentor_profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
