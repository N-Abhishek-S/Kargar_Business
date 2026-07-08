-- ============================================================
-- KARGAR BUSINESS SERVICES — PRODUCTION DATABASE
-- Phase 2: Indexes
-- B-tree · GIN · Partial · Composite · Full-Text Search
-- ============================================================
-- Run AFTER 001_core_schema.sql
-- ============================================================

BEGIN;

-- ============================================================
-- profiles
-- ============================================================
CREATE INDEX idx_profiles_role
  ON public.profiles (role);

CREATE INDEX idx_profiles_active
  ON public.profiles (is_active)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_profiles_full_name_trgm
  ON public.profiles
  USING GIN (full_name gin_trgm_ops);

-- ============================================================
-- roles / permissions / RBAC
-- ============================================================
CREATE INDEX idx_role_permissions_role_id
  ON public.role_permissions (role_id);

CREATE INDEX idx_role_permissions_permission_id
  ON public.role_permissions (permission_id);

CREATE INDEX idx_user_roles_user_active
  ON public.user_roles (user_id)
  WHERE is_active = true;

CREATE INDEX idx_user_roles_role_active
  ON public.user_roles (role_id)
  WHERE is_active = true;

-- ============================================================
-- service_categories
-- ============================================================
CREATE INDEX idx_service_categories_active_order
  ON public.service_categories (is_active, display_order, name);

-- ============================================================
-- services
-- ============================================================
CREATE INDEX idx_services_category_id
  ON public.services (category_id);

CREATE INDEX idx_services_active_order
  ON public.services (is_active, display_order, name);

-- ============================================================
-- industries
-- ============================================================
CREATE INDEX idx_industries_active_order
  ON public.industries (is_active, display_order, name);

-- ============================================================
-- reviews
-- ============================================================

-- Primary public listing query: approved + featured + ordered
CREATE INDEX idx_reviews_public_listing
  ON public.reviews (status, is_featured DESC, display_order ASC, created_at DESC)
  WHERE deleted_at IS NULL;

-- Admin listing: status + date
CREATE INDEX idx_reviews_admin_listing
  ON public.reviews (status, created_at DESC)
  WHERE deleted_at IS NULL;

-- FK lookups
CREATE INDEX idx_reviews_service_id
  ON public.reviews (service_id);

CREATE INDEX idx_reviews_approved_by
  ON public.reviews (approved_by)
  WHERE approved_by IS NOT NULL;

-- Duplicate detection by email
CREATE INDEX idx_reviews_email_lower
  ON public.reviews (lower(email));

-- Duplicate detection by IP
CREATE INDEX idx_reviews_ip_hash
  ON public.reviews (ip_hash)
  WHERE ip_hash IS NOT NULL;

