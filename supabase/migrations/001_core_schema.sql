-- ============================================================
-- KARGAR BUSINESS SERVICES — PRODUCTION DATABASE
-- Phase 1: Core Schema
-- Extensions · ENUMs · Tables · Constraints · Foreign Keys
-- ============================================================
-- Target: Fresh, empty Supabase project.
-- Run this file FIRST in the Supabase SQL Editor.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- 2. ENUM TYPES
-- ============================================================

-- RBAC role hierarchy
CREATE TYPE public.user_role AS ENUM (
  'viewer',
  'editor',
  'moderator',
  'admin',
  'super_admin'
);

-- Review moderation workflow
CREATE TYPE public.review_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'spam',
  'archived'
);

-- Contact inquiry lifecycle
CREATE TYPE public.contact_status AS ENUM (
  'new',
  'in_progress',
  'resolved',
  'closed'
);

-- Urgency classification
CREATE TYPE public.priority_level AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Quote/proposal pipeline stages
CREATE TYPE public.quote_request_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'negotiating',
  'won',
  'lost',
  'expired'
);

-- Outgoing email delivery states
CREATE TYPE public.email_log_status AS ENUM (
  'queued',
  'sent',
  'delivered',
  'bounced',
  'failed'
);

-- Audit trail operations
CREATE TYPE public.audit_action AS ENUM (
  'INSERT',
  'UPDATE',
  'DELETE'
);

-- Uploaded file classifications
CREATE TYPE public.media_category AS ENUM (
  'profile_image',
  'company_logo',
  'review_image',
  'case_study_image',
  'blog_image',
  'document',
  'general'
);

-- In-app notification severity
CREATE TYPE public.notification_type AS ENUM (
  'info',
  'warning',
  'success',
  'error',
  'system'
);

-- ============================================================
-- 3. TABLES
-- ============================================================
-- Created in foreign-key dependency order.
-- Independent tables first, then dependent tables.
-- ============================================================


-- ----------------------------------------------------------
-- profiles
-- ----------------------------------------------------------
-- Extends Supabase Auth. Every authenticated user gets
-- exactly one profile, auto-created by trigger on signup.
-- PK mirrors auth.users.id for zero-cost lookups.
-- ----------------------------------------------------------
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  avatar_url      TEXT,
  phone           TEXT,
  bio             TEXT,
  role            public.user_role NOT NULL DEFAULT 'viewer',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  metadata        JSONB NOT NULL DEFAULT '{}',
  last_sign_in_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,

  CONSTRAINT profiles_full_name_length
    CHECK (full_name IS NULL OR length(trim(full_name)) BETWEEN 2 AND 150),
  CONSTRAINT profiles_phone_format
    CHECK (phone IS NULL OR phone ~ '^\+?[\d\s\-\(\)]{7,20}$'),
  CONSTRAINT profiles_bio_length
    CHECK (bio IS NULL OR length(bio) <= 1000)
);

COMMENT ON TABLE public.profiles IS
  'User profiles linked 1:1 to Supabase Auth. Auto-created on signup via trigger.';


-- ----------------------------------------------------------
-- roles
-- ----------------------------------------------------------
-- Named role definitions for the RBAC system.
-- Extensible TEXT names allow custom roles beyond the enum.
-- ----------------------------------------------------------
CREATE TABLE public.roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT roles_name_not_blank
    CHECK (length(trim(name)) > 0),
  CONSTRAINT roles_name_format
    CHECK (name ~ '^[a-z][a-z0-9_]*$')
);

COMMENT ON TABLE public.roles IS
  'RBAC role definitions with extensible naming.';


-- ----------------------------------------------------------
-- permissions
-- ----------------------------------------------------------
-- Granular action + resource pairs.
-- Example: action="update", resource="reviews"
-- ----------------------------------------------------------
CREATE TABLE public.permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action      TEXT NOT NULL,
  resource    TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT permissions_action_not_blank
    CHECK (length(trim(action)) > 0),
  CONSTRAINT permissions_resource_not_blank
    CHECK (length(trim(resource)) > 0),
  CONSTRAINT permissions_unique_pair
    UNIQUE (action, resource)
);

COMMENT ON TABLE public.permissions IS
  'Granular RBAC permissions as action + resource pairs.';


-- ----------------------------------------------------------
-- role_permissions (junction)
-- ----------------------------------------------------------
CREATE TABLE public.role_permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id       UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT role_permissions_unique
    UNIQUE (role_id, permission_id)
);

