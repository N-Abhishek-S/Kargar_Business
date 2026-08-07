# Kargar Business Services — SEO Audit Report

**Site:** https://www.kargarbusinessservices.com
**Stack:** React 19 + Vite 8 SPA (client-side rendered, no SSR/prerendering), React Router 8, Supabase backend, deployed on Vercel.
**Audit type:** CODE-BASED ANALYSIS. No live crawl, PageSpeed/CrUX, Search Console, GA4, Moz, Bing, DataForSEO, or Ahrefs data was fetched — credential checks (`google_auth.py --check`, `backlinks_auth.py --check`) confirmed no API keys/OAuth tokens are configured in this environment. Every finding below is derived from reading the actual repository source, the generated `sitemap.xml`/`robots.txt`, and the output of the project's own `npm run seo` validation pipeline. Where a live-data check (PageSpeed, GSC indexation, CrUX field data, backlink profile, competitor SERPs) would normally apply, it is listed as an unresolved gap in "Quick Wins" rather than fabricated.

---

## 1. Executive Summary

**SEO Health Score: 74 / 100**

| Category | Weight | Score | Notes |
|---|---|---|---|
| Technical SEO | 22% | 78 | Solid pipeline, but SPA has no SSR/prerender fallback for non-JS crawlers/unfurlers |
| Content Quality | 23% | 55 | 4 of 8 public URLs render byte-identical body content |
| On-Page SEO | 20% | 68 | Metadata is disciplined; H1s are duplicated across routes |
| Schema/Structured Data | 10% | 60 | Good coverage, but two disconnected/conflicting Organization nodes |
| Performance (CWV) | 10% | 65 | 5 unoptimized PNGs (694KB–941KB), no lab/field data available |
| AI Search Readiness (GEO) | 10% | 72 | Clean semantic HTML, decent FAQ depth, but shared content hurts citability |
| Images | 5% | 70 | Alt text discipline is good; format/compression is not |

This is a small, disciplined marketing site (8 real content routes) with an unusually mature build-time SEO pipeline (`scripts/seo/*`, documented in `docs/SEO_ARCHITECTURE.md`) — this is well above what most sites this size have. The problems found are not "nobody thought about SEO" problems; they are architectural side-effects of the SPA reusing one `HomePage` component across four distinct nav destinations, and two structured-data authors (`SEO.tsx` and `ReviewsSection.tsx`) that don't share a single source of truth.

**Top 5 Critical/High Issues**
1. **`/sectors`, `/company-profile`, `/support` render byte-identical body HTML to `/`** — only `<title>`/meta differ (P0/P1, see 4.1)
2. **Duplicate, conflicting `Organization` JSON-LD nodes** with different names and no shared `@id` (P1, see 6.1)
3. **Self-serving `AggregateRating` on `Organization`** — violates Google's structured-data guidelines for review markup (P1, see 6.2)
4. **Homepage `<h1>` text is identical across 4 different URLs** (`/`, `/sectors`, `/company-profile`, `/support`) — the project's own `validate-headings` script cannot catch this because it scans components, not rendered routes (P1, see 5.1)
5. **5 product/service PNGs are 694KB–941KB, uncompressed, non-next-gen format** — real LCP/CLS risk on service and category pages (P1, see 9.1)

**Top 5 Quick Wins**
1. Add real Google Search Console + PageSpeed Insights credentials so future audits get field CWV and indexation data (currently zero visibility)
2. Convert the 5 oversized PNGs in `public/images/services/` to WebP/AVIF (no code change needed beyond `<img>`/`OptimizedImage` src swap)
3. Give `/sectors`, `/company-profile`, `/support` their own `<h1>` and at least one unique paragraph of copy (small, contained change)
4. Merge the `ReviewsSection` Organization+AggregateRating block into the single `@graph` in `SEO.tsx` (remove the duplicate entity)
5. Replace the four placeholder social links (`facebook.com`, `instagram.com`, etc. with no company handle) with real profile URLs or remove them — they currently contribute nothing to `sameAs` entity verification

---

## 2. Current SEO Architecture

- **Rendering:** Pure Vite CSR SPA. No SSR, no static prerendering, no islands. `docs/SEO_ARCHITECTURE.md` documents this as an intentional, known gap: Googlebot/Bingbot execute JS and see per-page Helmet tags, but any non-JS crawler or link-unfurler hitting a deep link cold sees only `index.html`'s static homepage OG/Twitter block.
- **Routing (`src/App.tsx`):** `react-router` v8, 8 public routes + `/admin/*` (lazy-loaded, noindexed) + catch-all 404.
  - `/`, `/services`, `/sectors`, `/company-profile`, `/support`, `/contact-us` → all resolve to `<KargarSinglePage />`
  - `/services/:categoryId`, `/services/:categoryId/:serviceId` → `CategoryPage` / `ServicePage` (2 categories × 2 services currently modeled = 4 live service pages)
  - `/admin/**` → lazy chunk, `noindex,nofollow`, `X-Robots-Tag: noindex` header in `vercel.json`
