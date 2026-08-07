---
id: standard_performance
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: [standard_react, standard_supabase, standard_vite, standard_database]
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: high
tags: [performance, optimization, core-web-vitals, sql]
---

# Performance Standards

## Purpose
Ensure lightning-fast user experiences, optimized rendering, and efficient backend querying across the entire stack.

## Scope
Applies to Frontend rendering (React), Infrastructure (Vite), and Backend (Supabase/PostgreSQL).

## Applies To
- `frontend/src/**/*.tsx`
- `frontend/vite.config.ts`
- `supabase/migrations/**/*.sql`

## Required Rules
### 1. Frontend Optimization (via [React Standards](react.md))
- **Lazy Loading:** Route-level boundaries must use `React.lazy()`.
- **Query Caching:** React Query must be configured with sensible `staleTime` to prevent over-fetching.
- **Memoization:** Use `useMemo` and `useCallback` only when passing props to heavy child components or dependency arrays.

### 2. Backend Optimization (via [Database Standards](database.md))
- **SQL Indexing:** Every foreign key and frequently filtered column (`created_at`, `status`) must have an index.
- **RPC over Chatty Clients:** Complex joins and aggregations must happen in Postgres via RPC, avoiding multiple client-side round-trips.

### 3. Infrastructure Optimization (via [Vite Standards](vite.md))
- **Asset Compression:** Images must be compressed (WebP/AVIF) and appropriately sized before hitting `/public`.
- **Bundle Splitting:** Ensure `vendor` chunks are split correctly in Vite.

## Anti-Patterns
- Fetching 1000 rows in Supabase and filtering them in JavaScript (`array.filter()`). Use SQL `WHERE` clauses.
- Using unoptimized `<img>` tags for massive hero images without `loading="lazy"` for below-the-fold assets.
- `SELECT *` on large tables containing heavy JSONB or text payloads when only an ID or Name is needed.

## Examples
```sql
-- Good: Database-level optimization via RPC (avoids chatty network requests)
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Perform complex aggregations securely on the server
  SELECT jsonb_build_object(
    'total_reviews', (SELECT count(*) FROM reviews WHERE author_id = user_id),
    'average_rating', (SELECT avg(rating) FROM reviews WHERE author_id = user_id)
  ) INTO result;
  RETURN result;
END;
$$;
```

## Validation Checklist
- [ ] Route chunks are dynamically imported.
- [ ] Foreign keys and queried columns are indexed.
- [ ] Core Web Vitals (LCP, CLS, INP) pass Lighthouse thresholds.

## Related Standards
- [standards/react.md](react.md)
- [standards/database.md](database.md)
- [standards/vite.md](vite.md)
