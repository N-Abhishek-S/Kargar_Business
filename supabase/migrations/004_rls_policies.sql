-- ============================================================
-- KARGAR BUSINESS SERVICES — PRODUCTION DATABASE
-- Phase 4: Row Level Security, Policies, Grants
-- ============================================================
-- Run AFTER 003_functions_triggers.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ENABLE RLS ON EVERY TABLE
-- ============================================================

ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_media         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_logos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_metadata         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys             ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 2. POLICIES
-- ============================================================
-- Convention:
--   "Public ..."  = anon + authenticated (no auth required)
--   "Users ..."   = authenticated users, scoped to own data
--   "Admins ..."  = admin/super_admin via is_admin()
-- ============================================================


-- ----------------------------------------------------------
-- profiles
-- ----------------------------------------------------------

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins have full access to all profiles
CREATE POLICY "Admins manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- roles
-- ----------------------------------------------------------
CREATE POLICY "Admins manage roles"
  ON public.roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- permissions
-- ----------------------------------------------------------
CREATE POLICY "Admins manage permissions"
  ON public.permissions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- role_permissions
-- ----------------------------------------------------------
CREATE POLICY "Admins manage role_permissions"
  ON public.role_permissions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- user_roles
-- ----------------------------------------------------------

-- Users can read their own role assignments
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins have full access
CREATE POLICY "Admins manage user_roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- service_categories
-- ----------------------------------------------------------

-- Public can read active categories
CREATE POLICY "Public can read active service categories"
  ON public.service_categories FOR SELECT
  USING (is_active = true);

-- Admins manage all
CREATE POLICY "Admins manage service categories"
  ON public.service_categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- services
-- ----------------------------------------------------------

-- Public can read active services
CREATE POLICY "Public can read active services"
  ON public.services FOR SELECT
  USING (is_active = true);

-- Admins manage all
CREATE POLICY "Admins manage services"
  ON public.services FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- industries
-- ----------------------------------------------------------

-- Public can read active industries
CREATE POLICY "Public can read active industries"
  ON public.industries FOR SELECT
  USING (is_active = true);

-- Admins manage all
CREATE POLICY "Admins manage industries"
  ON public.industries FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- reviews
-- ----------------------------------------------------------

-- Public can read approved, visible reviews
CREATE POLICY "Public can view approved reviews"
  ON public.reviews FOR SELECT
  USING (
    status = 'approved'
    AND deleted_at IS NULL
  );

-- Anyone can submit a review (must start as pending)
CREATE POLICY "Anyone can submit a review"
  ON public.reviews FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND deleted_at IS NULL
  );

-- Admins have full access to all reviews
CREATE POLICY "Admins manage reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- review_media
-- ----------------------------------------------------------

-- Public can read media for approved reviews
CREATE POLICY "Public can read approved review media"
  ON public.review_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = review_media.review_id
        AND r.status = 'approved'
        AND r.deleted_at IS NULL
    )
  );

-- Admins manage all review media
CREATE POLICY "Admins manage review media"
  ON public.review_media FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- review_replies
-- ----------------------------------------------------------

-- Public can read published replies on approved reviews
CREATE POLICY "Public can read published replies"
  ON public.review_replies FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = review_replies.review_id
        AND r.status = 'approved'
        AND r.deleted_at IS NULL
    )
  );

-- Admins manage all replies
CREATE POLICY "Admins manage review replies"
  ON public.review_replies FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- review_reports
-- ----------------------------------------------------------

-- Anyone can report a review
CREATE POLICY "Anyone can report reviews"
  ON public.review_reports FOR INSERT
  WITH CHECK (true);

-- Admins manage reports
CREATE POLICY "Admins manage review reports"
  ON public.review_reports FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- review_likes
-- ----------------------------------------------------------

-- Public can read likes on approved reviews
CREATE POLICY "Public can read review likes"
  ON public.review_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = review_likes.review_id
        AND r.status = 'approved'
        AND r.deleted_at IS NULL
    )
  );

-- Anyone can like an approved review
CREATE POLICY "Anyone can like approved reviews"
  ON public.review_likes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = review_likes.review_id
        AND r.status = 'approved'
        AND r.deleted_at IS NULL
    )
  );

-- Admins manage all likes
CREATE POLICY "Admins manage review likes"
  ON public.review_likes FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- client_logos
-- ----------------------------------------------------------

-- Public can read active client logos
CREATE POLICY "Public can read active client logos"
  ON public.client_logos FOR SELECT
  USING (is_active = true);

-- Admins manage all
CREATE POLICY "Admins manage client logos"
  ON public.client_logos FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- contact_messages
