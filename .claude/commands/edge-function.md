---
id: cmd_edge_function
version: 1.0.0
owner: AI_Architect
category: Command
depends_on: [skill_edge_function]
---

# Command: `/edge-function`

## Description
Triggers the Supabase Edge Function generation workflow. Guarantees Zod validation boundaries and strict error handling are scaffolded.

## Associated Skill
- [skills/supabase_edge_function.md](../skills/supabase_edge_function.md)

## Example Usage
> /edge-function "Generate a webhook handler for Stripe subscriptions that verifies the signature and updates the users table."

## Validation
Agent must verify that Deno imports resolve and Zod parses the expected payload.
