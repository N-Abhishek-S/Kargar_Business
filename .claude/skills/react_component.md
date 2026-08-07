---
id: skill_react_component
version: 1.0.0
owner: AI_Architect
category: Skill
depends_on: [standard_react, standard_typescript, standard_tailwind]
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: high
tags: [react, component, skill, execution]
---

# Skill: React Component Generation

## Purpose
Autonomously generate production-ready React 19 components using Vite, TypeScript 6.0, and Tailwind 4.3, adhering strictly to KargarWeb architectural boundaries.

## When to use
Invoke this skill whenever the user asks to create a new UI element, page, feature container, or layout component.

## Inputs
- `Component Name`
- `Feature Domain` (e.g., `reviews`, `services`)
- `Props required`
- `Interactivity requirements`

## Outputs
- `[ComponentName].tsx` in `frontend/src/features/[Domain]/components/`
- Associated `.test.tsx` file (if requested)

## Required Standards
- [standards/react.md](../standards/react.md)
- [standards/typescript.md](../standards/typescript.md)
- [standards/tailwind.md](../standards/tailwind.md)

## Dependencies
- `@tanstack/react-query` (if fetching data)
- `lucide-react` (if icons are needed)
- `clsx` and `tailwind-merge` (for class merging)

## Validation Rules
1. Must use `interface [Name]Props`.
2. Must use absolute imports (`@/utils/cn`).
3. Must not contain raw `useEffect` for data fetching.

## Workflow
1. **Analyze:** Determine the appropriate feature folder.
2. **Scaffold:** Generate the interface and component shell.
3. **Style:** Apply utility-first Tailwind classes.
4. **Wire:** Add React Query hooks if data is required.
5. **Review:** Check against the validation rules.

## Failure Handling
- **Missing Domain:** If no feature domain is provided, prompt the user or default to `frontend/src/components/ui/` for generic elements.
- **Type Conflicts:** If external props are unknown, use `unknown` and add a `TODO` comment rather than `any`.

## Related Commands
- `/component`
- `/page`

## Related Templates
- `templates/component.tsx`
