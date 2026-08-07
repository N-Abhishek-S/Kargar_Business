---
id: bp_database_migration
version: 1.0.0
owner: AI_Architect
category: Blueprint
depends_on: [standard_database, standard_security]
---

# Blueprint: Database Migration (Table & RLS)

## Purpose
Scaffold a safe, immutable Postgres migration that automatically includes UUID primary keys, audit timestamps, and strict Row Level Security.

## When to use
Whenever adding a new entity to the database.

## Inputs
- `Table Name` (snake_case)
- `Columns`

## Outputs
- `supabase/migrations/[TIMESTAMP]_create_[table_name].sql`

## Related Standards & Skills
- **Standards:** [database.md](../standards/database.md), [security.md](../standards/security.md)
- **Skills:** [database_migration.md](../skills/database_migration.md)
- **Commands:** `/migration`, `/rls`

## Validation Checklist
- [ ] RLS is explicitly enabled.
- [ ] A read policy and write policy are defined.
- [ ] Foreign keys cascade appropriately.

## Expected Generated Files

### 1. `supabase/migrations/TIMESTAMP_create_[table_name].sql`
```sql
-- Create Table
CREATE TABLE public.[table_name] (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Custom Columns Here
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'archived')),
  
  -- Audit Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.[table_name] ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own rows
CREATE POLICY "Users can view own [table_name]"
  ON public.[table_name]
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own rows
CREATE POLICY "Users can insert own [table_name]"
  ON public.[table_name]
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own rows
CREATE POLICY "Users can update own [table_name]"
  ON public.[table_name]
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own rows
CREATE POLICY "Users can delete own [table_name]"
  ON public.[table_name]
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexing for performance
CREATE INDEX idx_[table_name]_user_id ON public.[table_name](user_id);
```