COMMENT ON TABLE public.role_permissions IS
  'Junction: maps roles to their allowed permissions.';


-- ----------------------------------------------------------
-- user_roles
-- ----------------------------------------------------------
-- Assigns roles to users. Supports multiple roles per user.
-- ----------------------------------------------------------
CREATE TABLE public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT user_roles_unique_active
    UNIQUE (user_id, role_id)
);

COMMENT ON TABLE public.user_roles IS
  'User-to-role assignments with grant/revoke audit trail.';


-- ----------------------------------------------------------
-- service_categories
-- ----------------------------------------------------------
-- Top-level groupings: Soft Services, Hard Services, Support.
-- ----------------------------------------------------------
CREATE TABLE public.service_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  icon          TEXT,
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT service_categories_name_not_blank
    CHECK (length(trim(name)) > 0),
  CONSTRAINT service_categories_slug_format
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT service_categories_display_order_valid
    CHECK (display_order >= 0)
);

COMMENT ON TABLE public.service_categories IS
  'Top-level service groupings: Soft Services, Hard Services, Support.';


-- ----------------------------------------------------------
-- services
-- ----------------------------------------------------------
-- Individual service offerings grouped by category.
-- ----------------------------------------------------------
CREATE TABLE public.services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  icon          TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order SMALLINT NOT NULL DEFAULT 0,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT services_name_not_blank
    CHECK (length(trim(name)) > 0),
  CONSTRAINT services_slug_format
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT services_display_order_valid
    CHECK (display_order >= 0)
);

COMMENT ON TABLE public.services IS
  'Service offerings (Cleaning, Security, HVAC, etc.) grouped by category.';


-- ----------------------------------------------------------
-- industries
-- ----------------------------------------------------------
-- Sectors the company serves.
-- ----------------------------------------------------------
CREATE TABLE public.industries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  icon          TEXT,
  image_url     TEXT,
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT industries_name_not_blank
    CHECK (length(trim(name)) > 0),
  CONSTRAINT industries_slug_format
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT industries_display_order_valid
    CHECK (display_order >= 0)
);

COMMENT ON TABLE public.industries IS
  'Business sectors served: IT Parks, Manufacturing, Airport Lounges, Corporate Offices.';


-- ----------------------------------------------------------
-- reviews
-- ----------------------------------------------------------
-- Client reviews and testimonials. Core feature of the
-- platform with full moderation workflow, featuring, and
-- soft-delete support.
-- ----------------------------------------------------------
CREATE TABLE public.reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name     TEXT NOT NULL,
  company_name      TEXT,
  email             TEXT NOT NULL,
  phone             TEXT,
  service_id        UUID REFERENCES public.services(id) ON DELETE SET NULL,
  location          TEXT,
  rating            SMALLINT NOT NULL,
  review_title      TEXT NOT NULL,
  review_text       TEXT NOT NULL,
  recommend         BOOLEAN NOT NULL DEFAULT true,
  profile_image_url TEXT,
  company_logo_url  TEXT,
  status            public.review_status NOT NULL DEFAULT 'pending',
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  display_order     SMALLINT NOT NULL DEFAULT 0,
  approved_at       TIMESTAMPTZ,
  approved_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_hash           TEXT,
  browser_info      TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,

  CONSTRAINT reviews_rating_range
    CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_customer_name_length
    CHECK (length(trim(customer_name)) BETWEEN 2 AND 120),
  CONSTRAINT reviews_email_format
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT reviews_email_length
    CHECK (length(trim(email)) BETWEEN 3 AND 160),
  CONSTRAINT reviews_title_length
    CHECK (length(trim(review_title)) BETWEEN 4 AND 140),
  CONSTRAINT reviews_text_length
    CHECK (length(trim(review_text)) BETWEEN 20 AND 2000),
  CONSTRAINT reviews_display_order_range
    CHECK (display_order BETWEEN 0 AND 10000)
);

COMMENT ON TABLE public.reviews IS
  'Client reviews/testimonials with moderation workflow, featuring, and soft-delete.';


-- ----------------------------------------------------------
-- review_media
-- ----------------------------------------------------------
-- Images and files attached to reviews.
-- ----------------------------------------------------------
CREATE TABLE public.review_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id    UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  bucket       TEXT NOT NULL,
  path         TEXT NOT NULL,
  public_url   TEXT NOT NULL,
  media_type   public.media_category NOT NULL,
  content_type TEXT NOT NULL,
  file_size    INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT review_media_unique_path UNIQUE (bucket, path),
  CONSTRAINT review_media_file_size_valid
    CHECK (file_size > 0 AND file_size <= 5242880),
  CONSTRAINT review_media_content_type_not_blank
    CHECK (length(trim(content_type)) > 0)
);

