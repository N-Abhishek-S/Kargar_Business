---
id: capability_matrix
version: 1.1.0
owner: AI_Architect
category: Governance
depends_on: registry.md
review_frequency: monthly
last_updated: 2026-07-21
status: stable
priority: high
tags: [capabilities, matrix, execution]
---

# Capability Matrix

This matrix maps engineering capabilities to their governing modules, skills, commands, and validation gates. Use this to determine exactly which standards and templates apply to a given task, and how that task must be validated.

| Capability | Owner | Skill | Command | Standard | Template | Validation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **React Component** | `frontend` | `skills/react.md` | `/component` | `standards/react.md` | `templates/component.tsx` | ESLint + TS |
| **Page Layout** | `frontend` | `skills/frontend.md` | `/page` | `standards/architecture.md`| `templates/page.tsx` | ESLint + TS |
| **Supabase RLS** | `backend` | `skills/supabase.md`| `/rls` | `standards/security.md` | `templates/rls.sql` | SQL check |
| **Edge Function** | `backend` | `skills/supabase.md`| `/edge-function` | `standards/backend.md` | `templates/edge.ts` | Deno lint |
| **DB Migration** | `backend` | `skills/database.md`| `/migration` | `standards/database.md` | `templates/schema.sql` | SQL check |
| **API Integration** | `frontend` | `skills/react.md` | `/api-hook` | `standards/api.md` | `templates/hook.ts` | Unit Test |
| **Animation Element**| `animations`| `skills/animations.md`| `/animate` | `standards/performance.md` | `templates/animation.tsx`| Manual UI review |
| **Prod Deployment** | `devops` | `skills/devops.md` | `/deploy` | `standards/git.md` | `.github/workflows/` | CI/CD pass |

*Note: All capabilities inherit the global constraints defined in `CLAUDE.md`. The matrix ensures strict alignment between what the system can do and how it is governed.*
