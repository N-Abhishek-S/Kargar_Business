# SEO Architecture

How metadata, structured data, and the build-time SEO checks fit together in the
`frontend/` app. Read this before adding a page, a service, or changing anything
under `frontend/scripts/seo/`.

## 1. Where metadata lives

There are exactly two sources of truth — never a third:

- **Static routes** (`/`, `/services`, `/sectors`, `/company-profile`, `/support`,
  `/contact-us`, `/admin`, `/404`) → `frontend/src/features/seo/registry.ts`
  (`seoRegistry`, resolved via `getSeoEntry(pathname)`).
- **Dynamic category/service routes** (`/services/:categoryId`,
  `/services/:categoryId/:serviceId`) → the `seo` field already on each `Category`/
  `Service` object in `frontend/src/features/services/config/{categories,hard-services,soft-services}.ts`.

Nothing else should hold a page title/description. `KargarSinglePage.tsx`,
`ServicePage.tsx`, and `CategoryPage.tsx` all just read from one of these two
places and hand the result to `<SEO />`.

## 2. Rendering: `SEO.tsx`

`frontend/src/components/seo/SEO.tsx` is the only place that touches
`react-helmet-async`. It takes `title`/`description`/`canonicalUrl`/`ogImage`/
`robots`/`breadcrumbItems`/`schema` and renders:

