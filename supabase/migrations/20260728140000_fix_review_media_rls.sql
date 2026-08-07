BEGIN;

-- Create a SECURITY DEFINER function to bypass the reviews SELECT policy
-- so we can verify if a review is pending even if the anon user cannot select it.
CREATE OR REPLACE FUNCTION public.is_review_pending(check_review_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.reviews
    WHERE id = check_review_id
      AND status = 'pending'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_review_pending(UUID) TO anon, authenticated;

-- Replace the RLS policy on review_media to use the new function
DROP POLICY IF EXISTS "Anyone can insert review media for pending reviews" ON public.review_media;

CREATE POLICY "Anyone can insert review media for pending reviews"
  ON public.review_media FOR INSERT
  WITH CHECK (
    public.is_review_pending(review_id)
  );

COMMIT;