- **Metadata:** Two sources of truth by design (documented, and actually followed in code):
  - Static routes → `src/features/seo/registry.ts` (`seoRegistry`)
  - Dynamic service/category routes → `seo` field on each `Category`/`Service` object in `src/features/services/config/*.ts`
- **Rendering component:** `src/components/seo/SEO.tsx` — the only place `react-helmet-async` is touched. Builds title, meta description, robots, canonical + hreflang (`en-IN` + `x-default`), OG/Twitter, and one `@graph` JSON-LD block (Organization + LocalBusiness + WebSite/SearchAction + BreadcrumbList + page-specific nodes).
- **Structured data builders:** `src/lib/seo/schema.ts` — `buildOrganizationSchema`, `buildLocalBusinessSchema`, `buildWebsiteSchema`, `buildBreadcrumbSchema`, `buildServiceSchema`, `buildCategoryServiceSchema`, `buildFAQSchema`.
- **Sitemap/robots:** Generated, not hand-maintained, by `scripts/seo/generate-sitemap.ts` / `generate-robots.ts`, driven by `scripts/seo/route-inventory.ts`. Current output: 12 URLs (6 static + 2 category + 4 service), `Disallow: /admin`, sitemap reference present.
- **Build-time SEO pipeline (`scripts/seo/*`, run via `npm run seo` / automatically as `prebuild`):** generate-robots → generate-sitemap → generate-redirects (merges into `vercel.json`) → validate-canonicals → validate-metadata → validate-headings → validate-alt-text → validate-schema → check-links → validate-route-coverage → seo-report. All 7 validators **PASS** as of this audit. This is a genuinely strong practice — most sites this size have none of this.
- **Redirects:** `/contact` → `/contact-us` (permanent), managed in `vercel.json`, merged by the generator script.
- **Canonical implementation:** `src/lib/seo/canonical.ts` (`buildCanonicalUrl`) — enforced https, `SITE_URL`-anchored, no trailing slash, validated at build time.
- **Supabase usage:** Reviews (`reviews.service.ts`, `AdminReviewsPage`), contact messages (`contact.service.ts`), newsletter — all backend data, not part of static SEO surface, correctly excluded from crawl/sitemap.
- **Indexability:** `/admin` correctly excluded (robots.txt `Disallow`, per-page `noindex`, and an edge header). `/404` correctly `noindex,nofollow`.
- **Not indexed (correctly):** `/admin/**`, `/404`.
- **Should be indexed but are effectively duplicates (see 4.1):** `/sectors`, `/company-profile`, `/support`.

---

## 3. Critical Blockers (P0)

### 3.1 — None block indexing outright, but one item is functionally P0-adjacent

**Issue:** No SSR/prerendering means link-unfurlers (Slack, WhatsApp, LinkedIn, iMessage) and any crawler that doesn't execute JS see only the static homepage OG block from `index.html` for every URL on the site — a shared link posted for `/services/hard-services/electrical-maintenance` in Slack will show "Kargar Facility Management — India's Trusted FM Partner" with the homepage description, not the electrical-maintenance page's own title/description/image.
**Severity:** P1 (downgraded from P0 because Google/Bing themselves render JS and are not affected — this is a social/messaging-surface problem, not an indexing problem)
**Evidence:** `docs/SEO_ARCHITECTURE.md` §5 documents this explicitly as a known, intentional gap; `index.html` lines 35–47 contain only one static OG block.
**Affected URL:** All deep links (every `/services/**` URL, `/contact-us`, etc.)
**Affected file:** `frontend/index.html`
**Why it matters:** Every service/category page shared on social or messaging apps degrades to generic homepage branding — this directly undercuts the click-through value of the page-specific `ogImage`s already being generated in `ServicePage.tsx`.
**Recommended fix:** Not a quick fix — would require prerendering (`vite-plugin-ssr`, `vite-react-ssg`, or a Vercel Edge Middleware bot-detector that serves prerendered HTML to known crawlers/unfurlers only) for the ~12 known static/dynamic routes. Given the small, finite route count (`route-inventory.ts` already enumerates every route), static prerendering at build time is tractable without adopting a new framework.
**Expected impact:** Correct social previews for every page; marginal indexing/ranking upside since Google already executes JS.
**Implementation difficulty:** Medium (route list is already enumerated; the work is wiring a prerender step into the existing Vite build, not architecting page discovery from scratch).

---

## 4. Technical SEO Findings

