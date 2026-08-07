---
id: cmd_migration
version: 1.0.0
owner: AI_Architect
category: Command
depends_on: [skill_database_migration]
---

# Command: `/migration`

## Description
Triggers the Postgres Database Migration workflow. Ensures the resulting SQL includes immutable constraints, cascading deletes, and default RLS policies.

## Associated Skill
- [skills/database_migration.md](../skills/database_migration.md)

## Example Usage
> /migration "Create an appointments table linking users to services, including an RLS policy that only allows admins and the specific user to view it."

## Validation
Agent must verify SQL syntax and ensure `ENABLE ROW LEVEL SECURITY` is explicitly present.