COMMENT ON TABLE public.review_media IS
  'Media files (profile photos, company logos) uploaded with reviews.';


-- ----------------------------------------------------------
-- review_replies
-- ----------------------------------------------------------
-- Official admin/moderator replies to reviews.
-- ----------------------------------------------------------
CREATE TABLE public.review_replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'published',
  replied_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  replied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT review_replies_text_length
    CHECK (length(trim(reply_text)) BETWEEN 2 AND 1200),
  CONSTRAINT review_replies_status_valid
    CHECK (status IN ('draft', 'published', 'hidden'))
);

COMMENT ON TABLE public.review_replies IS
  'Official admin/moderator replies to client reviews.';


-- ----------------------------------------------------------
-- review_reports
-- ----------------------------------------------------------
-- Abuse/spam reports filed by visitors against reviews.
-- ----------------------------------------------------------
CREATE TABLE public.review_reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id      UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reporter_email TEXT,
  reason         TEXT NOT NULL,
  details        TEXT,
  status         TEXT NOT NULL DEFAULT 'open',
  ip_hash        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT review_reports_reason_valid
    CHECK (reason IN ('spam', 'abuse', 'false_information', 'privacy', 'other')),
  CONSTRAINT review_reports_status_valid
    CHECK (status IN ('open', 'reviewed', 'dismissed'))
);

COMMENT ON TABLE public.review_reports IS
  'Visitor-submitted reports for inappropriate or abusive reviews.';


-- ----------------------------------------------------------
-- review_likes
-- ----------------------------------------------------------
-- Helpful/like votes on approved reviews (one per IP).
-- ----------------------------------------------------------
CREATE TABLE public.review_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  ip_hash    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT review_likes_unique_vote UNIQUE (review_id, ip_hash)
);

COMMENT ON TABLE public.review_likes IS
  'One-per-IP helpful/like votes on approved reviews.';


-- ----------------------------------------------------------
-- client_logos
-- ----------------------------------------------------------
-- Trusted client logos displayed on the homepage carousel.
-- ----------------------------------------------------------
CREATE TABLE public.client_logos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name  TEXT NOT NULL,
  logo_url      TEXT NOT NULL,
  alt_text      TEXT NOT NULL,
  website       TEXT,
  industry      TEXT,
  priority      SMALLINT NOT NULL DEFAULT 0,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT client_logos_company_name_not_blank
    CHECK (length(trim(company_name)) > 0),
  CONSTRAINT client_logos_logo_url_not_blank
    CHECK (length(trim(logo_url)) > 0),
  CONSTRAINT client_logos_alt_text_not_blank
    CHECK (length(trim(alt_text)) > 0),
  CONSTRAINT client_logos_priority_valid
    CHECK (priority >= 0),
  CONSTRAINT client_logos_display_order_valid
    CHECK (display_order >= 0)
);

COMMENT ON TABLE public.client_logos IS
  'Client/partner logos for the trusted clients carousel.';


-- ----------------------------------------------------------
-- contact_messages
-- ----------------------------------------------------------
-- Submissions from the public contact form.
-- ----------------------------------------------------------
CREATE TABLE public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  company     TEXT,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      public.contact_status NOT NULL DEFAULT 'new',
  priority    public.priority_level NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes       TEXT,
  ip_hash     TEXT,
  source      TEXT NOT NULL DEFAULT 'website',
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT contact_messages_name_length
    CHECK (length(trim(name)) BETWEEN 2 AND 100),
  CONSTRAINT contact_messages_email_format
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT contact_messages_email_length
    CHECK (length(trim(email)) BETWEEN 3 AND 160),
  CONSTRAINT contact_messages_subject_length
    CHECK (length(trim(subject)) BETWEEN 5 AND 200),
  CONSTRAINT contact_messages_message_length
    CHECK (length(trim(message)) BETWEEN 10 AND 5000)
);

COMMENT ON TABLE public.contact_messages IS
  'Contact form submissions with status workflow and priority assignment.';


