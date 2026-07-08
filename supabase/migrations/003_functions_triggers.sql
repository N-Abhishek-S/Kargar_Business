-- ============================================================
-- KARGAR BUSINESS SERVICES — PRODUCTION DATABASE
-- Phase 3: Functions & Triggers
-- Auth · Timestamps · Audit · Slug · Review status sync
-- ============================================================
-- Run AFTER 002_indexes.sql
-- ============================================================

BEGIN;

-- ============================================================
-- UTILITY FUNCTIONS
-- ============================================================


-- ----------------------------------------------------------
-- update_updated_at_column()
-- Generic trigger function: sets updated_at = now()
-- on every UPDATE. Attached to all tables with updated_at.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ----------------------------------------------------------
-- generate_slug(input TEXT)
-- Converts arbitrary text into a URL-safe slug.
-- Uses unaccent to strip diacritics, then lowercases,
-- removes non-alphanumeric characters, and collapses
-- whitespace/hyphens into single hyphens.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_slug(input TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(BOTH '-' FROM
    lower(
      regexp_replace(
        regexp_replace(
          unaccent(trim(COALESCE(input, ''))),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '[\s-]+', '-', 'g'
      )
    )
  );
$$;


-- ============================================================
-- AUTHENTICATION FUNCTIONS
-- ============================================================


-- ----------------------------------------------------------
-- is_admin()
-- Returns true when the current request is made by:
--   1. The service_role (backend server), OR
--   2. A user whose JWT app_metadata.role is admin/super_admin
-- Used in RLS policies for admin-gated tables.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.role() = 'service_role'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'),
    false
  );
$$;


-- ----------------------------------------------------------
-- is_super_admin()
-- Stricter check: only super_admin role.
-- Used for destructive operations (delete users, etc.)
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.role() = 'service_role'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin',
    false
  );
$$;


-- ----------------------------------------------------------
-- handle_new_user()
-- Trigger function: auto-creates a profile row when a new
-- user signs up via Supabase Auth. Reads name and avatar
-- from the raw_user_meta_data JSON provided by OAuth/signup.
-- SECURITY DEFINER to bypass RLS during profile creation.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'display_name'
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists (e.g. re-confirmation); silently skip.
    RETURN NEW;
END;
$$;


-- ============================================================
-- REVIEW FUNCTIONS
-- ============================================================


-- ----------------------------------------------------------
-- handle_review_status_change()
-- Trigger function: syncs approved_at timestamp whenever
-- the review status changes to/from 'approved'.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_review_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    -- Preserve existing approved_at if re-saving an approved review
    NEW.approved_at := COALESCE(NEW.approved_at, now());
  ELSE
    -- Clear approval timestamp when status is not approved
    NEW.approved_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;


-- ============================================================
-- AUDIT FUNCTIONS
-- ============================================================


-- ----------------------------------------------------------
-- log_audit_event()
-- Generic trigger function that captures every INSERT,
-- UPDATE, and DELETE into the audit_logs table.
-- Computes changed_fields array for UPDATEs.
-- SECURITY DEFINER so it can always write to audit_logs.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old_data    JSONB;
  _new_data    JSONB;
  _changed     TEXT[];
  _record_id   UUID;
  _performed   UUID;