### 4.1 — P0/P1: Four distinct nav destinations render identical page content
**Severity:** P1 (P0-adjacent — this is a duplicate-content pattern serious enough to risk Google collapsing rankings onto one canonical URL and ignoring the others)
**Evidence:** `src/pages/KargarSinglePage.tsx` lines 661–673 (`HomePage`) and 705–721 — `HomePage` (`<HomeHero/><ClientStrip/><ServicesSection/><CompanyProfileSection/><IndustriesSection/><ReviewsSection/><SupportBand/>`) is rendered for `pathname === '/'`, `'/sectors'`, `'/company-profile'`, and `'/support'` with zero conditional content. Only `<title>`/meta description/canonical (via `seoRegistry`) differ. This is also explicitly acknowledged in `docs/SEO_ARCHITECTURE.md` §5: *"`/sectors`, `/company-profile`, `/support` render the same `HomePage` content component as `/`. They don't have unique on-page copy yet — that's a content project, not a metadata fix."*
**Affected URLs:** `/sectors`, `/company-profile`, `/support` (vs. `/`)
**Affected file:** `frontend/src/pages/KargarSinglePage.tsx`
**Why it matters:** Google evaluates pages primarily by rendered content, not `<title>`/meta. Four URLs with identical body text and near-identical templated titles ("Facility Management by Sector" / "Trusted Facility Management" / "Facility Support Services") are a textbook duplicate-content signal. Best case, Google picks one canonical and the other three rarely rank for anything unique; worst case, ranking signals (links, engagement) fragment across near-duplicates and dilute all four. It also actively confuses the metadata registry's investment — three pages have carefully written, keyword-distinct descriptions (`sectors` targets "Industrial Facility Management," `support` targets "Facility Support Services") that will never earn distinct rankings because the page they describe isn't distinct.
**Recommended fix:** This is genuinely a content project as the docs say, not a code fix — but the SEO-safe interim options, in priority order: (a) build the promised unique content for each page (sector list with real per-sector copy, company profile/timeline content, support-process content) — best outcome; (b) if that's not scheduled soon, `noindex,follow` the three secondary routes and merge their nav entries as in-page anchors/sections on `/` instead of separate indexable URLs, which matches what they already functionally are; (c) at minimum, canonicalize `/sectors`, `/company-profile`, `/support` to `/` to stop three near-duplicate URLs from competing in the index — but this actively fights the distinct metadata already written for them, so (a) or (b) are strongly preferred.
**Expected impact:** Removes index-dilution risk on the homepage's actual ranking terms; frees three URLs to either genuinely rank or stop being liabilities.
**Implementation difficulty:** High for (a) (real content work), Low for (b)/(c) (metadata/robots-only change).

### 4.2 — P2: Orphan-page warning from the build pipeline needs verification, not code changes
**Evidence:** `npm run seo` output: `/services/hard-services`, `/services/soft-services`, and all 4 service detail pages report **0 statically-resolvable incoming internal links**. The script itself notes 2 additional links exist as template literals (`to={`/services/${category.slug}`}` in `CollectionSection.tsx` and `ServiceCategoryCard.tsx`) that it can't resolve, so a 0 count doesn't necessarily mean orphaned.
**Affected files:** `scripts/seo/check-links.ts` (scanner limitation), `src/features/services/components/CollectionSection.tsx`, `ServiceCategoryCard.tsx` (actual nav source)
**Why it matters:** If these pages are in fact only reachable via the `ServicesSection`/`CollectionSection` cards (confirmed present in code) then they're not truly orphaned, but the build report can't prove that, so nobody has verified it end-to-end recently.
**Recommended fix:** Either teach `check-links.ts` to resolve the two known template-literal patterns (`${category.slug}`, `${service.categoryId}-services/${service.slug}`) against `route-inventory.ts`'s known slugs, or accept the manual-verification burden and note it. Low effort for meaningful signal improvement, since the patterns are limited to 2 known files.
**Expected impact:** Removes a recurring false-positive warning from every build; catches a real orphan if one is ever introduced.
**Implementation difficulty:** Low.

### 4.3 — P2: `og:url`/canonical domain vs. contact-page website field mismatch
**Evidence:** `src/pages/KargarSinglePage.tsx` line 487 — the Contact page's "Website" field displays `www.kargar.co.in`, but `config.siteUrl` (canonical domain, sitemap, robots.txt, all schema `@id`s) is `www.kargarbusinessservices.com`. `frontend/.env`/`config/index.ts` confirm `kargarbusinessservices.com` is the real, deployed domain.
**Affected URL:** `/contact-us`
**Affected file:** `frontend/src/pages/KargarSinglePage.tsx:487`
**Why it matters:** This is a direct NAP (Name/Address/Phone — here, effectively N-A-P-**W**, website) consistency problem, visible on-page to both users and any local-citation crawler. A visitor or citation aggregator reading the page is told the website is a different domain than the one they're on.
**Recommended fix:** Update the displayed website field to `www.kargarbusinessservices.com`, or clarify if `kargar.co.in` is an intentional secondary/legacy domain (in which case it should 301 to the canonical domain, not be presented as the primary site).
**Expected impact:** Removes a real, user-visible trust/consistency defect; prevents local-citation data from picking up the wrong domain.
**Implementation difficulty:** Low (one string).

### 4.4 — P3: No CSP; four social links point at bare platform homepages, not company profiles
**Evidence:** `src/pages/KargarSinglePage.tsx` lines 181–184 — `href="https://facebook.com"`, `https://instagram.com`, `https://linkedin.com`, `https://youtube.com` — no company handle/slug on any of the four.
**Why it matters:** These don't function as real social proof or `sameAs` entity signals (they're not even wired into schema currently — `buildOrganizationSchema()` has no `sameAs` array at all). A crawler or user clicking any of them lands on a generic platform homepage, not Kargar's profile.
**Recommended fix:** Either link real profile URLs and add them to `buildOrganizationSchema()`'s `sameAs` array (see 6.3), or remove the icons until real profiles exist — placeholder links that go nowhere useful are worse than no links.
**Implementation difficulty:** Low.

