---
id: skill_edge_function
version: 1.0.0
owner: AI_Architect
category: Skill
depends_on: [standard_supabase, standard_typescript, standard_observability]
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: high
tags: [supabase, edge-function, backend, skill]
---

# Skill: Supabase Edge Function Generation

## Purpose
Autonomously scaffold and deploy Supabase Edge Functions with strict Zod validation boundaries, structured logging, and Deno compatibility.

## When to use
Invoke this skill when building backend business logic that cannot be securely or efficiently executed via Postgres RPC or when third-party APIs (Stripe, Resend) are required.

## Inputs
- `Function Name`
- `Expected Payload Shape`
- `Third-party services required`

## Outputs
- `supabase/functions/[Function Name]/index.ts`

## Required Standards
- [standards/supabase.md](../standards/supabase.md)
- [standards/observability.md](../standards/observability.md)

## Dependencies
- Deno standard library
- `zod` for payload validation
- `@supabase/supabase-js`

## Validation Rules
1. Must include CORS headers.
2. Must validate `req.json()` via `ZodSchema.parse()`.
3. Must use `try/catch` wrapping the entire execution, returning `{ error: ... }` on failure.

## Workflow
1. **Scaffold:** Create the function directory and `index.ts`.
2. **Define Schema:** Write the Zod schema for incoming data.
3. **Implement Logic:** Extract business logic if file exceeds 100 lines.
4. **Secure:** Ensure `SERVICE_ROLE_KEY` is used only if bypassing RLS is explicitly intended.

## Failure Handling
- **Missing Deps:** Ensure import maps are updated if new Deno URLs are introduced.
- **Validation Failures:** Return explicit `400 Bad Request` with Zod error messages.

## Related Commands
- `/edge-function`

## Related Templates
- `templates/edge_function.ts`
