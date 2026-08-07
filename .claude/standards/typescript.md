---
id: standard_typescript
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: []
review_frequency: quarterly
last_updated: 2026-07-21
status: stable
priority: high
tags: [typescript, types, core]
---

# TypeScript Standards

## Purpose
Establish strict type safety conventions across the entire repository.

## Scope
Applies globally across frontend React components, backend Edge Functions, and testing utilities.

## Applies To
- `frontend/**/*.ts`, `frontend/**/*.tsx`
- `supabase/functions/**/*.ts`
- Utility scripts

## Required Rules
1. **Strict Mode:** `strict: true` must be enabled in all `tsconfig.json` files.
2. **No Implicit Any:** `any` is forbidden. Use `unknown` if the type is truly unknowable.
3. **Explicit Return Types:** All exported functions and API endpoints must declare an explicit return type.
4. **Zod Validation:** All external data (API responses, form inputs) must be validated using Zod at the boundary before processing.

## Recommended Practices
- Prefer `interface` for object shapes and `type` for unions/intersections.
- Colocate types with the domain they serve. Extract shared types to `types/` only when consumed by multiple domains.
- Use Discriminated Unions for state machines and complex conditional logic.

## Anti-Patterns
- Using `as` type assertions to bypass the compiler (unless extracting from a strict Zod schema).
- Defining giant monolithic interfaces; break them into smaller, composable types.
- Using `Enums`; prefer union types (e.g., `type Status = "idle" | "loading" | "error"`).

## Examples
```typescript
// Good: Strict discriminated union
type AuthState = 
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' };

// Good: Zod validation boundary
const UserSchema = z.object({ id: z.string().uuid() });
type ParsedUser = z.infer<typeof UserSchema>;
```

## Validation Checklist
- [ ] No `any` types present.
- [ ] External data is parsed via Zod.
- [ ] Exported functions have explicit return types.
- [ ] Passes `tsc --noEmit`.

## Related Standards
- [standards/react.md](react.md) (For component typing)
- [standards/supabase.md](supabase.md) (For Edge Function typing)

## References
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
