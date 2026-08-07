---
id: standard_database
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: [standard_supabase]
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: high
tags: [postgres, sql, rls, migrations]
---

# Database & Migration Standards

## Purpose
Enforce robust, version-controlled PostgreSQL schemas, safe migration rollouts, and Row Level Security boundaries within the Supabase ecosystem.

## Scope
Applies to all raw SQL files, schema definitions, indexing strategies, and database function implementations.

## Applies To
- `supabase/migrations/**/*.sql`

## Required Rules
1. **Immutable Migrations:** Once a migration is merged to `main`, it must never be modified. Write a new migration to alter existing structures.
2. **RLS by Default:** Row Level Security must be explicitly enabled on every table created via `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
3. **Foreign Key Integrity:** All relationships must enforce referential integrity using explicit `FOREIGN KEY` constraints with defined `ON DELETE` actions (e.g., `CASCADE` or `RESTRICT`).

## Recommended Practices
- **Naming Conventions:** Use `snake_case` for all tables, columns, and functions. Prefix boolean columns with `is_` or `has_`.
- **Soft Deletes:** Prefer an `is_deleted` boolean or `deleted_at` timestamp over hard `DELETE` commands for critical business entities (like users or reviews).

## Anti-Patterns
- Granting `public` schema usage to the `anon` role unnecessarily.
- Forgetting to create RLS policies after enabling RLS (which completely locks down the table).
- Writing complex business logic in SQL triggers when it belongs in an Edge Function (unless strictly data-integrity related).

## Examples
```sql
-- Good: Table creation with explicit RLS and index
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Good: RLS Policy enforcing owner isolation
CREATE POLICY "Users can only read their own reviews"
  ON public.reviews
  FOR SELECT
  USING (auth.uid() = author_id);
```

## Validation Checklist
- [ ] RLS is enabled on all tables.
- [ ] Migrations run successfully down/up locally before commit.
- [ ] Foreign keys have explicit delete cascading rules.

## Related Standards
- [standards/security.md](security.md) (Policy enforcement)
- [standards/performance.md](performance.md) (Indexing)

## References
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
