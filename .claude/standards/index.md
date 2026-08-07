---
id: standards_index
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: []
review_frequency: monthly
last_updated: 2026-07-21
status: stable
priority: high
tags: [index, standards, graph]
---

# Standards Dependency Graph & Index

## The Dependency Graph
The engineering standards form a strict, acyclic dependency graph. Lower-level standards provide foundational rules that higher-level standards orchestrate.

```text
typescript (Core Typing & Data Shapes)
    │
    ├──► react (UI Boundaries & Data Fetching)
    │       │
    │       ├──► tailwind (Styling)
    │       │
    │       ├──► accessibility (React A11y & ARIA)
    │       │
    │       └──► seo (Semantic HTML & Schema)
    │
    ├──► supabase (Edge Functions & Auth)
    │       │
    │       └──► database (Postgres & Migrations)
    │
    ├──► security (Umbrella for Zod, Auth, RLS, Secrets)
    │
    ├──► performance (Full-Stack Optimization)
    │
    ├──► observability (Telemetry & Error Boundaries)
    │
    └──► testing (Unit, Integration & E2E)

vite (Builds & Environment)
git (SCM & Versioning)
```

## Standards Index

| Standard | Purpose | Depends On | Used By |
| :--- | :--- | :--- | :--- |
| `typescript.md` | Global Type Safety & Zod validation | — | React, Supabase, Testing, Security |
| `react.md` | UI Boundaries & React Query | `typescript.md` | Tailwind, Accessibility, SEO |
| `vite.md` | Build, Env Vars, Splitting | `typescript.md` | Performance, Security |
| `tailwind.md` | Utility Styling & Merging | `react.md` | Accessibility |
| `git.md` | SCM, Atomic Commits | — | CI workflows |
| `supabase.md` | Edge Functions, Auth, Client | `typescript.md` | Database, Security, Testing |
| `database.md` | PostgreSQL, Migrations | `supabase.md` | Security, Performance |
| `security.md` | Umbrella for RLS/Auth/Inputs | `typescript.md`, `supabase.md`, `vite.md` | Entire Stack |
| `testing.md` | Architecture-mirrored validation | `typescript.md`, `react.md`, `supabase.md` | CI workflows |
| `performance.md` | Full-stack rendering & querying | `react.md`, `supabase.md`, `vite.md` | SEO, Accessibility |
| `accessibility.md` | ARIA, Focus, Semantic HTML | `react.md` | SEO |
| `seo.md` | Metadata, Schema.org, Local SEO | `react.md`, `performance.md` | Entire App |
| `observability.md`| Telemetry, Error Boundaries | `react.md`, `supabase.md` | Testing, Security |
