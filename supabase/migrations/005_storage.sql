-- ============================================================
-- KARGAR BUSINESS SERVICES — PRODUCTION DATABASE
-- Phase 5: Storage Buckets & Policies
-- ============================================================
-- Run AFTER 004_rls_policies.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. STORAGE BUCKETS
-- ============================================================
-- public  = files accessible via public URL without auth
-- private = files require a signed URL / authenticated access
-- ============================================================

-- Review-related images (profile photos, company logos uploaded with reviews)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-images',
  'review-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Client/partner company logos for the trusted clients carousel
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- Customer profile photos (submitted with reviews)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-profiles',
  'customer-profiles',
  true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Case study images and thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-study-images',
  'case-study-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Blog post images (for future blog feature)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- User avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  1048576,  -- 1 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Private documents (proposals, contracts, certificates)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,  -- 10 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ]
);


-- ============================================================
-- 2. STORAGE POLICIES
-- ============================================================


-- ----------------------------------------
-- review-images
-- ----------------------------------------

-- Anyone can view review images (public bucket)
CREATE POLICY "Public read review-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-images');

-- Admins can upload review images
CREATE POLICY "Admins upload review-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'review-images'
    AND public.is_admin()
  );

-- Admins can delete review images
CREATE POLICY "Admins delete review-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'review-images'
    AND public.is_admin()
  );

-- Anonymous upload for review submissions (frontend direct upload)
CREATE POLICY "Anon upload review-images"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'review-images');


-- ----------------------------------------
-- company-logos
-- ----------------------------------------

CREATE POLICY "Public read company-logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

CREATE POLICY "Admins upload company-logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos'
    AND public.is_admin()
  );

CREATE POLICY "Admins delete company-logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND public.is_admin()
  );


-- ----------------------------------------
-- customer-profiles
-- ----------------------------------------

CREATE POLICY "Public read customer-profiles"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'customer-profiles');

CREATE POLICY "Admins upload customer-profiles"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'customer-profiles'
    AND public.is_admin()
  );

CREATE POLICY "Admins delete customer-profiles"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'customer-profiles'
    AND public.is_admin()
  );

CREATE POLICY "Anon upload customer-profiles"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'customer-profiles');


-- ----------------------------------------
-- case-study-images
-- ----------------------------------------

CREATE POLICY "Public read case-study-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'case-study-images');

CREATE POLICY "Admins upload case-study-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'case-study-images'
    AND public.is_admin()
  );

CREATE POLICY "Admins delete case-study-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'case-study-images'
    AND public.is_admin()
  );


-- ----------------------------------------
-- blog-images
-- ----------------------------------------

CREATE POLICY "Public read blog-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins upload blog-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images'
    AND public.is_admin()
  );

CREATE POLICY "Admins delete blog-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND public.is_admin()
  );


-- ----------------------------------------
-- avatars
-- ----------------------------------------

CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar (path must start with their user ID)
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update/delete their own avatar
CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can manage all avatars
CREATE POLICY "Admins manage avatars"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND public.is_admin()
  );


-- ----------------------------------------
-- documents (private bucket)
-- ----------------------------------------

-- Only admins can read documents (private bucket, signed URLs)
CREATE POLICY "Admins read documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.is_admin()
  );

CREATE POLICY "Admins upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND public.is_admin()
  );

CREATE POLICY "Admins delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.is_admin()
  );


COMMIT;