-- ----------------------------------------------------------
-- quote_requests
-- ----------------------------------------------------------
-- "Request Proposal" submissions. Separated from contacts
-- because they carry structured business qualification data.
-- ----------------------------------------------------------
CREATE TABLE public.quote_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  company           TEXT,
  service_id        UUID REFERENCES public.services(id) ON DELETE SET NULL,
  industry_id       UUID REFERENCES public.industries(id) ON DELETE SET NULL,
  site_count        SMALLINT,
  employee_count    INTEGER,
  budget_range      TEXT,
  message           TEXT,
  preferred_contact TEXT NOT NULL DEFAULT 'email',
  status            public.quote_request_status NOT NULL DEFAULT 'new',
  priority          public.priority_level NOT NULL DEFAULT 'medium',
  assigned_to       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes             TEXT,
  source            TEXT NOT NULL DEFAULT 'website',
  ip_hash           TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT quote_requests_name_length
    CHECK (length(trim(name)) BETWEEN 2 AND 100),
  CONSTRAINT quote_requests_email_format
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT quote_requests_preferred_contact_valid
    CHECK (preferred_contact IN ('email', 'phone', 'whatsapp')),
  CONSTRAINT quote_requests_site_count_valid
    CHECK (site_count IS NULL OR site_count > 0),
  CONSTRAINT quote_requests_employee_count_valid
    CHECK (employee_count IS NULL OR employee_count > 0)
);

COMMENT ON TABLE public.quote_requests IS
  'Structured proposal/quote requests from the "Request Proposal" CTA.';


-- ----------------------------------------------------------
-- newsletter_subscribers
-- ----------------------------------------------------------
CREATE TABLE public.newsletter_subscribers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  source          TEXT NOT NULL DEFAULT 'website',
  ip_hash         TEXT,
  subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT newsletter_subscribers_email_format
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

COMMENT ON TABLE public.newsletter_subscribers IS
  'Newsletter email subscriptions with subscribe/unsubscribe tracking.';


-- ----------------------------------------------------------
-- faq
-- ----------------------------------------------------------
-- Frequently asked questions, admin-managed, public-facing.
-- ----------------------------------------------------------
CREATE TABLE public.faq (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question      TEXT NOT NULL,
  answer        TEXT NOT NULL,
  category      TEXT,
  slug          TEXT UNIQUE,
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT faq_question_length
    CHECK (length(trim(question)) BETWEEN 10 AND 300),
  CONSTRAINT faq_answer_length
    CHECK (length(trim(answer)) BETWEEN 20 AND 5000),
  CONSTRAINT faq_display_order_valid
    CHECK (display_order >= 0)
);

COMMENT ON TABLE public.faq IS
  'Frequently asked questions managed by admins and displayed publicly.';


-- ----------------------------------------------------------
-- case_studies
-- ----------------------------------------------------------
-- Portfolio case studies showcasing project outcomes.
-- stats column stores an array of {label, before, after}.
-- ----------------------------------------------------------
CREATE TABLE public.case_studies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT NOT NULL,
  industry_id   UUID REFERENCES public.industries(id) ON DELETE SET NULL,
  image_url     TEXT,
  thumbnail_url TEXT,
  stats         JSONB NOT NULL DEFAULT '[]',
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  is_published  BOOLEAN NOT NULL DEFAULT false,
  published_at  TIMESTAMPTZ,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ,

  CONSTRAINT case_studies_title_length
    CHECK (length(trim(title)) BETWEEN 5 AND 200),
  CONSTRAINT case_studies_slug_format
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT case_studies_description_length
    CHECK (length(trim(description)) BETWEEN 20 AND 5000),
  CONSTRAINT case_studies_display_order_valid
    CHECK (display_order >= 0)
);

COMMENT ON TABLE public.case_studies IS
  'Portfolio case studies with industry linkage, stats, and publishing workflow.';


-- ----------------------------------------------------------
-- settings
-- ----------------------------------------------------------
-- Key-value site configuration stored as JSONB.
-- Keys: "hero", "stats", "company", etc.
-- ----------------------------------------------------------
CREATE TABLE public.settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT settings_key_not_blank
    CHECK (length(trim(key)) > 0)
);

COMMENT ON TABLE public.settings IS
  'Site-wide JSONB key-value configuration: hero copy, stats, company info.';


-- ----------------------------------------------------------
-- seo_metadata
-- ----------------------------------------------------------
-- Per-page SEO tags and Open Graph data.
-- ----------------------------------------------------------
CREATE TABLE public.seo_metadata (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path       TEXT NOT NULL UNIQUE,
  title           TEXT,
  description     TEXT,
  og_title        TEXT,
  og_description  TEXT,
  og_image        TEXT,
  canonical_url   TEXT,
  robots          TEXT DEFAULT 'index, follow',
  structured_data JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT seo_metadata_page_path_not_blank
    CHECK (length(trim(page_path)) > 0),
  CONSTRAINT seo_metadata_title_length
    CHECK (title IS NULL OR length(trim(title)) <= 70),
  CONSTRAINT seo_metadata_description_length
    CHECK (description IS NULL OR length(trim(description)) <= 160)
);

