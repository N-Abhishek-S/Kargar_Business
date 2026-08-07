---
id: cmd_seo
version: 1.0.0
owner: AI_Architect
category: Command
depends_on: [skill_seo_page]
---

# Command: `/seo`

## Description
Triggers the SEO Page Optimization workflow. Injects Helmet, metadata, and JSON-LD structured data into the target page.

## Associated Skill
- [skills/seo_page.md](../skills/seo_page.md)

## Example Usage
> /seo src/pages/PlumbingServices.tsx "Focus on local plumbing services in [City Name], entity type: Service"

## Validation
Agent must verify valid JSON syntax in the injected structured data block.
