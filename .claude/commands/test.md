---
id: cmd_test
version: 1.0.0
owner: AI_Architect
category: Command
depends_on: [skill_testing]
---

# Command: `/test`

## Description
Triggers the Test Generation workflow. Detects the context of the target file (UI vs Edge vs DB) and scaffolds appropriate Vitest or Playwright tests.

## Associated Skill
- [skills/testing.md](../skills/testing.md)

## Example Usage
> /test src/features/auth/components/LoginForm.tsx

## Validation
Agent must run the generated test in the background and iteratively fix any immediate assertion failures caused by bad mocks.