COMMENT ON TABLE public.seo_metadata IS
  'Per-page SEO metadata including Open Graph and structured data.';


-- ----------------------------------------------------------
-- feature_flags
-- ----------------------------------------------------------
-- Runtime boolean feature toggles for gradual rollouts.
-- ----------------------------------------------------------
CREATE TABLE public.feature_flags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled  BOOLEAN NOT NULL DEFAULT false,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT feature_flags_key_not_blank
    CHECK (length(trim(key)) > 0),
  CONSTRAINT feature_flags_key_format
    CHECK (key ~ '^[a-z][a-z0-9_]*$')
);

COMMENT ON TABLE public.feature_flags IS
  'Boolean feature flags for gradual rollouts and A/B testing.';


-- ----------------------------------------------------------
-- email_logs
-- ----------------------------------------------------------
-- Tracks every outgoing email for deliverability monitoring.
-- ----------------------------------------------------------
CREATE TABLE public.email_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name  TEXT,
  subject         TEXT NOT NULL,
  template        TEXT,
  status          public.email_log_status NOT NULL DEFAULT 'queued',
  error_message   TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT email_logs_email_format
    CHECK (recipient_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT email_logs_subject_not_blank
    CHECK (length(trim(subject)) > 0)
);

COMMENT ON TABLE public.email_logs IS
  'Outgoing email delivery log for monitoring and debugging.';


-- ----------------------------------------------------------
-- audit_logs
-- ----------------------------------------------------------
-- Immutable change audit trail for admin-managed tables.
-- Records old/new JSONB values for every data change.
-- ----------------------------------------------------------
CREATE TABLE public.audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name     TEXT NOT NULL,
  record_id      UUID NOT NULL,
  action         public.audit_action NOT NULL,
  old_data       JSONB,
  new_data       JSONB,
  changed_fields TEXT[],
  performed_by   UUID,
  ip_address     TEXT,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT audit_logs_table_name_not_blank
    CHECK (length(trim(table_name)) > 0)
);

COMMENT ON TABLE public.audit_logs IS
  'Immutable audit trail capturing every data change on admin-managed tables.';


-- ----------------------------------------------------------
-- activity_logs
-- ----------------------------------------------------------
-- High-level admin activity tracking (login, export, etc.)
-- ----------------------------------------------------------
CREATE TABLE public.activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email   TEXT,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   UUID,
  description   TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT activity_logs_action_not_blank
    CHECK (length(trim(action)) > 0)
);

COMMENT ON TABLE public.activity_logs IS
  'High-level admin activity log: logins, exports, bulk operations.';


-- ----------------------------------------------------------
-- notifications
-- ----------------------------------------------------------
-- In-app notifications for admin dashboard users.
-- ----------------------------------------------------------
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       public.notification_type NOT NULL DEFAULT 'info',
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  link       TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  read_at    TIMESTAMPTZ,
  metadata   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT notifications_title_not_blank
    CHECK (length(trim(title)) > 0),
  CONSTRAINT notifications_message_not_blank
    CHECK (length(trim(message)) > 0)
);

COMMENT ON TABLE public.notifications IS
  'In-app notifications for admin dashboard users.';


-- ----------------------------------------------------------
-- api_keys
-- ----------------------------------------------------------
-- API key management for third-party integrations.
-- Keys stored as SHA-256 hashes; plaintext shown once only.
-- ----------------------------------------------------------
CREATE TABLE public.api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  key_hash     TEXT NOT NULL UNIQUE,
  key_prefix   TEXT NOT NULL,
  permissions  JSONB NOT NULL DEFAULT '{}',
  rate_limit   INTEGER NOT NULL DEFAULT 1000,
  expires_at   TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at   TIMESTAMPTZ,

  CONSTRAINT api_keys_name_not_blank
    CHECK (length(trim(name)) > 0),
  CONSTRAINT api_keys_key_hash_not_blank
    CHECK (length(trim(key_hash)) > 0),
  CONSTRAINT api_keys_rate_limit_valid
    CHECK (rate_limit > 0)
);

COMMENT ON TABLE public.api_keys IS
  'API key management for external integrations. Keys stored as hashes.';


COMMIT;
