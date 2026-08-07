---
id: standard_seo
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: [standard_react, standard_accessibility, standard_performance]
review_frequency: quarterly
last_updated: 2026-07-21
status: stable
priority: medium
tags: [seo, schema, metadata, web-vitals]
---

# Kargar SEO Standards

## Purpose
Ensure the KargarWeb project dominates search engine rankings through semantic HTML, structured data, and high-performance metrics.

## Scope
Applies to React Helmet implementations, routing, public assets, and semantic structure.

## Applies To
- `frontend/src/pages/**/*.tsx`
- `frontend/public/`
- Semantic UI components

## Required Rules
1. **Dynamic Metadata:** Every public page must inject dynamic `<title>`, `<meta name="description">`, and Open Graph/Twitter Card tags using `react-helmet-async`.
2. **Schema.org (Structured Data):** Inject `application/ld+json` for entities critical to KargarWeb (e.g., `LocalBusiness`, `Service`, `FAQPage`, `Review`).
3. **Semantic Hierarchy:** Ensure exactly one `<h1>` per page. Heading hierarchy (`<h2>`, `<h3>`) must not skip levels.
4. **Local SEO:** Crucial for service businesses. Address, contact info, and service areas must be strictly tagged in JSON-LD.

## Recommended Practices
- **Canonical URLs:** Always define `<link rel="canonical" href="..." />` to prevent duplicate content penalties.
- **Image Optimization:** All images must have descriptive `alt` tags (inherited from [Accessibility Standards](accessibility.md)) and fast loading times (inherited from [Performance Standards](performance.md)).

## Anti-Patterns
- Client-side rendering (CSR) without pre-rendering or SSR for public landing pages (Search engines may fail to index JS-heavy SPA content properly; consider Prerender.io or SSG if strictly SPA).
- Keyword stuffing in `alt` tags or hidden `<div>` elements.
- Missing `robots.txt` or `sitemap.xml`.

## Examples
```tsx
// Good: SEO Metadata Injection for Kargar Services
import { Helmet } from 'react-helmet-async';

export function ServicePageSEO({ serviceTitle, description }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceTitle,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Kargar"
    }
  };

  return (
    <Helmet>
      <title>{serviceTitle} | Kargar Professional Services</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={serviceTitle} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
```

## Validation Checklist
- [ ] Valid Schema.org JSON-LD exists on public pages.
- [ ] No multiple `<h1>` tags on a single view.
- [ ] `robots.txt` and `sitemap.xml` are accessible.

## Related Standards
- [standards/react.md](react.md) (Component rendering)
- [standards/accessibility.md](accessibility.md) (Alt tags and semantics)
- [standards/performance.md](performance.md) (Core Web Vitals impact)
