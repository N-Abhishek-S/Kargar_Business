---
id: auto_new_feature
version: 1.0.0
owner: AI_Architect
category: Automation
---

# Automation Workflow: New Feature

## Description
An orchestrated workflow that Claude Code invokes to build an entire vertically integrated feature (Database → API → UI).

## Invocation
> "Run the New Feature automation for [Feature Name]."

## Workflow Steps

### Step 1: Database Layer
1. Invoke `/migration` to generate the schema and RLS policies for the feature.
2. Verify against `standards/database.md`.

### Step 2: Backend Logic Layer
1. If third-party logic is needed, invoke `/edge-function` to scaffold the Zod-validated endpoint.
2. Otherwise, rely on Supabase direct client access.

### Step 3: API/Types Layer
1. Run `supabase gen types` to update the TypeScript schema.
2. Generate Zod schemas for the frontend to mirror the expected data shapes.

### Step 4: UI Component Layer
1. Invoke `/feature` (or `/component` manually) utilizing the [bp_react_feature](../blueprints/react_feature.md) blueprint.
2. Wire up React Query hooks connecting the UI to the Supabase client/Edge Function.

### Step 5: Testing & Validation
1. Invoke `/test` to generate Vitest/Playwright regression tests for the feature.
2. Run the [PR Review Checklist](../checklists/pr_review.md) locally before concluding.
