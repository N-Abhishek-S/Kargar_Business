---
id: cmd_component
version: 1.0.0
owner: AI_Architect
category: Command
depends_on: [skill_react_component]
---

# Command: `/component`

## Description
Triggers the React Component Generation workflow. Ensures the created component complies with `standards/react.md`, `standards/typescript.md`, and `standards/tailwind.md`.

## Associated Skill
- [skills/react_component.md](../skills/react_component.md)

## Example Usage
> /component "Create a responsive PricingTable with 3 tiers in the billing feature domain. It should accept an activePlan prop."

## Validation
Agent must automatically check ESLint and TypeScript compilation after generation.
