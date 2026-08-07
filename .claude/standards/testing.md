---
id: standard_testing
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: [standard_typescript, standard_react, standard_supabase]
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: high
tags: [testing, vitest, playwright, sql]
---

# Testing Standards

## Purpose
Ensure absolute reliability and regression prevention by testing the system exactly how it is architected (UI, Edge, DB, Hooks).

## Scope
Applies to the entire stack: React components, React hooks, Supabase Edge Functions, and PostgreSQL schemas.

## Applies To
- `frontend/src/**/*.test.tsx`
- `frontend/src/**/*.test.ts`
- `supabase/tests/**/*.test.ts`
- `supabase/tests/**/*.sql`

## Required Rules
1. **Mirror the Architecture:** Test strategy must directly map to domain boundaries:
   - **React Components:** Test accessibility and UI interactions (Playwright Component Testing or React Testing Library).
   - **Hooks/Utilities:** Test logic in isolation (Vitest).
   - **Edge Functions:** Mock Supabase client injections and test Zod validation boundaries (Vitest).
   - **SQL/RLS:** Use `pgTAP` or Supabase local testing to verify policies against distinct user roles.
   - **End-to-End:** Smoke test critical user flows (Playwright).
2. **Type-Safe Mocks:** All mocks must conform to the TypeScript definitions defined in `standards/typescript.md`.

## Recommended Practices
- Colocate component tests with the components themselves (e.g., `Button.test.tsx` next to `Button.tsx`).
- Favor integration testing for complex React Query hooks rather than mocking `fetch`.

## Anti-Patterns
- Testing implementation details (e.g., checking if a specific local state variable changed instead of checking the DOM output).
- Writing E2E tests for edge cases better suited for unit tests.
- Committing skipped tests (`test.skip()`) without an associated tracking issue.

## Examples
```typescript
// Good: Edge Function Boundary Test (Vitest)
import { expect, test } from 'vitest';
import { handleRequest } from './index.ts';

test('rejects invalid UUIDs at the Zod boundary', async () => {
  const req = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({ userId: 'not-a-uuid', action: 'verify' })
  });
  const res = await handleRequest(req);
  expect(res.status).toBe(400); // Expect Zod boundary to catch it
});
```

## Validation Checklist
- [ ] UI tests verify ARIA and DOM presence, not internal state.
- [ ] RLS policies are explicitly tested for both allowed and denied access.
- [ ] Edge functions have tests for malformed payloads.

## Related Standards
- [standards/typescript.md](typescript.md) (Mock typing)
- [standards/react.md](react.md) (Component test rendering)
- [standards/supabase.md](supabase.md) (Edge function context)

## References
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
