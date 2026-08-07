-- ============================================================
-- KARGAR BUSINESS SERVICES — PRODUCTION DATABASE
-- Schema Normalization for Review Media
-- ============================================================

BEGIN;

-- 1. Ensure canonical path columns exist
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS profile_image TEXT,
  ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- 2. Migrate existing data from the redundant `_path` columns
-- We use `profile_image` to store the storage path for the profile image,
-- and `company_logo` for the company logo.
UPDATE public.reviews
SET profile_image = profile_image_path
WHERE profile_image_path IS NOT NULL AND profile_image IS NULL;

UPDATE public.reviews
SET company_logo = company_logo_path
WHERE company_logo_path IS NOT NULL AND company_logo IS NULL;

-- Backfill from URLs if paths were never set
UPDATE public.reviews
SET profile_image = SUBSTRING(profile_image_url FROM '/review-images/(.*)')
WHERE profile_image_url IS NOT NULL AND profile_image IS NULL;

UPDATE public.reviews
SET company_logo = SUBSTRING(company_logo_url FROM '/review-images/(.*)')
WHERE company_logo_url IS NOT NULL AND company_logo IS NULL;

-- 3. Drop views that depend on the redundant columns
DROP VIEW IF EXISTS public.v_active_reviews;

-- 4. Drop the redundant path columns
ALTER TABLE public.reviews
  DROP COLUMN IF EXISTS profile_image_path,
  DROP COLUMN IF EXISTS company_logo_path;

-- 5. Recreate views to expose the normalized canonical fields
CREATE OR REPLACE VIEW public.v_active_reviews AS
SELECT
  r.id,
  r.customer_name,
  r.company_name,
  r.rating,
  r.review_title,
  r.review_text,
  r.recommend,
  r.profile_image,        -- CANONICAL PATH
  r.profile_image_url,    -- PUBLIC URL
  r.company_logo,         -- CANONICAL PATH
  r.company_logo_url,     -- PUBLIC URL
  r.video_path,           -- CANONICAL PATH
  r.video_url,            -- PUBLIC URL
  r.video_size,
  r.video_content_type,
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
  'Approved, visible reviews with canonical media fields, service name, like count, and latest admin reply.';

-- Re-apply grants
GRANT SELECT ON public.v_active_reviews TO anon, authenticated;

COMMIT;