### 4.5 — What's already working well (don't touch)
- Canonical/robots/hreflang pipeline is validated at build time and passing — rare for a site this size.
- `/admin` is correctly excluded at three independent layers (robots.txt, per-page `noindex`, edge header) — defense in depth done right.
- URL structure is clean, lowercase, hyphenated, logically nested (`/services/hard-services/electrical-maintenance`).
- Trailing-slash and www/non-www consistency are enforced by the canonical validator.
- No pagination, no query-parameter indexing risk (the one query param, `?q=` in `WebSite.potentialAction`, is a `SearchAction` template, not a crawlable/indexable URL pattern).

---

## 5. On-Page SEO Findings

### 5.1 — P1: Identical `<h1>` text rendered under 4 different URLs
**Evidence:** `HomeHero()` (`KargarSinglePage.tsx:244-279`) contains the single `<h1>Reliable Facility Management Solutions that keep your Business Running Seamlessly</h1>` and is rendered by `HomePage()`, which is used for `/`, `/sectors`, `/company-profile`, and `/support` (see 4.1). The project's own `validate-headings.ts` (per `docs/SEO_ARCHITECTURE.md` §4.6) explicitly checks headings are "never reused verbatim across two different pages" — but it does a **static scan of `KargarSinglePage.tsx`, `NotFoundPage.tsx`, `HeroSection.tsx`**, i.e., it sees `<h1>` once in the source and can't know it's mounted under 4 different routes at runtime (no SSR to render against). This is why the pipeline reports PASS despite the real-world duplication.
**Why it matters:** H1 is one of the strongest on-page relevance signals; having the exact same H1 answer 4 different URLs directly reinforces the duplicate-content problem in 4.1 and gives Google zero on-page signal to differentiate them.
**Recommended fix:** Same fix as 4.1 — this resolves itself once each route has its own content section with its own H1. Cannot be fixed as an isolated metadata tweak.
**Implementation difficulty:** Tied to 4.1.