- `<title>`, meta description, meta robots (built from the `robots` prop via
  `buildRobotsContent` — pass `{ index: false, follow: false }` for anything
  that shouldn't be indexed, e.g. admin pages, `/404`)
- canonical `<link>` + `hreflang` (`en-IN` + `x-default`)
- OG/Twitter tags (`ogImage` falls back to the brand logo; pages with a real
  hero image pass it explicitly — see `ServicePage.tsx`)
- one `@graph` JSON-LD block: Organization + LocalBusiness + WebSite/SearchAction
  (always) + a `BreadcrumbList` built from `breadcrumbItems` + whatever extra
  nodes the page passes via `schema` (e.g. `Service`, `FAQPage`)

Reusable builders for all of the above live in `frontend/src/lib/seo/`:
`canonical.ts` (`buildCanonicalUrl`), `schema.ts` (the JSON-LD node builders),
`breadcrumbs.ts` (`buildServiceBreadcrumbs` — shared by `HeroSection.tsx`'s
visible breadcrumb and the `BreadcrumbList` schema, so they can't drift apart).

**Important constraint:** everything in `src/lib/seo/*` and `SEO.tsx` imports
`@/config`, which reads `import.meta.env` — these only work under Vite. Don't
import them from the Node build scripts (see §4).

## 3. Adding things

**New static page:** add an entry to `seoRegistry` in `registry.ts` (title
21-31 chars raw — `SEO.tsx` appends ` | Kargar Facility Management`, ~29 chars,
to reach the 50-60 char target; description 140-160 chars), add the route in
`App.tsx`, done. `validate-route-coverage` will fail the build if you add one
without the other.

**New service or category:** add it to the relevant config file with a real
`seo: { title, description, keywords? }` (same length targets) and real
`faqs` if you have them — `ServicePage`/`CategoryPage` pick these up
automatically, no other file needs to change. Keep `relationships.relatedServices`
pointing only at ids that actually exist — `validate-schema` will fail the build
otherwise (this caught and removed several dangling references during the
initial rollout: services like `plumbing`/`fire-fighting`/`pest-control` were
referenced but never built).

**New keyword:** update the PDF-derived keyword mapping by editing the relevant
`seo.keywords` array (registry entry or service/category `seo` field) — don't
scatter the same keyword across unrelated pages (`validate-metadata` checks
each page's primary keyword is actually present in its own title/description,
not that it's unique to that page, but keyword cannibalization is still a
content-review concern, not something the pipeline can catch).

## 4. The build-time SEO pipeline

`frontend/scripts/seo/` is a self-contained Node pipeline, run via `tsx` (not
Vite) before every build (`"prebuild"` in `package.json`, which npm runs
automatically before `"build"`). Run it standalone with `npm run seo`.

It runs under a dedicated `frontend/scripts/tsconfig.seo.json` (mapping `@/*` →
`../src/*`) because the repo's root `tsconfig.json` is a solution file with no
`paths` of its own — without `--tsconfig scripts/tsconfig.seo.json`, `@/`
imports fail to resolve under plain `tsx`.

**Node-safe vs. Vite-only imports** — this is the one thing to know before
touching these scripts. `frontend/src/config/index.ts` reads
`import.meta.env`, which is `undefined` outside Vite; importing it (or anything
that imports it — `@/lib/seo/*`, `@/components/seo/SEO.tsx`) from a script
crashes immediately. That's why `scripts/seo/seo.config.ts` hardcodes its own
`SITE_URL` constant instead of importing `config.siteUrl` — **keep the two in
sync by hand** if the canonical domain ever changes. Everything else the
scripts import (`registry.ts`, the services `config` barrel, `service.types.ts`)
is plain data with no runtime env dependency, so it's safe to import directly.

Order of operations (`scripts/seo/index.ts`):

1. **`generate-robots.ts`** — writes `public/robots.txt` from
   `seo.config.ts`'s `DISALLOWED_PREFIXES`.
2. **`generate-sitemap.ts`** — writes `public/sitemap.xml` from
   `route-inventory.ts` (every static + dynamic page), including
   `<image:image>` entries for pages with a known hero image
   (`seo.config.ts`'s `PAGE_IMAGES` map).
3. **`generate-redirects.ts`** — merges `seo.config.ts`'s `REDIRECTS` list into
   `vercel.json`'s `redirects` array (read-modify-write; preserves
   `framework`/`rewrites`/`headers`).
4. **`validate-canonicals.ts`** — every page's canonical is https, on
   `SITE_URL`, has no trailing slash, isn't a duplicate, and doesn't leak to
   the homepage.
5. **`validate-metadata.ts`** — title/description exist, hit their length
   targets, aren't duplicated across pages, and the page's primary keyword
   actually appears in its own title or description.
6. **`validate-headings.ts`** — a static scan (no SSR, so no rendered DOM to
   check — see §5) of `KargarSinglePage.tsx`, `NotFoundPage.tsx`, and
   `HeroSection.tsx`: at most one `<h1>` per render branch, never empty, never
   reused verbatim across two different pages.
7. **`validate-alt-text.ts`** — every `<img>`/`<OptimizedImage>` in `src/`:
   decorative images (`aria-hidden`/`decorative`) have empty `alt`; content
   images have a non-empty, non-generic `alt` (flags `alt="image"` etc.).
8. **`validate-schema.ts`** — validates the *data* feeding the JSON-LD builders
   (not the builders themselves — see the Node-safety note above): every
   category/service has the fields `Service`/`FAQPage` schema needs, no
   duplicate schema ids, no dangling `relatedServices` references.
9. **`check-links.ts`** — every literal `to="/…"`/`href="/…"` in `src/`
   resolves to a real route. Can't resolve template-literal links (e.g.
   `` to={`/services/${category.slug}`} ``) to an exact path — those are
   counted separately and surfaced as a caveat in the report, not silently
   ignored.
10. **`validate-route-coverage.ts`** — every static route in `App.tsx` has a
    registry entry and vice versa; the `/services/:categoryId(/:serviceId)`
    patterns exist if any category/service data does.
11. **`seo-report.ts`** — prints a summary: page counts, a crawl-depth tree,
    per-page internal link tallies (with the template-literal caveat above),
    and a Search Console readiness checklist.

Any validator failing exits non-zero, which fails `npm run build`.

## 5. Known, intentional gaps

Documented here instead of silently "fixed," so nobody assumes more coverage
than actually exists:

- **No SSR/prerendering.** This is a pure Vite CSR SPA. Google/Bing execute JS
  and pick up Helmet's per-page tags, but a non-JS crawler or an unfurler
  hitting a deep link cold sees only `index.html`'s static homepage OG/Twitter
  tags. That static block is a homepage-only fallback, not per-page data.
- **`/sectors`, `/company-profile`, `/support`** render the same `HomePage`
  content component as `/`, just with distinct metadata. They don't have
  unique on-page copy yet — that's a content project, not a metadata fix.
- **No site-wide CSP.** Would need enumerating every real third-party host
  (GA/GTM/Clarity/Hotjar/Sentry/EmailJS/Supabase/Google Fonts) or it breaks the
  site; left for a dedicated security pass.
- **No true dynamic per-page OG images.** `ogImage` reuses existing real
  service/category hero images where available; nothing generates new images
  per page (e.g. via `@vercel/og`).
- **The mentor-marketplace feature** (`src/features/people/mentors/*`) has no
  routes wired into `App.tsx` and is out of scope for all of the above until
  it's actually live.