BEGIN
  -- Attempt to identify the acting user (NULL for service_role/system)
  BEGIN
    _performed := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    _performed := NULL;
  END;

  IF TG_OP = 'DELETE' THEN
    _old_data  := to_jsonb(OLD);
    _record_id := OLD.id;

    INSERT INTO public.audit_logs
      (table_name, record_id, action, old_data, performed_by)
    VALUES
      (TG_TABLE_NAME, _record_id, 'DELETE', _old_data, _performed);

    RETURN OLD;

  ELSIF TG_OP = 'INSERT' THEN
    _new_data  := to_jsonb(NEW);
    _record_id := NEW.id;

    INSERT INTO public.audit_logs
      (table_name, record_id, action, new_data, performed_by)
    VALUES
      (TG_TABLE_NAME, _record_id, 'INSERT', _new_data, _performed);

    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    _old_data  := to_jsonb(OLD);
    _new_data  := to_jsonb(NEW);
    _record_id := NEW.id;

    -- Compute which top-level keys actually changed
    SELECT array_agg(n.key) INTO _changed
    FROM jsonb_each(_new_data) AS n(key, value)
    WHERE _old_data -> n.key IS DISTINCT FROM n.value;

    -- Skip audit if nothing meaningful changed
    IF _changed IS NULL OR array_length(_changed, 1) IS NULL THEN
      RETURN NEW;
    END IF;

    INSERT INTO public.audit_logs
      (table_name, record_id, action, old_data, new_data, changed_fields, performed_by)
    VALUES
      (TG_TABLE_NAME, _record_id, 'UPDATE', _old_data, _new_data, _changed, _performed);

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;


-- ----------------------------------------------------------
-- get_dashboard_stats()
-- Returns aggregated metrics for the admin dashboard.
-- Single call replaces multiple queries.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_reviews',    (SELECT count(*) FROM reviews WHERE deleted_at IS NULL),
    'pending_reviews',  (SELECT count(*) FROM reviews WHERE status = 'pending' AND deleted_at IS NULL),
    'approved_reviews', (SELECT count(*) FROM reviews WHERE status = 'approved' AND deleted_at IS NULL),
    'average_rating',   (SELECT COALESCE(round(avg(rating)::numeric, 1), 0) FROM reviews WHERE status = 'approved' AND deleted_at IS NULL),
    'total_contacts',   (SELECT count(*) FROM contact_messages),
    'new_contacts',     (SELECT count(*) FROM contact_messages WHERE status = 'new'),
    'total_quotes',     (SELECT count(*) FROM quote_requests),
    'new_quotes',       (SELECT count(*) FROM quote_requests WHERE status = 'new'),
    'total_subscribers',(SELECT count(*) FROM newsletter_subscribers WHERE is_active = true),
    'total_clients',    (SELECT count(*) FROM client_logos WHERE is_active = true)
  ) INTO _result;

  RETURN _result;
END;
$$;


-- ============================================================
-- TRIGGERS — updated_at
-- ============================================================
-- Attach the generic updated_at trigger to every table
-- that has an updated_at column.
-- ============================================================

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_industries_updated_at
  BEFORE UPDATE ON public.industries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_review_replies_updated_at
  BEFORE UPDATE ON public.review_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_review_reports_updated_at
  BEFORE UPDATE ON public.review_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_client_logos_updated_at
  BEFORE UPDATE ON public.client_logos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_faq_updated_at
  BEFORE UPDATE ON public.faq
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_case_studies_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_seo_metadata_updated_at
  BEFORE UPDATE ON public.seo_metadata
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- TRIGGERS — Auth
-- ============================================================

-- Auto-create profile when a new user signs up via Supabase Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- TRIGGERS — Review status sync
-- ============================================================

-- Sync approved_at when review status changes
CREATE TRIGGER trg_reviews_status_sync
  BEFORE INSERT OR UPDATE OF status ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_review_status_change();


-- ============================================================
-- TRIGGERS — Audit logging
-- ============================================================
-- Attached to all admin-managed tables for full change tracking.
-- ============================================================

CREATE TRIGGER trg_audit_reviews
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_services
  AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_service_categories
  AFTER INSERT OR UPDATE OR DELETE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_client_logos
  AFTER INSERT OR UPDATE OR DELETE ON public.client_logos
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_faq
  AFTER INSERT OR UPDATE OR DELETE ON public.faq
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_case_studies
  AFTER INSERT OR UPDATE OR DELETE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_contact_messages
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_quote_requests
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_industries
  AFTER INSERT OR UPDATE OR DELETE ON public.industries
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_feature_flags
  AFTER INSERT OR UPDATE OR DELETE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_seo_metadata
  AFTER INSERT OR UPDATE OR DELETE ON public.seo_metadata
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();


COMMIT;
