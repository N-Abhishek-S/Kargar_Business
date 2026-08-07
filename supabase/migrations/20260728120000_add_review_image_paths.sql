-- ============================================================
-- KARGAR BUSINESS SERVICES — PRODUCTION DATABASE
-- Add Review Image Paths for Deletion/Replacement
-- ============================================================

BEGIN;

-- 1. Add path columns
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS profile_image_path TEXT,
  ADD COLUMN IF NOT EXISTS company_logo_path TEXT;

-- 2. Recreate v_active_reviews view to include new path columns
DROP VIEW IF EXISTS public.v_active_reviews;
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
  r.profile_image_path,
  r.company_logo_url,
  r.company_logo_path,
  r.video_url,
  r.video_path,
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
LEFT JOIN (
  SELECT review_id, COUNT(*) AS like_count
  FROM public.review_likes
  GROUP BY review_id
) lc ON lc.review_id = r.id
LEFT JOIN public.review_replies rp
  ON rp.review_id = r.id
WHERE r.status = 'approved'
  AND r.deleted_at IS NULL;

-- 3. Backfill existing data
-- Extract the path from the public URL.
-- Assuming the public URL looks like: https://[project].supabase.co/storage/v1/object/public/review-images/profile-images/...
-- We use substring to extract everything after '/review-images/'
UPDATE public.reviews
SET profile_image_path = SUBSTRING(profile_image_url FROM '/review-images/(.*)')
WHERE profile_image_url IS NOT NULL AND profile_image_path IS NULL;

UPDATE public.reviews
SET company_logo_path = SUBSTRING(company_logo_url FROM '/review-images/(.*)')
WHERE company_logo_url IS NOT NULL AND company_logo_path IS NULL;

COMMIT;
