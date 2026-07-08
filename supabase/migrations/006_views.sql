-- ============================================================
-- KARGAR BUSINESS SERVICES — PRODUCTION DATABASE
-- Phase 6: Views
-- Admin dashboard · Active reviews · Inquiries · Moderation
-- ============================================================
-- Run AFTER 005_storage.sql (or any time after Phase 4)
-- ============================================================

BEGIN;

-- ============================================================
-- v_active_reviews
-- ============================================================
-- Approved, visible reviews with service name and like count.
-- Used by the public-facing reviews section and the admin panel.
-- ============================================================
CREATE OR REPLACE VIEW public.v_active_reviews AS
SELECT
  r.id,
  r.customer_name,
  r.company_name,
  r.rating,
  r.review_title,
  r.review_text,
  r.recommend,
  r.profile_image_url,
  r.company_logo_url,
  r.is_featured,
  r.display_order,
  r.location,
  r.approved_at,
  r.created_at,
  s.name        AS service_name,
  s.slug        AS service_slug,
  COALESCE(lc.like_count, 0)  AS like_count,
  rp.reply_text AS admin_reply,
  rp.replied_at AS admin_replied_at
FROM public.reviews r
LEFT JOIN public.services s
  ON s.id = r.service_id
LEFT JOIN LATERAL (
  SELECT count(*)::int AS like_count
  FROM public.review_likes rl
  WHERE rl.review_id = r.id
) lc ON true
LEFT JOIN LATERAL (
  SELECT reply_text, replied_at
  FROM public.review_replies rr
  WHERE rr.review_id = r.id
    AND rr.status = 'published'
  ORDER BY rr.replied_at DESC
  LIMIT 1
) rp ON true
WHERE r.status = 'approved'
  AND r.deleted_at IS NULL;

COMMENT ON VIEW public.v_active_reviews IS
  'Approved, visible reviews with service name, like count, and latest admin reply.';


-- ============================================================
-- v_review_summary
-- ============================================================
-- Aggregated review statistics: count, average, distribution.
-- ============================================================
CREATE OR REPLACE VIEW public.v_review_summary AS
SELECT
  count(*)::int                                     AS total_reviews,
  COALESCE(round(avg(rating)::numeric, 1), 0)       AS average_rating,
  count(*) FILTER (WHERE rating = 5)::int            AS five_star,
  count(*) FILTER (WHERE rating = 4)::int            AS four_star,
  count(*) FILTER (WHERE rating = 3)::int            AS three_star,
  count(*) FILTER (WHERE rating = 2)::int            AS two_star,
  count(*) FILTER (WHERE rating = 1)::int            AS one_star,
  count(*) FILTER (WHERE recommend = true)::int      AS would_recommend,
  count(*) FILTER (WHERE is_featured = true)::int    AS featured_count
FROM public.reviews
WHERE status = 'approved'
  AND deleted_at IS NULL;

COMMENT ON VIEW public.v_review_summary IS
  'Aggregated review statistics: total, average rating, star distribution.';


-- ============================================================
-- v_recent_inquiries
-- ============================================================
-- Combined view of recent contacts and quote requests,
-- sorted by date. Useful for the admin dashboard inbox.
-- ============================================================
CREATE OR REPLACE VIEW public.v_recent_inquiries AS
SELECT
  id,
  'contact'::text  AS inquiry_type,
  name,
  email,
  phone,
  company,
  subject,
  message,
  status::text     AS status,
  priority::text   AS priority,
  assigned_to,
  source,
  created_at
FROM public.contact_messages

UNION ALL

SELECT
  id,
  'quote'::text    AS inquiry_type,
  name,
  email,
  phone,
  company,
  NULL             AS subject,
  message,
  status::text     AS status,
  priority::text   AS priority,
  assigned_to,
  source,
  created_at
FROM public.quote_requests

ORDER BY created_at DESC;

COMMENT ON VIEW public.v_recent_inquiries IS
  'Combined contacts + quote requests ordered by date. Admin dashboard inbox.';


-- ============================================================
-- v_pending_moderation
-- ============================================================
-- Items that need admin attention: pending reviews,
-- new contacts, new quotes, open reports.
-- ============================================================
CREATE OR REPLACE VIEW public.v_pending_moderation AS
SELECT
  id,
  'review'::text       AS item_type,
  customer_name        AS title,
  review_text          AS preview,
  created_at
FROM public.reviews
WHERE status = 'pending'
  AND deleted_at IS NULL

UNION ALL

SELECT
  id,
  'contact'::text      AS item_type,
  name                 AS title,
  left(message, 200)   AS preview,
  created_at
FROM public.contact_messages
WHERE status = 'new'

UNION ALL

SELECT
  id,
  'quote'::text        AS item_type,
  name                 AS title,
  left(COALESCE(message, ''), 200) AS preview,
  created_at
FROM public.quote_requests
WHERE status = 'new'

UNION ALL

SELECT
  id,
  'report'::text       AS item_type,
  reason               AS title,
  left(COALESCE(details, ''), 200) AS preview,
  created_at
FROM public.review_reports
WHERE status = 'open'

ORDER BY created_at DESC;

COMMENT ON VIEW public.v_pending_moderation IS
  'All items needing admin attention: pending reviews, new contacts/quotes, open reports.';


-- ============================================================
-- v_admin_dashboard
-- ============================================================
-- Single-row snapshot of key metrics for the admin dashboard.
-- Prefer get_dashboard_stats() function for programmatic use;
-- this view is for direct SQL queries and debugging.
-- ============================================================
CREATE OR REPLACE VIEW public.v_admin_dashboard AS
SELECT
  -- Reviews
  (SELECT count(*) FROM reviews WHERE deleted_at IS NULL)::int
    AS total_reviews,
  (SELECT count(*) FROM reviews WHERE status = 'pending' AND deleted_at IS NULL)::int
    AS pending_reviews,
  (SELECT count(*) FROM reviews WHERE status = 'approved' AND deleted_at IS NULL)::int
    AS approved_reviews,
  (SELECT COALESCE(round(avg(rating)::numeric, 1), 0) FROM reviews WHERE status = 'approved' AND deleted_at IS NULL)
    AS average_rating,

  -- Contacts
  (SELECT count(*) FROM contact_messages)::int
    AS total_contacts,
  (SELECT count(*) FROM contact_messages WHERE status = 'new')::int
    AS new_contacts,

  -- Quote Requests
  (SELECT count(*) FROM quote_requests)::int
    AS total_quotes,
  (SELECT count(*) FROM quote_requests WHERE status = 'new')::int
    AS new_quotes,

  -- Newsletter
  (SELECT count(*) FROM newsletter_subscribers WHERE is_active = true)::int
    AS active_subscribers,

  -- Clients
  (SELECT count(*) FROM client_logos WHERE is_active = true)::int
    AS active_client_logos,

  -- Reports
  (SELECT count(*) FROM review_reports WHERE status = 'open')::int
    AS open_reports;

COMMENT ON VIEW public.v_admin_dashboard IS
  'Single-row dashboard metrics snapshot for the admin panel.';


-- ============================================================
-- Grant SELECT on views to appropriate roles
-- ============================================================
GRANT SELECT ON public.v_active_reviews     TO anon, authenticated;
GRANT SELECT ON public.v_review_summary     TO anon, authenticated;
GRANT SELECT ON public.v_recent_inquiries   TO authenticated;
GRANT SELECT ON public.v_pending_moderation TO authenticated;
GRANT SELECT ON public.v_admin_dashboard    TO authenticated;


COMMIT;
