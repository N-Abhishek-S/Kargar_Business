---
id: skill_testing
version: 1.0.0
owner: AI_Architect
category: Skill
depends_on: [standard_testing, standard_typescript]
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: high
tags: [vitest, playwright, testing]
---

# Skill: Test Generation

## Purpose
Autonomously generate robust, architecture-aligned test suites for UI components, Edge Functions, and SQL schemas.

## When to use
Invoke this skill whenever a new feature is completed, or when the user explicitly requests regression testing.

## Inputs
- `Target File/Component/Table`
- `Test Type` (Unit, Component, E2E, SQL)

## Outputs
- `[FileName].test.tsx` or `[FileName].test.ts`
- E2E Playwright specs

## Required Standards
- [standards/testing.md](../standards/testing.md)

## Dependencies
- `vitest`
- `@testing-library/react`
- `@playwright/test`

## Validation Rules
1. Must not test internal implementation details (like local state).
2. Must assert on ARIA roles or visible text for UI.
3. Mocks must be strongly typed.

## Workflow
1. **Analyze:** Determine the execution context of the target (Frontend vs Edge vs DB).
2. **Setup:** Generate test boilerplate and mock dependencies.
3. **Assert:** Write explicitly described test cases mirroring user behavior or boundary conditions.
4. **Cleanup:** Ensure mocked timers and network requests are reset.

## Failure Handling
- **Unmockable Dependencies:** Inform the user if a module is too tightly coupled to be unit tested and suggest an integration test instead.

## Related Commands
- `/test`

## Related Templates
- `templates/test.ts`