-- Soft-delete filter
CREATE INDEX idx_reviews_deleted_at
  ON public.reviews (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- Full-text search across review content
CREATE INDEX idx_reviews_fts
  ON public.reviews
  USING GIN (
    to_tsvector('english', customer_name || ' ' || review_title || ' ' || review_text)
  );

-- Fuzzy name search
CREATE INDEX idx_reviews_customer_name_trgm
  ON public.reviews
  USING GIN (customer_name gin_trgm_ops);

-- ============================================================
-- review_media
-- ============================================================
CREATE INDEX idx_review_media_review_id
  ON public.review_media (review_id);

-- ============================================================
-- review_replies
-- ============================================================
CREATE INDEX idx_review_replies_review_status
  ON public.review_replies (review_id, status);

-- ============================================================
-- review_reports
-- ============================================================
CREATE INDEX idx_review_reports_review_status
  ON public.review_reports (review_id, status);

-- ============================================================
-- review_likes
-- ============================================================
CREATE INDEX idx_review_likes_review_id
  ON public.review_likes (review_id);

-- ============================================================
-- client_logos
-- ============================================================
CREATE INDEX idx_client_logos_active_order
  ON public.client_logos (
    is_active,
    is_featured DESC,
    priority DESC,
    display_order ASC,
    company_name ASC
  );

-- ============================================================
-- contact_messages
-- ============================================================
CREATE INDEX idx_contact_messages_status_created
  ON public.contact_messages (status, created_at DESC);

CREATE INDEX idx_contact_messages_email_lower
  ON public.contact_messages (lower(email));

CREATE INDEX idx_contact_messages_assigned
  ON public.contact_messages (assigned_to)
  WHERE assigned_to IS NOT NULL;

CREATE INDEX idx_contact_messages_priority
  ON public.contact_messages (priority, status);

-- ============================================================
-- quote_requests
-- ============================================================
CREATE INDEX idx_quote_requests_status_created
  ON public.quote_requests (status, created_at DESC);

CREATE INDEX idx_quote_requests_email_lower
  ON public.quote_requests (lower(email));

CREATE INDEX idx_quote_requests_assigned
  ON public.quote_requests (assigned_to)
  WHERE assigned_to IS NOT NULL;

CREATE INDEX idx_quote_requests_service_id
  ON public.quote_requests (service_id);

CREATE INDEX idx_quote_requests_industry_id
  ON public.quote_requests (industry_id);

-- ============================================================
-- newsletter_subscribers
-- ============================================================
CREATE INDEX idx_newsletter_email_lower
  ON public.newsletter_subscribers (lower(email));

CREATE INDEX idx_newsletter_active_created
  ON public.newsletter_subscribers (is_active, created_at DESC);

-- ============================================================
-- faq
-- ============================================================
CREATE INDEX idx_faq_active_order
  ON public.faq (is_active, display_order);

CREATE INDEX idx_faq_category
  ON public.faq (category)
  WHERE category IS NOT NULL;

-- Full-text search across questions and answers
CREATE INDEX idx_faq_fts
  ON public.faq
  USING GIN (
    to_tsvector('english', question || ' ' || answer)
  );

-- ============================================================
-- case_studies
-- ============================================================
CREATE INDEX idx_case_studies_published
  ON public.case_studies (
    is_published,
    is_featured DESC,
    display_order ASC,
    published_at DESC
  )
  WHERE deleted_at IS NULL;

CREATE INDEX idx_case_studies_industry_id
  ON public.case_studies (industry_id);

CREATE INDEX idx_case_studies_created_by
  ON public.case_studies (created_by)
  WHERE created_by IS NOT NULL;

-- ============================================================
-- seo_metadata (page_path is already UNIQUE)
-- ============================================================

-- ============================================================
-- feature_flags (key is already UNIQUE)
-- ============================================================
CREATE INDEX idx_feature_flags_enabled
  ON public.feature_flags (is_enabled);

-- ============================================================
-- email_logs
-- ============================================================
CREATE INDEX idx_email_logs_status_created
  ON public.email_logs (status, created_at DESC);

CREATE INDEX idx_email_logs_recipient
  ON public.email_logs (recipient_email);

-- ============================================================
-- audit_logs
-- ============================================================

-- Primary lookup: filter by table, ordered by time
CREATE INDEX idx_audit_logs_table_created
  ON public.audit_logs (table_name, created_at DESC);

-- Lookup changes for a specific record
CREATE INDEX idx_audit_logs_record_id
  ON public.audit_logs (record_id);

-- Lookup changes by a specific user
CREATE INDEX idx_audit_logs_performed_by
  ON public.audit_logs (performed_by)
  WHERE performed_by IS NOT NULL;

-- ============================================================
-- activity_logs
-- ============================================================
CREATE INDEX idx_activity_logs_actor_created
  ON public.activity_logs (actor_id, created_at DESC);

CREATE INDEX idx_activity_logs_resource
  ON public.activity_logs (resource_type, resource_id)
  WHERE resource_type IS NOT NULL;

-- ============================================================
-- notifications
-- ============================================================

-- Main query: unread notifications for a user
CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id, is_read, created_at DESC);

-- ============================================================
-- api_keys
-- ============================================================
CREATE INDEX idx_api_keys_active
  ON public.api_keys (is_active)
  WHERE is_active = true;

CREATE INDEX idx_api_keys_created_by
  ON public.api_keys (created_by)
  WHERE created_by IS NOT NULL;


COMMIT;
