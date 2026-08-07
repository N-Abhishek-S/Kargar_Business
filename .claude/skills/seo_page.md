---
id: skill_seo_page
version: 1.0.0
owner: AI_Architect
category: Skill
depends_on: [standard_seo, standard_react, standard_accessibility]
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: medium
tags: [seo, metadata, schema, react]
---

# Skill: SEO Page Optimization

## Purpose
Autonomously inject semantic HTML, dynamic metadata, and JSON-LD structured data into React pages for high search engine visibility.

## When to use
Invoke this skill when building public-facing landing pages, service descriptions, or blog posts.

## Inputs
- `Page Component Name`
- `Target Keywords / Focus`
- `Entity Type` (e.g., LocalBusiness, Service)

## Outputs
- Modified `[PageName].tsx` integrating `react-helmet-async`.
- Generated JSON-LD schemas.

## Required Standards
- [standards/seo.md](../standards/seo.md)
- [standards/react.md](../standards/react.md)

## Dependencies
- `react-helmet-async`

## Validation Rules
1. Ensure exactly one `<h1>` tag exists on the page.
2. Verify Open Graph (`og:`) and Twitter (`twitter:`) tags are populated.
3. Validate JSON-LD syntax integrity.

## Workflow
1. **Analyze:** Review the page content and target entity.
2. **Inject Helmet:** Wrap the metadata inside `<Helmet>`.
3. **Structure HTML:** Refactor `<div>` tags into semantic `<section>`, `<article>`, or `<main>`.
4. **Build Schema:** Construct the strictly typed JSON-LD blob.

## Failure Handling
- **Missing Data:** Fallback to site-wide defaults (from `siteMetadata.json`) if specific page descriptions are absent.

## Related Commands
- `/seo`
- `/page`

## Related Templates
- `templates/page.tsx`
