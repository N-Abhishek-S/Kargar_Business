---
id: skill_database_migration
version: 1.0.0
owner: AI_Architect
category: Skill
depends_on: [standard_database, standard_security]
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: high
tags: [sql, migration, postgres, rls]
---

# Skill: Database Migration Generation

## Purpose
Safely generate immutable Postgres migrations ensuring referential integrity, indexing, and Row Level Security (RLS) enforcement.

## When to use
Invoke this skill when altering database schemas, adding tables, modifying RLS policies, or creating Postgres RPC functions.

## Inputs
- `Entity/Table Name`
- `Column definitions & constraints`
- `Security access rules (RLS)`

## Outputs
- `supabase/migrations/[TIMESTAMP]_[description].sql`

## Required Standards
- [standards/database.md](../standards/database.md)
- [standards/security.md](../standards/security.md)

## Dependencies
- `uuid-ossp` extension (for default UUIDs)

## Validation Rules
1. Every new table must have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
2. Every new table must have an `id UUID PRIMARY KEY`.
3. Foreign keys must have `ON DELETE` directives.

## Workflow
1. **Analyze:** Check existing schema to avoid conflicts.
2. **Scaffold:** Generate the timestamped SQL file.
3. **Write DDL:** Create tables, columns, constraints, and indexes.
4. **Secure:** Write the `CREATE POLICY` statements.

## Failure Handling
- **Policy Overlap:** If a policy name already exists, verify the conflict before executing.
- **Destructive Changes:** Refuse `DROP TABLE` or `DROP COLUMN` unless explicitly confirmed by the user.

## Related Commands
- `/migration`
- `/rls`

## Related Templates
- `templates/schema.sql`
