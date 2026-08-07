# Version 1.1 Improvement Report (Retrospective)

This report details friction encountered during the generation of the "People Domain (Mentor Specialization)" using the V1.0.0 OS.

## 1. Insufficient Standards
- **Testing Standard (`testing.md`)**: The standard mandated Vitest/Playwright, but it did not define how to mock dependencies in a Service Layer (Domain-Driven Design). We had to invent `vi.mock()` strategies on the fly.
- **Database Standard (`database.md`)**: It did not account for trigger-based aggregate caches (like `average_rating`). 

## 2. Missing Skills
- **Service Generator Skill (`service_layer.md`)**: We have `/migration` and `/edge-function`, but no skill for generating CQRS Repositories, Services, and Domain Events. I had to build them manually based on the implementation plan.
- **Client SDK Generator (`sdk_generator.md`)**: Writing the React Query wrappers manually over `MentorClient.ts` was repetitive. A skill to autogenerate React Hooks from Zod schemas would save hours.

## 3. Incomplete Blueprints
- **Edge Function Blueprint**: The current `supabase_edge_function.md` assumes the entire logic lives in `index.ts`. It failed to accommodate the new DDD architecture (`Repository -> Service -> index.ts`). It must be updated to output a `/shared` architecture by default.

## 4. Automation Improvements
- **`new_feature.md`**: The automation workflow is currently a text checklist. Moving forward, as suggested, we must turn this into a **Claude Code extension/toolkit** where typing `/component DashboardCard` physically scaffolds the Component, Test, Story, Types, Hook, and Barrel export automatically, rather than relying on manual traversal of Markdown checklists.

## Proposed Action Items for V1.1.0
1. Extract `.claude/` into `ai-engineering-os/core/`.
2. Rewrite `supabase_edge_function.md` to mandate a Service Layer.
3. Replace text automation with executable Claude Toolkit Extensions.
