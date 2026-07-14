-- ============================================================
-- KARGAR BUSINESS SERVICES — PRODUCTION DATABASE
-- Phase 7: Admin Users Authorization Table
-- ============================================================

BEGIN;

-- ----------------------------------------------------------
-- 1. Create admin_users table
-- This replaces the reliance on JWT app_metadata for admin rights.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------
-- 2. Add triggers for updated_at and audit_logs
-- ----------------------------------------------------------
CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_audit_admin_users
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- ----------------------------------------------------------
-- 3. Row Level Security (RLS)
-- ----------------------------------------------------------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can read the table to see their own status and others
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users FOR SELECT
  USING (public.is_admin());

-- Only super admins can insert/update/delete admin_users
CREATE POLICY "Super admins can manage admin_users"
  ON public.admin_users FOR ALL
  USING (public.is_super_admin());

COMMIT;
