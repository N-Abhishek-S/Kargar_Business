---
id: research_investigate_performance
version: 1.0.0
owner: AI_Architect
category: Research
---

# Research Workflow: Investigate Performance Issue

## Objective
Systematically identify and resolve performance bottlenecks across the stack (frontend rendering or backend querying).

## Research Strategy
1. **Frontend Profiling:** Check for excessive re-renders (using React Developer Tools concepts) and missing `memo` boundaries.
2. **Network Waterfall:** Analyze if requests are waterfalling instead of firing in parallel via `Promise.all`.
3. **Database Querying:** Analyze Supabase logs for slow SQL queries (missing indexes).

## Evidence Requirements
- Must identify the exact file and line causing the bottleneck.
- Must quantify the issue (e.g., "Query takes 800ms due to missing index").

## Decision Framework
- Is it a UI issue? Apply `useMemo` or React Query caching.
- Is it a DB issue? Generate a migration to add an index via [skills/database_migration.md](../skills/database_migration.md).

## Expected Output
A `performance_report.md` artifact identifying the root cause and a proposed code change or SQL migration to resolve it.
