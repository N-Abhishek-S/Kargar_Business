---
id: standard_supabase
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: [standard_typescript]
review_frequency: quarterly
last_updated: 2026-07-21
status: stable
priority: high
tags: [supabase, edge-functions, auth, rpc]
---

# Supabase Standards

## Purpose
Govern the usage of Supabase services (Auth, Edge Functions, Storage, Realtime, RPC) to ensure secure, strictly typed data access for the KargarWeb project.

## Scope
Applies to all Supabase client instantiations, Edge Function logic, and backend-as-a-service integrations.

## Applies To
- `frontend/src/supabase/**/*.ts`
- `supabase/functions/**/*.ts`

## Required Rules
1. **Client Separation:** Strictly maintain separate Supabase clients for SSR (if Next.js/Vite SSR is ever used) versus CSR. For the Vite SPA, instantiate the client exactly once and export it as a singleton.
2. **Type Generation:** All Supabase queries must use generated TypeScript definitions (`Database` type) to ensure compile-time safety.
3. **Zod Validation at Boundaries:** Edge Functions must parse all incoming request payloads via Zod before processing.
4. **Service Role Isolation:** The `SERVICE_ROLE_KEY` must NEVER be exposed to the client. It is strictly reserved for Edge Functions or admin scripts bypassing RLS.

## Recommended Practices
- **RPC Usage:** Use Postgres Functions (RPC) for complex, multi-table transactions instead of chaining multiple client-side calls.
- **Edge Function Modularization:** Keep `index.ts` in Edge Functions lightweight. Extract business logic into separate utility files.
- **Error Handling:** Standardize API responses from Edge Functions (e.g., `{ data: null, error: string }`).

## Anti-Patterns
- Using `select('*')` on large tables; always specify exact columns to minimize payload.
- Hardcoding `VITE_SUPABASE_URL` instead of relying on `import.meta.env`.

## Examples
```typescript
// Good: Strictly Typed Edge Function Boundary
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const RequestSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['verify', 'reject'])
});

serve(async (req) => {
  try {
    const payload = await req.json();
    const { userId, action } = RequestSchema.parse(payload); // Boundary validation
    
    // Process logic...
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
```

## Validation Checklist
- [ ] Supabase client uses generated database types.
- [ ] Edge functions validate inputs with Zod.
- [ ] No `SERVICE_ROLE_KEY` referenced in `frontend/`.

## Related Standards
- [standards/typescript.md](typescript.md) (For Zod boundaries and strict typing)
- [standards/database.md](database.md) (For SQL Migrations and RLS)
- [standards/security.md](security.md) (For Auth integration)

## References
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
