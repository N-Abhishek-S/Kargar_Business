---
id: standard_security
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: [standard_typescript, standard_supabase, standard_database, standard_vite, standard_observability]
review_frequency: monthly
last_updated: 2026-07-21
status: stable
priority: critical
tags: [security, rls, auth, validation]
---

# Global Security Standards (Umbrella)

## Purpose
Orchestrate security mandates across the stack. This standard does not redefine implementation details; it dictates the security architecture by pointing to the authoritative domain standards.

## Scope
Applies globally across the entire lifecycle of data and requests.

## Architecture & Delegation
Security is enforced at multiple layers. 

### 1. Input Validation
**Rule:** No untrusted data enters the system without strict parsing.
**Delegation:** Enforced by [TypeScript & Zod Standards](typescript.md).

### 2. Authentication
**Rule:** Identity must be verified natively via robust session management.
**Delegation:** Enforced by [Supabase Standards](supabase.md) (Magic links, JWTs).

### 3. Authorization (Row Level Security)
**Rule:** The database must defend itself. The frontend UI is merely a projection; RLS is the true security boundary.
**Delegation:** Enforced by [Database Standards](database.md) (`auth.uid() = user_id`).

### 4. Secrets Management
**Rule:** Secrets must never leak into client bundles.
**Delegation:** Enforced by [Vite Standards](vite.md) (`VITE_` prefix constraints).

### 5. Audit & Logging
**Rule:** Security events (auth failures, anomalous function calls) must be observable.
**Delegation:** Enforced by [Observability Standards](observability.md).

## Required Rules (Global)
1. **Defense in Depth:** Do not rely on UI hiding to secure features. You must implement RLS in Postgres and/or validate JWT claims in Edge Functions.
2. **CORS & CSP:** Edge Functions must define explicit CORS headers. The React frontend should enforce a strict Content Security Policy if server-rendered (or via Vercel headers for Vite).

## Anti-Patterns
- Hiding a button in React and assuming the user cannot execute the Supabase query via console.
- Storing sensitive PII in `public` storage buckets.
- Trusting client-provided timestamps or UUIDs for critical financial or security states.

## Validation Checklist
- [ ] Are all inputs validated via Zod? (See `typescript.md`)
- [ ] Is RLS active on the affected table? (See `database.md`)
- [ ] Are Edge Function variables secured? (See `supabase.md`)

## References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