-- ----------------------------------------------------------

-- Anyone can submit a contact message
CREATE POLICY "Anyone can submit contact"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Admins manage all contacts
CREATE POLICY "Admins manage contacts"
  ON public.contact_messages FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- quote_requests
-- ----------------------------------------------------------

-- Anyone can submit a quote request
CREATE POLICY "Anyone can submit quote request"
  ON public.quote_requests FOR INSERT
  WITH CHECK (true);

-- Admins manage all quotes
CREATE POLICY "Admins manage quote requests"
  ON public.quote_requests FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- newsletter_subscribers
-- ----------------------------------------------------------

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Admins manage all subscribers
CREATE POLICY "Admins manage newsletter"
  ON public.newsletter_subscribers FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- faq
-- ----------------------------------------------------------

-- Public can read active FAQs
CREATE POLICY "Public can read active faq"
  ON public.faq FOR SELECT
  USING (is_active = true);

-- Admins manage all FAQs
CREATE POLICY "Admins manage faq"
  ON public.faq FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- case_studies
-- ----------------------------------------------------------

-- Public can read published case studies
CREATE POLICY "Public can read published case studies"
  ON public.case_studies FOR SELECT
  USING (
    is_published = true
    AND deleted_at IS NULL
  );

-- Admins manage all case studies
CREATE POLICY "Admins manage case studies"
  ON public.case_studies FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- settings
-- ----------------------------------------------------------

-- Public can read all settings (needed for hero, stats, etc.)
CREATE POLICY "Public can read settings"
  ON public.settings FOR SELECT
  USING (true);

-- Admins manage settings
CREATE POLICY "Admins manage settings"
  ON public.settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- seo_metadata
-- ----------------------------------------------------------

-- Public can read SEO metadata (needed for page rendering)
CREATE POLICY "Public can read seo metadata"
  ON public.seo_metadata FOR SELECT
  USING (true);

-- Admins manage SEO
CREATE POLICY "Admins manage seo metadata"
  ON public.seo_metadata FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- feature_flags
-- ----------------------------------------------------------

-- Public can read feature flags (app needs to check flags)
CREATE POLICY "Public can read feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

-- Admins manage flags
CREATE POLICY "Admins manage feature flags"
  ON public.feature_flags FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- email_logs (admin-only)
-- ----------------------------------------------------------
CREATE POLICY "Admins manage email logs"
  ON public.email_logs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- audit_logs (admin-only, read + insert)
-- ----------------------------------------------------------

-- Admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- System/triggers can insert (via SECURITY DEFINER function)
-- No direct user INSERT policy needed; the trigger function
-- runs as SECURITY DEFINER and bypasses RLS.


-- ----------------------------------------------------------
-- activity_logs (admin-only)
-- ----------------------------------------------------------
CREATE POLICY "Admins manage activity logs"
  ON public.activity_logs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- notifications
-- ----------------------------------------------------------

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins manage all notifications
CREATE POLICY "Admins manage notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------
-- api_keys (admin-only)
-- ----------------------------------------------------------
CREATE POLICY "Admins manage api keys"
  ON public.api_keys FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- 3. GRANTS
-- ============================================================
-- anon: minimal public access (read + submit forms)
-- authenticated: full table access (RLS controls actual perms)
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ---- anon: public read ----
GRANT SELECT ON public.service_categories   TO anon;
GRANT SELECT ON public.services             TO anon;
GRANT SELECT ON public.industries           TO anon;
GRANT SELECT ON public.reviews              TO anon;
GRANT SELECT ON public.review_media         TO anon;
GRANT SELECT ON public.review_replies       TO anon;
GRANT SELECT ON public.review_likes         TO anon;
GRANT SELECT ON public.client_logos         TO anon;
GRANT SELECT ON public.faq                  TO anon;
GRANT SELECT ON public.case_studies         TO anon;
GRANT SELECT ON public.settings             TO anon;
GRANT SELECT ON public.seo_metadata         TO anon;
GRANT SELECT ON public.feature_flags        TO anon;

-- ---- anon: public form submissions ----
GRANT INSERT ON public.reviews              TO anon;
GRANT INSERT ON public.contact_messages     TO anon;
GRANT INSERT ON public.quote_requests       TO anon;
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT INSERT ON public.review_reports       TO anon;
GRANT SELECT, INSERT ON public.review_likes TO anon;

-- ---- authenticated: full access (RLS is the real boundary) ----
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- ---- Grant execute on functions ----
GRANT EXECUTE ON FUNCTION public.is_admin()          TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin()    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_slug(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;


COMMIT;
