-- Migration: Profiles and Role-Based Access Control (RBAC)
-- Enforces the OS Database Standards (UUIDs, RLS, audit timestamps)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------------------------------
-- 1. PROFILES
-------------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id AND is_deleted = FALSE);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id AND is_deleted = FALSE)
  WITH CHECK (auth.uid() = id AND is_deleted = FALSE);

-------------------------------------------------------------------------------
-- 2. ROLE PERMISSIONS
-------------------------------------------------------------------------------
-- Defines the roles (e.g., 'mentor', 'student', 'admin')
CREATE TABLE public.role_permissions (
  role_name TEXT PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Permissions are globally readable by authenticated users so they can check access
CREATE POLICY "Role permissions are readable by all authenticated users"
  ON public.role_permissions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Seed default roles
INSERT INTO public.role_permissions (role_name, description) VALUES
  ('admin', 'Platform Administrator'),
  ('mentor', 'Approved Mentor'),
  ('student', 'Platform Student')
ON CONFLICT DO NOTHING;

-------------------------------------------------------------------------------
-- 3. USER ROLES (The join table driving RLS)
-------------------------------------------------------------------------------
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL REFERENCES public.role_permissions(role_name) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role_name)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see their own roles.
-- (Admins will be able to see all roles via a secure RPC or Edge Function bypassing RLS)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- HELPER FUNCTIONS
-------------------------------------------------------------------------------
-- Automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