### 5.2 — P2: `ServicesPage` and category pages share overlapping intent with `/services`
**Evidence:** `/services` (via `KargarSinglePage.tsx`'s `ServicesPage()`) lists both categories and links into `/services/hard-services`, `/services/soft-services`, which themselves list their own services, which link to `/services/hard-services/electrical-maintenance` etc. Category-level pages (`CategoryPage.tsx`) were not fully read in this pass but their `seo` fields (from `categories.ts`) target "Hard Services / Building Maintenance / MEP Maintenance" — broad terms that overlap with what individual service pages (`hard-services/electrical-maintenance`) also target ("Electrical Maintenance / LT Panels / HT Panels").
**Why it matters:** This is a normal, healthy hub-and-spoke pattern (category page = commercial intent hub, service page = commercial/transactional intent for a specific service) as long as category pages stay broad and service pages stay specific — worth a periodic check as more services are added, not an issue today with only 2 services live per category.
**Recommended fix:** No action needed now; flag as a watch-item once category → service ratio grows past ~5 services per category.
**Implementation difficulty:** N/A (monitoring only).

### 5.3 — P3: Meta descriptions and titles are well-disciplined
**Evidence:** `registry.ts` titles are 21–31 raw characters (SEO.tsx appends `" | Kargar Facility Management"` to land ~50–60 total); descriptions consistently 140–160 chars; `validate-metadata.ts` enforces this and enforces the primary keyword actually appears in its own title/description. This is genuinely good practice, confirmed by reading the actual values (e.g., `/contact-us`: *"Contact Kargar, a facility management company for corporate offices in Pune, Baner. Request a proposal for housekeeping, security, or maintenance services."* — keyword-relevant, local, action-oriented).
**No fix needed** — flagged here as a positive finding for the scorecard, not an issue.

---

## 6. Structured Data Findings

### 6.1 — P1: Two disconnected, conflicting `Organization` entities
**Evidence:**
- `src/lib/seo/schema.ts` `buildOrganizationSchema()`: `@type: Organization`, `@id: {siteUrl}/#organization`, `name: config.siteName` = **"Kargar Facility Management"**, rendered inside `SEO.tsx`'s single `@graph` on every page.
- `src/features/reviews/components/ReviewsSection.tsx` lines 23–39: a **second**, independent `Organization` JSON-LD block, injected via its own `<Helmet>` (not merged into the page's `@graph`), with `name: 'Kargar Business Services'` (different string) and **no `@id`** at all — so Google cannot associate it with the canonical Organization node from `SEO.tsx`, and instead sees two same-typed entities with different names on the same page.
- `ReviewsSection` renders on `HomePage`, which — per 4.1 — is mounted on `/`, `/sectors`, `/company-profile`, and `/support`, so this duplicate/conflicting node is emitted on **4 separate URLs**, each time as a standalone script tag disconnected from the page's main `@graph`.
**Why it matters:** Structured data validators (Google's Rich Results Test, Schema.org validators) will flag entity ambiguity; more importantly, Google's Knowledge Graph / entity resolution works off consistent `name`+`@id`+`sameAs` signals — presenting two different organization names for the same business on the same page actively works against building a single, strong entity signal.
**Recommended fix:** Delete the standalone `Organization`/`AggregateRating` block in `ReviewsSection.tsx`. Instead, pass an `AggregateRating` addition into the *existing* `buildOrganizationSchema()` (or a new small builder) so it merges into `SEO.tsx`'s single `@graph` under the one canonical `{siteUrl}/#organization` `@id`, and use `config.siteName` consistently instead of the hardcoded `'Kargar Business Services'` string.
**Expected impact:** Single, unambiguous Organization entity site-wide; removes a real Rich Results Test warning.
**Implementation difficulty:** Low-Medium (schema.ts already has the right shape to extend; ReviewsSection needs its Helmet block removed and the stats passed up or read where SEO.tsx is composed).

### 6.2 — P1: Self-serving `AggregateRating` on `Organization` risks a structured-data policy violation
**Evidence:** `ReviewsSection.tsx` lines 26–37 attaches `aggregateRating` directly to a self-authored `Organization` node, sourced from reviews collected through Kargar's own on-site submission form (`reviews.service.ts`, `ReviewSubmissionForm`) and moderated via `AdminReviewsPage` — i.e., first-party testimonials, not independent third-party reviews from a platform like Google/Trustpilot.
**Why it matters:** Google's structured data guidelines for review/rating markup restrict `AggregateRating`/`Review` on your own `Organization`/`LocalBusiness` to genuine, verifiable, non-self-authored reviews, and explicitly warn against organizations marking up their own solicited testimonials this way. Rich Results can be suppressed site-wide for a domain found in violation, which is a materially worse outcome than simply not getting star snippets.
**Recommended fix:** Do not attach `AggregateRating` to `Organization`/`LocalBusiness` for first-party testimonials. Either (a) drop the schema entirely and let the visible star UI speak for itself (safe, no downside), or (b) if there's a genuine, independently verifiable review source in the future (e.g., a real Google Business Profile rating pulled via API), mark that up separately and accurately. This is a compliance/risk fix, not an optimization — treat as higher priority than its "P1 optimization" label suggests if review markup is currently live in production.
**Expected impact:** Removes rich-result suppression risk.
**Implementation difficulty:** Low (delete code; see 6.1 — same fix location).

### 6.3 — P2: `Organization`/`LocalBusiness` missing `sameAs`, `priceRange`, and service-area breadth
**Evidence:** `buildOrganizationSchema()` and `buildLocalBusinessSchema()` (`schema.ts` lines 11–43) have no `sameAs` array (see 4.4 — no real social profiles exist yet to link anyway), no `priceRange`, and `LocalBusiness.address` is a single Pune/Baner `PostalAddress` with no `areaServed` — despite the site's own on-page copy (`OperationsCard`, `KargarSinglePage.tsx:629-645`) claiming **"50+ sites across 5+ cities"** (Mumbai, Pune, Delhi, Bengaluru, Hyderabad).
**Why it matters:** `LocalBusiness` schema with only one address and no `areaServed` tells Google "this business serves one location," directly undercutting the multi-city service-area claim made in visible copy — a mismatch between structured data and on-page content is itself a quality signal Google checks for.
**Recommended fix:** Add `areaServed` (array of `City` entities for the 5 claimed cities, or a `GeoCircle`/state-level area if that's more accurate) to `buildLocalBusinessSchema()`; add `sameAs` once real social profiles exist (6.4); consider `priceRange` only if genuinely representable (B2B custom-quote businesses often omit this legitimately).
**Expected impact:** Structured data accurately reflects the claimed multi-city service area — relevant for 7.2/8 (local pages) below.
**Implementation difficulty:** Low.

### 6.4 — P2: `FAQPage` schema is present and well-formed — flag only per current Google policy, not for removal
**Evidence:** `buildFAQSchema()` (`schema.ts:99-111`) is used on service pages with real FAQ content (`hardServices.electrical.faqs`, 3 well-written Q&As per service — see `hard-services.ts:47-51`).
**Per skill policy:** Google retired FAQ rich results for all sites (May 2026) — this is now Info-level, not a rankings opportunity, and should **not** be removed (the FAQ content itself is good for on-page E-E-A-T/GEO value regardless of rich-result eligibility) and no new FAQPage markup should be added expecting a SERP snippet.
**Recommended fix:** No code change. Keep the FAQ content (valuable for AI Overviews/LLM citability — see GEO notes in §8) but don't expect or promise SERP rich-result benefit from the schema itself going forward.
**Implementation difficulty:** N/A.

### 6.5 — What's already working well
- `BreadcrumbList` is built from the *same* `buildServiceBreadcrumbs()` helper that drives the visible breadcrumb UI (`HeroSection.tsx`), so visible and structured breadcrumbs can't drift apart — good architecture.
- `Service`/`Category` schema (`buildServiceSchema`, `buildCategoryServiceSchema`) correctly references the Organization via `@id` rather than duplicating name/url — the right pattern, just undermined by 6.1's second Organization node.
- `validate-schema.ts` catches dangling `relatedServices` references and duplicate schema IDs at build time (already caught and removed real dead references per the docs) — good discipline.

---

## 7. Local SEO Findings

Kargar is a **B2B service-area business** (integrated facility management for corporate clients), not a walk-in storefront — local SEO here is about service-area credibility and multi-city trust signals, not "map pack for a single storefront."

- **Business identity:** Single registered address (301, 3rd Floor, Unity Commercial, Baner, Pune, Maharashtra 411045) used consistently in `LocalBusiness` schema and the `/contact-us` page — this part of NAP is consistent.
- **NAP inconsistency found:** see 4.3 — the contact page's displayed "Website" field (`www.kargar.co.in`) doesn't match the actual canonical domain (`www.kargarbusinessservices.com`). Phone numbers are consistent (`+91-8788726752` appears identically in schema, header, and contact page); a second number (`+91-9226903010`) appears only in the header topbar, not in schema — worth confirming that's intentional (a secondary sales line) rather than an oversight.
- **Service area vs. schema mismatch:** see 6.3 — claimed 5-city service area (Mumbai, Pune, Delhi, Bengaluru, Hyderabad) is not reflected in `LocalBusiness.areaServed`.
- **No dedicated location pages exist**, and per Phase 7/§8 below, **none are currently justified** — see Programmatic SEO section. The one physical office (Pune/Baner) has a genuine, real address and is the right subject for the existing `/contact-us` page; the other 4 cities are service-area claims, not offices, so they should not each get a doorway-style "facility management in [city]" page without genuinely differentiated local content (case studies, staff coverage specifics, client names) for each.
- **Trust signals present:** real client-facing statistics (10+ years, 2,000+ workforce, 50+ sites, 10,000+ clients) rendered prominently on hero and stats bands — good E-E-A-T-supporting content, assuming these figures are accurate and could be substantiated if challenged.
- **Trust signals missing:** no Google Business Profile link/embed found anywhere in the codebase; no certifications/compliance badges (ISO, safety certifications) rendered as visible content or schema, despite `capabilities: ['iso-compliance']` being present as internal data on service objects (`hard-services.ts:41`) — this is real data that isn't surfaced to users or search engines at all.
- **Reviews:** genuine Supabase-backed review system exists (not fake/scripted testimonials) — this is a real trust asset, undermined only by the schema-policy risk in 6.2, not by the reviews themselves.

**Recommendation:** Do not build per-city location pages yet (see §11). Instead: (1) fix the schema `areaServed` mismatch (6.3, low effort, immediate accuracy win), (2) surface the `iso-compliance`/certification data that already exists in the data layer but isn't rendered anywhere, (3) consider a genuine Google Business Profile if one doesn't exist, since B2B facility-management buyers increasingly check local business profiles for legitimacy before requesting proposals.

---

## 8. Content & Keyword Architecture

**Search intent mapping observed:**

| Page | Intent | Primary keyword (from `seo.title`/`keywords`) |
|---|---|---|
| `/` | Navigational/Commercial | Facility Management Company |
| `/services` | Commercial | Facility Management Services |
| `/services/hard-services` | Commercial | Hard Facility Management |
| `/services/hard-services/electrical-maintenance` | Transactional | Electrical Maintenance |
| `/services/hard-services/hvac-maintenance` | Transactional | Commercial HVAC Maintenance |
| `/services/soft-services` | Commercial | Soft Facility Management |
| `/services/soft-services/housekeeping` | Transactional | (not read this pass — same pattern expected) |
| `/services/soft-services/security-services` | Transactional | (same) |
| `/sectors` | Commercial/Informational | Industrial/Corporate Facility Management (**undercut by 4.1**) |
| `/company-profile` | Navigational/Trust | Trusted Facility Management Company (**undercut by 4.1**) |
| `/support` | Transactional/Support | Facility Support Services (**undercut by 4.1**) |
| `/contact-us` | Transactional | Facility Management Company for Corporate Offices (local: Pune, Baner) |

**Content depth:** Service pages (`electrical-maintenance`, `hvac-maintenance` inspected directly) are genuinely good — 60–80 word `overview`, `scopeOfWork` (4 items), `equipmentMaintained` (5 items), `whyChooseUs` (3 items), 3 real FAQs each. This is real depth, not thin/templated filler, and reads as written by someone who understands the domain (LT/HT panels, VRV/VRF systems, DG synchronization) — a genuine E-E-A-T positive.

**Content gaps:**
- The 3 non-differentiated routes (4.1) are the single biggest content gap — they're registered, indexable URLs with no unique content to justify their existence.
- No blog/insights/resources section exists — for a B2B service with long sales cycles, informational-intent content (e.g., "how often should HVAC be serviced," "facility management RFP checklist") would both support the FAQ content already written and build topical authority the current 8-page site can't achieve alone. Not urgent, but the single largest content-architecture opportunity for organic growth beyond the current commercial/transactional pages.
- Category pages currently model exactly 2 services each (electrical/HVAC under Hard; presumably 2 under Soft) — `whyChooseUs`, `relationships.relatedServices` etc. are already structured to scale, so adding more real services (the docs mention `plumbing`/`fire-fighting`/`pest-control` were referenced-then-removed, implying they were planned) is a natural, low-risk content expansion using the existing template.

**Search intent separation:** Clean — no evidence of two pages competing for the same primary keyword (aside from the 4.1 duplication, which is a content-architecture bug, not a keyword-cannibalization content-strategy problem).

---

## 9. Image Findings

- **Alt text:** Enforced at build time (`validate-alt-text.ts`) — decorative images correctly use `alt=""` + `aria-hidden` (confirmed directly: `HomeHero`'s and `ServicesHero`'s background `<img>` tags), content images have real descriptive alt (`"Modern Kargar office building"` on the contact page `OptimizedImage`). This is good practice, verified in code, not just claimed by the validator.
- **P1 — Format/compression:** `public/images/services/*.png` — 5 files, 694KB–941KB each (`hard-services.png` 941KB, `housekeeping-services.png` 889KB, `soft-services.png` 812KB, `security-services.png` 794KB, `facility-support.png` 694KB). Every other image in `public/images/` is already `.webp` and reasonably sized (65KB–216KB) — these 5 PNGs are the clear outliers and the obvious next target.
  - **Affected files:** `frontend/public/images/services/{hard-services,housekeeping-services,soft-services,security-services,facility-support}.png`
  - **Why it matters:** These are used as `<image:image>` entries in `sitemap.xml` for category/service pages and, per `seo.config.ts`'s `PAGE_IMAGES` map, likely also as hero/OG images for those pages — meaning some of the heaviest images on the site are candidates for the LCP element on exactly the transactional pages that matter most for conversion.
  - **Recommended fix:** Convert to WebP (or AVIF) at the same visual quality — the site already has an `OptimizedImage` component and an established WebP convention for every other image; this is following existing pattern, not introducing a new one. `scripts/process-logos.mjs` already exists in the repo for image processing, suggesting a similar script could target these 5 files directly.
  - **Expected impact:** Likely 60-80%+ file-size reduction based on the WebP-vs-PNG delta already observed elsewhere in the same directory (e.g., `hero-building.webp` at 216KB doing a comparable job to these PNGs). Directly improves LCP on service/category pages.
  - **Implementation difficulty:** Low (asset conversion + path update, no component changes needed since `OptimizedImage`/`<img>` already just take a `src`).
- **Responsive images / `srcset`:** Not verified in this pass — `OptimizedImage.tsx` component exists but wasn't read in full; worth a follow-up check for whether it emits `srcset`/`sizes` or just a single `src` with lazy-loading.
- **fetchpriority/LCP hints:** Hero images (`hero-building.webp` on `HomeHero`, `services-hero.webp` on `ServicesHero`) are plain `<img>` tags with no `fetchpriority="high"` observed in the snippets read — worth confirming, since these are very likely the LCP element on `/` and `/services`.
- **Image sitemap:** Present and correctly scoped — `<image:image>` entries only on pages that have a real, specific hero image (not spammed onto every URL).

---

## 10. Performance Findings (Core Web Vitals)

No lab or field CWV data is available (no PageSpeed/CrUX API access in this environment — see header). Code-based signals only:

- **LCP risk:** The 5 oversized PNGs (§9) are the clearest concrete risk if any are used as above-the-fold hero/card images on their respective pages.
- **JS bundle:** Admin routes are correctly code-split via `lazy()` (`App.tsx` lines 10-16) — good practice, keeps the public bundle from carrying admin-only weight (`react-hook-form` resolvers, admin dashboard logic, etc.).
- **Font loading:** `index.html` uses `preconnect` for Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com` with `crossorigin`) but the stylesheet `<link>` itself has no `font-display` control visible at this layer (Google Fonts CSS2 API defaults to `font-display: swap` automatically as of current Fonts API behavior, so this is likely already fine — not flagged as an issue).
- **Third-party scripts:** `Analytics.tsx` + inline `gtag.js` loader in `index.html` is conditionally gated on `PROD || VITE_FORCE_ANALYTICS` — good, avoids loading GA in dev. GTM/Clarity/Hotjar/Sentry are all present in `config.analytics` but their loading strategy wasn't audited in this pass (worth a follow-up: are they deferred/lazy, or blocking?).
- **CSS:** Tailwind v4 + `cssMinify: true` in `vite.config.ts` — standard, fine.
- **No lab data collected in this audit** — recommend running Lighthouse/PageSpeed Insights directly against the production URL (or `/seo google report` once API credentials are configured) as the immediate next step; this report's performance section is necessarily incomplete without it.

---

## 11. Programmatic SEO Opportunities

**Verdict: Not currently justified — and this is the right call for this business.**

Evaluated combinations:
- **Service × City** (e.g., `/services/hard-services/electrical-maintenance/pune`, `/…/mumbai`, etc.): **Rejected.** With only 4 real services × 5 claimed cities = 20 pages, and no evidence of city-specific content (different technicians, different case studies, different equipment mix per city) to fill them, this would produce 20 near-identical pages differing only by a city name swap — a textbook doorway-page pattern the `seo` skill's quality gates explicitly warn against (30+ location pages triggers a warning, 50+ a hard stop; this would sit right at the edge of the warning threshold with zero unique-content justification).
- **Category × City:** Same problem at smaller scale (2 categories × 5 cities = 10 pages) — same rejection reasoning.
- **Sector × Service** (e.g., "facility management for manufacturing," "for IT parks," "for hospitals"): **Potentially justified later, not now.** `/sectors` already gestures at this intent in its metadata ("Facility Management for Manufacturing Plants") but (per 4.1) has no actual sector-specific content to differentiate a programmatic build from doorway pages. This becomes viable *after* real sector-specific case studies/content exist — build the content first, then consider templating it, not the reverse.

**Recommendation:** Do not build location or sector pages programmatically yet. If genuine city-specific proof points exist (real completed projects, named clients, city-specific team leads) for even 2-3 of the 5 claimed cities, a small, hand-written (not templated) set of city pages would be legitimate and low-risk — but that's a content-authoring decision, not a programmatic-SEO architecture decision, until there's enough real per-city substance to templatize safely.

---

## 12. Competitive Opportunities

**No live competitor/SERP data available** — no DataForSEO, Ahrefs, or search API access in this environment (confirmed via credential checks). Cannot report actual competing domains, keyword gaps, or backlink gaps without fabricating data, which this audit will not do.

**What can be said from code/content alone:** the service-page content depth (scope of work, equipment lists, FAQs) is a genuine differentiator *if* competitors in the Pune/India facility-management space are running thinner template pages — but verifying that requires the live SERP data this environment doesn't have. Recommend running `/seo backlinks <url>` (works on the free tier — Common Crawl + verification crawler, no API key needed) and `/seo dataforseo`/`/seo ahrefs` if those extensions get installed, as a direct follow-up once this report is reviewed.

---

## 13. Quick Wins (ranked, all achievable without a content project)

1. Convert 5 oversized service PNGs to WebP (§9) — low effort, real CWV impact.
2. Fix the `kargar.co.in` vs `kargarbusinessservices.com` website-field mismatch on `/contact-us` (§4.3) — one string.
3. Remove/merge the duplicate `Organization` + self-serving `AggregateRating` schema in `ReviewsSection.tsx` into the main `@graph` (§6.1, §6.2) — real compliance risk, contained fix.
4. Add `areaServed` (5 cities) to `LocalBusiness` schema to match on-page claims (§6.3) — data-only change.
5. Replace or remove the 4 placeholder social links that point at bare platform homepages (§4.4).
6. Configure Google Search Console + PageSpeed Insights API credentials so the next audit has real indexation and CWV field data instead of code-inferred estimates.
7. Surface the `iso-compliance`/certification data already present in `hard-services.ts` (`capabilities: ['iso-compliance']`) somewhere visible on the page — it exists in the data layer and is currently invisible to users and crawlers alike.

## 14. Long-Term Improvements

1. Replace shared `HomePage` rendering on `/sectors`, `/company-profile`, `/support` with genuinely unique content per route (§4.1/§5.1) — the single highest-leverage fix in this report, but real content work.
2. Evaluate static prerendering for the ~12 known routes to fix social/messaging-unfurler previews (§3.1).
3. Build an informational content layer (guides/FAQs beyond the current service-page FAQs) to support topical authority and AI Overview/LLM citability (§8).
4. Once real per-city proof points exist, hand-author (don't template) a small number of genuine city pages (§11).
5. Confirm/build out `OptimizedImage`'s responsive `srcset`/`fetchpriority` support for hero/LCP images site-wide (§9).

## 15. Recommended Implementation Order

**Phase 1 (this week, Quick Wins, §13 items 1-5):** image conversion, contact-page domain fix, schema dedup/compliance fix, `areaServed` fix, social link cleanup. All independently shippable, none touch shared components in risky ways, all backed by concrete evidence above.

**Phase 2 (next 2-3 weeks):** Google Search Console + PageSpeed credential setup and a follow-up live-data audit pass (§13 item 6); certification/ISO-compliance content surfacing (§13 item 7); confirm/fix `OptimizedImage` responsive image support (§9).

**Phase 3 (content project, 1-2 months):** Unique content for `/sectors`, `/company-profile`, `/support` (§4.1/§5.1) — the biggest single fix, deliberately sequenced after the low-risk technical fixes so it can get proper content-strategy attention rather than being rushed alongside code changes.

**Phase 4 (ongoing/opportunistic):** Informational content layer, static prerendering evaluation, competitive/backlink analysis once live-data tooling is configured, hand-authored city pages if/when real per-city proof points exist.

---

*This report intentionally stops here. No production code was modified. See `SEO_IMPLEMENTATION_PLAN.md` for the phased execution plan awaiting approval.*
