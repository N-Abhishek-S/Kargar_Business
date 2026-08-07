-- ============================================================
-- KARGAR BUSINESS SERVICES — PRODUCTION DATABASE
-- Add Video Support to Reviews
-- ============================================================

BEGIN;

-- 1. Create review-videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-videos',
  'review-videos',
  true,
  104857600,  -- 100 MB
  ARRAY['video/mp4', 'video/quicktime', 'video/webm']
) ON CONFLICT (id) DO NOTHING;

-- 2. Add video columns to reviews table
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_path TEXT,
  ADD COLUMN IF NOT EXISTS video_size BIGINT,
  ADD COLUMN IF NOT EXISTS video_content_type TEXT;

-- 3. Recreate v_active_reviews view to include video_url
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
  r.company_logo_url,
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

-- 4. Storage Policies for review-videos
CREATE POLICY "Public read review-videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-videos');

CREATE POLICY "Admins upload review-videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'review-videos'
    AND public.is_admin()
  );

CREATE POLICY "Admins delete review-videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'review-videos'
    AND public.is_admin()
  );

CREATE POLICY "Anon upload review-videos"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'review-videos');

COMMIT;
