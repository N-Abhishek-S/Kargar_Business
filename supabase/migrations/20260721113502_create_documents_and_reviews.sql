-- Migration: Mentor Documents and Reviews
-- Enforces immutable audit logging and auditable document versioning

-------------------------------------------------------------------------------
-- 1. MENTOR DOCUMENTS (Versions & Reviews for Auditable Approvals)
-------------------------------------------------------------------------------
-- Stores the metadata of a document (e.g. "Resume", "ID")
CREATE TABLE public.mentor_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('resume', 'identity', 'certification')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id, document_type)
);

ALTER TABLE public.mentor_documents ENABLE ROW LEVEL SECURITY;

-- The actual file versions. Immutable.
CREATE TABLE public.mentor_document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.mentor_documents(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mentor_document_versions ENABLE ROW LEVEL SECURITY;

-- The review audit log for a specific version. Immutable.
CREATE TABLE public.mentor_document_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES public.mentor_document_versions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  notes TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mentor_document_reviews ENABLE ROW LEVEL SECURITY;

-- RLS: Mentors can read/write their own documents
CREATE POLICY "Users can manage own documents"
  ON public.mentor_documents
  USING (EXISTS (
    SELECT 1 FROM public.mentor_profiles mp
    WHERE mp.id = mentor_documents.mentor_id AND mp.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own document versions"
  ON public.mentor_document_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.mentor_documents md
    JOIN public.mentor_profiles mp ON mp.id = md.mentor_id
    WHERE md.id = mentor_document_versions.document_id AND mp.user_id = auth.uid()
  ));

-------------------------------------------------------------------------------
-- 2. MENTOR REVIEWS (Immutable Audit Log)
-------------------------------------------------------------------------------
CREATE TABLE public.mentor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- A student can only review a mentor once.
  UNIQUE(mentor_id, student_id)
);

ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;

-- RLS: Public can read reviews of approved mentors
CREATE POLICY "Public can view reviews"
  ON public.mentor_reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.mentor_profiles mp
    WHERE mp.id = mentor_reviews.mentor_id AND mp.status = 'approved'
  ));

-- RLS: Students can create a review
CREATE POLICY "Students can create reviews"
  ON public.mentor_reviews FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- RLS: NO UPDATE OR DELETE ALLOWED. Reviews are immutable.

-------------------------------------------------------------------------------
-- 3. MENTOR REVIEW AGGREGATES (Trigger based cache)
-------------------------------------------------------------------------------
-- Add aggregate columns to mentor_profiles for fast reads
ALTER TABLE public.mentor_profiles 
ADD COLUMN total_reviews INTEGER NOT NULL DEFAULT 0,
ADD COLUMN average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00;

-- Trigger to update aggregate on new review
CREATE OR REPLACE FUNCTION update_mentor_rating_aggregate()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.mentor_profiles
  SET 
    total_reviews = total_reviews + 1,
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.mentor_reviews
      WHERE mentor_id = NEW.mentor_id
    )
  WHERE id = NEW.mentor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
AFTER INSERT ON public.mentor_reviews
FOR EACH ROW EXECUTE PROCEDURE update_mentor_rating_aggregate();
