-- Migration: Trigram and Full-Text Search RPC
-- Implements scalable search directly in Postgres

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-------------------------------------------------------------------------------
-- 1. INDEXING FOR SEARCH
-------------------------------------------------------------------------------
-- Add trigram index to mentor_profiles bio and headline for fuzzy matching
CREATE INDEX trgm_idx_mentor_headline ON public.mentor_profiles USING gin (headline gin_trgm_ops);
CREATE INDEX trgm_idx_mentor_bio ON public.mentor_profiles USING gin (bio gin_trgm_ops);

-- Add FTS (Full Text Search) index
ALTER TABLE public.mentor_profiles ADD COLUMN fts_document tsvector;

-- Update existing rows
UPDATE public.mentor_profiles SET fts_document = to_tsvector('english', coalesce(headline, '') || ' ' || coalesce(bio, ''));

-- Trigger to maintain FTS vector
CREATE OR REPLACE FUNCTION update_mentor_fts_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts_document := to_tsvector('english', coalesce(NEW.headline, '') || ' ' || coalesce(NEW.bio, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mentor_fts
BEFORE INSERT OR UPDATE OF headline, bio ON public.mentor_profiles
FOR EACH ROW EXECUTE PROCEDURE update_mentor_fts_vector();

CREATE INDEX fts_idx_mentor_profiles ON public.mentor_profiles USING gin (fts_document);

-------------------------------------------------------------------------------
-- 2. SEARCH RPC
-------------------------------------------------------------------------------
-- Secure, paginated RPC function for UI querying
CREATE OR REPLACE FUNCTION search_mentors(
  search_query TEXT,
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 10
)
RETURNS TABLE (
  mentor_id UUID,
  first_name TEXT,
  last_name TEXT,
  headline TEXT,
  average_rating DECIMAL,
  similarity_score REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id AS mentor_id,
    p.first_name,
    p.last_name,
    mp.headline,
    mp.average_rating,
    similarity(mp.headline || ' ' || mp.bio, search_query) AS similarity_score
  FROM public.mentor_profiles mp
  JOIN public.profiles p ON p.id = mp.user_id
  WHERE 
    mp.status = 'approved' AND
    mp.is_deleted = FALSE AND
    (
      mp.fts_document @@ plainto_tsquery('english', search_query) OR
      mp.headline % search_query OR
      mp.bio % search_query
    )
  ORDER BY similarity_score DESC, mp.average_rating DESC
  OFFSET (page_number - 1) * page_size
  LIMIT page_size;
END;
$$;
