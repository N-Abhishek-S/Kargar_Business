---
id: chk_security_review
version: 1.0.0
owner: AI_Architect
category: Checklist
---

# Checklist: Security Audit

## Preconditions
- Access to Supabase production config.
- Source code read access.

## Execution
- Manually trace the lifecycle of a request from the UI, through the Edge Function, down to the PostgreSQL RLS policies.

## Validation (The Checklist)
- [ ] **Supabase Roles:** Ensure `anon` and `authenticated` roles only have access to strictly required tables.
- [ ] **RLS Exhaustiveness:** Run `SELECT * FROM pg_policies;` to verify every table has policies.
- [ ] **Zod Boundaries:** Verify all Edge Functions parse `req.json()` via Zod before business logic.
- [ ] **Secret Leaks:** Grep the codebase for `VITE_SUPABASE_SERVICE_ROLE_KEY`. It should NEVER exist in the frontend.
- [ ] **CORS Headers:** Verify Edge Functions return strict `Access-Control-Allow-Origin` values in production.

## Common Failures
- Creating a table and forgetting `ENABLE ROW LEVEL SECURITY`.
- Using string concatenation instead of parameterized queries if raw SQL is used anywhere.

## Recovery
- If RLS is missing on a sensitive table, immediately disable the table access or deploy an emergency migration locking it down.

## References
- [standards/security.md](../standards/security.md)
