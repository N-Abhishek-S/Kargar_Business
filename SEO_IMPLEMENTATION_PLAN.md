# Kargar Business Services — SEO Implementation Plan (REVISED)

**Status: Revised per owner corrections dated 2026-08-03. Supersedes the
original plan. No production code has been changed as part of producing this
revision — see chat response for the file-by-file proposal awaiting
approval.**

This revision removes every action item the owner flagged as unauthorized
(structured-data invention, fabricated business facts, automatic
sameAs/areaServed additions, ISO badges, prerendering implementation,
programmatic location pages) and replaces them with either a narrower
approved action or a documented business-input requirement.

---

## Phase 1 — Approved low-risk fixes (awaiting go-ahead, not yet implemented)

### 1.1 Organization / Review schema cleanup

**Action:** Remove the duplicate `Organization` + `AggregateRating` JSON-LD
block emitted by `ReviewsSection.tsx`. Do **not** migrate `AggregateRating`
onto the canonical `Organization`/`LocalBusiness` entity in `schema.ts` — it
is being deleted, not relocated, because it's self-serving first-party review
data that Google's structured-data guidelines don't support marking up this
way.

**File:** `frontend/src/features/reviews/components/ReviewsSection.tsx`
**Change:** Remove the `aggregateSchema` `useMemo` block and the
`<Helmet><script type="application/ld+json">...</script></Helmet>` it feeds.
Remove the now-unused `Helmet` import and `config` import if nothing else in
the file uses them (verify before removing — `config.siteUrl` is only
referenced inside the block being deleted, per current read of the file).
**Not touched:** `ReviewsHeader`, `ReviewsFilter`, `ReviewsCarousel`,
`ReviewStats`, the visible star/rating UI, the reviews themselves, and the
Supabase-backed review data pipeline — all stay exactly as-is. This is a
structured-data-only removal.
**No change needed in `schema.ts`:** the single canonical `Organization` node
already exists there (`buildOrganizationSchema`, `@id:
{siteUrl}/#organization`), rendered once via `SEO.tsx`'s `@graph`. Once the
`ReviewsSection` duplicate is deleted, there is nothing left to reconcile —
this turns out to be a deletion, not a merge.
**Verification after implementation:** render every page that mounts
`ReviewsSection` (`/`, `/sectors`, `/company-profile`, `/support`) and confirm
via Rich Results Test / "View Page Source" JSON-LD that exactly one
`Organization` node with `@id: {siteUrl}/#organization` exists, and no
`AggregateRating` node exists anywhere in the page's structured data.

### 1.2 Contact domain fix

**Investigation done:** searched the full repository for `kargar.co.in`.
Three occurrences found, all in `frontend/src/pages/KargarSinglePage.tsx`:
- Line 169: `mailto:bd@kargar.co.in` (topbar email link)
- Line 486: `bd@kargar.co.in` (contact page email display)
- Line 487: `www.kargar.co.in` (contact page **"Website"** field)

**Determination:** the two email references (169, 486) are a business email
address on the `kargar.co.in` domain — a company can legitimately run email
on one domain while its marketing site lives on another
(`kargarbusinessservices.com`). Nothing in the repo suggests the email domain
is wrong, so these two are **left untouched**.
The line 487 occurrence is different in kind: it's a field explicitly
labeled **"Website"** telling the visitor "this is our website," which is
factually wrong given the visitor is already on
`www.kargarbusinessservices.com` (confirmed as the real deployed domain via
`config/index.ts`, `scripts/seo/seo.config.ts`, `sitemap.xml`, `robots.txt`,
and every schema `@id`). This is the only occurrence proposed for change.

**File:** `frontend/src/pages/KargarSinglePage.tsx`
**Change:** Line 487 only — `text="www.kargar.co.in|Visit our website..."` →
`text="www.kargarbusinessservices.com|Visit our website..."`.
**Business confirmation still wanted:** please confirm `bd@kargar.co.in` is
still the correct, monitored business email — if the business has moved to a
`@kargarbusinessservices.com` email, those two lines should change too, but
there is no evidence in the repo either way, so no change is proposed for them
without your confirmation.

### 1.3 Social links

**Investigation done:** searched the full repository for any real Kargar
social profile URL (handle/slug on facebook, instagram, linkedin, youtube,
twitter/x). None found anywhere — the only occurrences are the four bare
platform-homepage links in `KargarSinglePage.tsx`.

**Action:** Remove the fake links rather than inventing real ones.
**File:** `frontend/src/pages/KargarSinglePage.tsx`
**Change:** Remove the entire `<div className="kb-socials" ...>...</div>`
block (lines ~179–185, containing the conditional "Follow Us:" label and the
four `<a>` tags) from the topbar. Nothing else lives in that container, so
there's no partial-removal to reason about.
**Not done:** no `sameAs` entries added to `schema.ts` — there is nothing
genuine to add yet.
**Business input needed:** real, verified URLs for Kargar's actual
Facebook / Instagram / LinkedIn / YouTube company profiles (if they exist).
Once supplied, re-adding the block with real `href`s and adding a `sameAs`
array to `buildOrganizationSchema()` becomes a small, low-risk follow-up.

### 1.4 Area served

**Action:** none to structured data. `buildLocalBusinessSchema()` in
`schema.ts` is left exactly as-is (single Pune/Baner address, no
`areaServed`).
**Reasoning:** the 5-city claim ("Mumbai, Pune, Delhi, Bengaluru, Hyderabad")
that appeared in the original audit's recommendation comes from on-page
marketing copy (`OperationsCard` in `KargarSinglePage.tsx`), which is not the
same thing as a verified, structured-data-ready list of service areas —
marketing copy can legitimately be aspirational, approximate, or stale in a
way that schema (a machine-readable factual claim) should not be.
**Business input needed (documented requirement, not assumed):**
1. A confirmed, current list of cities/regions Kargar actually services
   (may or may not match the "5+ cities" marketing copy).
2. Whether each is a full office/branch presence or a service-area-only
   claim (affects whether `LocalBusiness` should model it as `areaServed`
   `City` entities vs. a broader `GeoCircle`/state-level area, or whether
   multiple `LocalBusiness` entities are warranted for genuine branch
   offices).
Until supplied, current schema (single verified Pune/Baner address) remains
the accurate, defensible state — it just doesn't yet capture the full
service area, which is a completeness gap, not an inaccuracy.

### 1.5 ISO / certification claims

**Action:** none. No ISO badge, certification schema, or trust-statement
implying certification will be created from the `capabilities:
['iso-compliance']` string in `hard-services.ts`/`soft-services.ts`.
**Business input needed (documented requirement):** if Kargar holds a real
ISO certification (which standard — e.g. ISO 9001, ISO 41001 for facility
management — and a certificate/registration number), supplying that turns
this into a legitimate, low-risk addition later (a real certification badge
+ accurate on-page claim + no schema type currently exists for "Certification"
that fits cleanly — would need to research `Organization.hasCredential` or
similar before proposing schema, not just add it reflexively). Until then,
the `iso-compliance` string is treated as internal capability tagging only
and stays out of anything user-facing or schema-facing.

### 1.6 Image optimization — plan only, not yet executed

**Full reference map (verified by repo-wide search, not assumed):**

| Layer | File | What it holds |
|---|---|---|
| Source of truth for the 5 PNG paths | `frontend/src/config/images.ts` (`serviceImages` map, lines 42–88) | `softServices`, `hardServices`, `security`, `housekeeping`, `facilitySupport` → each a `src: '/images/services/*.png'` |
| Consumer #1 (re-exports/wraps, no hardcoded paths of its own) | `frontend/src/features/services/config/images.ts` | Maps domain keys (`electrical`, `hvac`, `housekeeping`, `security`) onto the base images above via spread — **no change needed here**, it inherits whatever `src/config/images.ts` defines |
| Consumer #2 — used by `ServicePage.tsx` for hero `<img>` + `ogImage` | (via the file above) | No direct change needed |
| Independent hardcoded copy (documented, intentional duplication — Node-safe pipeline can't import Vite-only config) | `frontend/scripts/seo/seo.config.ts` (`PAGE_IMAGES`, lines 33–60) | 6 of its 8 entries reference the same 5 PNGs, for `<image:image>` sitemap generation |
| Generated output (do not hand-edit) | `frontend/public/sitemap.xml` | Currently contains the `.png` URLs — will update automatically when `npm run seo` is re-run after `PAGE_IMAGES` changes |
| Actual binary assets | `frontend/public/images/services/*.png` (5 files, 694KB–941KB) | To be converted |

**Proposed change set (not yet executed):**
1. Convert the 5 PNGs to WebP (matching the format already used by every
   other image in `public/images/`) at visually-equivalent quality — target
   the "Cards < 80KB" budget already documented as a rule in
   `features/services/config/images.ts`'s own header comment, where
   reasonable for each image's actual content.
2. Add the 5 new `.webp` files to `public/images/services/` **alongside**
   the existing PNGs — do not delete the PNGs in the same change.
3. Update `src: '/images/services/*.png'` → `.webp` in the 5 entries of
   `frontend/src/config/images.ts`.
4. Update the matching 6 `src` values in `frontend/scripts/seo/seo.config.ts`
   `PAGE_IMAGES`.
5. Run `npm run seo` to regenerate `public/sitemap.xml` from the updated
   `PAGE_IMAGES` (do not hand-edit the sitemap).
6. Repo-wide search for any other reference to these 5 filenames (already
   done once for this plan — confirmed the only references are the ones
   listed above — will be re-verified immediately before implementation in
   case anything changed).
7. **Only after** `npm run build` succeeds, the site is manually checked
   (all pages using these images load correctly), and a final grep confirms
   zero remaining references to the old `.png` paths in `src/`, `scripts/`,
   or `public/sitemap.xml` — **only then** delete the original 5 PNG files.
   This is a separate, later step, not bundled into the conversion commit.

**`OptimizedImage.tsx` audit (read in full):**
- **Has:** `width`/`height` (with `aspectRatio` CLS prevention), native
  `loading="lazy"`/`"eager"` via a `priority` prop, `fetchPriority="high"`
  gated behind the same `priority` prop (already conditional — **not**
  applied everywhere, consistent with the "only likely LCP images" rule), a
  `sizes` prop pass-through, blur-up placeholder, error fallback.
- **Missing:** no `srcset` generation at all — `sizes` is accepted as a prop
  and passed to the `<img>`, but without a corresponding `srcset` it has
  nothing to act on, so it's currently a no-op. No explicit `decoding`
  attribute (browser defaults apply, which is a minor gap not a real
  problem).
- **Also found while auditing:** the two hero images actually driving `<h1>`
  sections (`HomeHero`, `ServicesHero` in `KargarSinglePage.tsx`) use plain
  `<img>` tags, **not** `OptimizedImage` at all — so `OptimizedImage`'s
  `priority`/`fetchPriority` logic doesn't apply to what are likely the
  site's two actual LCP elements. This is a separate, smaller finding not
  in the original audit — flagged here for the record, not proposing a fix
  in this plan without discussing scope first.
- **Proposed scope for this plan:** do not build a full responsive-image
  pipeline (no image CDN/on-the-fly resizing exists in this stack). Limit
  Phase 1 image work to the format conversion above. `srcset` support and
  the raw-`<img>`-vs-`OptimizedImage` hero inconsistency are proposed as
  Phase 2 follow-ups, not bundled into the image-conversion change, since
  they touch component logic rather than just swapping asset paths.
- **`fetchPriority="high"` policy:** confirmed current code already gates
  this correctly (only `priority`-flagged images get it, nothing site-wide).
  No change proposed to this logic in Phase 1 — noted as already correct.

---

## Phase 2 — Deferred technical follow-ups (not scheduled yet, pending Phase 1 review)

- `OptimizedImage.tsx` `srcset`/`sizes` support (real responsive images, not
  just format conversion).
- Reconcile `HomeHero`/`ServicesHero` raw `<img>` usage vs. `OptimizedImage`
  for consistent LCP handling — needs a decision on whether these two hero
  images should move to `OptimizedImage` with `priority` set, since they are
  the most likely LCP candidates on `/` and `/services`.
- Google Search Console + PageSpeed Insights credential setup (unchanged from
  original plan — this is measurement infrastructure, not a content or
  schema decision, so it carries over without correction).
- Confirm GTM/Clarity/Hotjar/Sentry third-party script loading strategy.

---

## Phase 3 — `/sectors`, `/company-profile`, `/support` page architecture

**Correction from original plan:** these three routes stay indexable,
separate, un-redirected, un-canonicalized-to-home URLs. The fix is to give
each genuinely unique content, not to reduce their footprint.

### 3.1 Existing, genuine content inventory (verified in repo — nothing below is invented)

| Route | Real content already in the codebase that could anchor a unique page | Where |
|---|---|---|
| `/sectors` | 8 real sector entries with name + description (IT Parks, Manufacturing, Airport Lounges, Corporate Offices, Healthcare, Retail & Malls, Warehouses, Hotels & Hospitality) — currently only shown as a compact card grid embedded in the shared homepage | `src/features/home/components/IndustriesSection.tsx` |
| `/company-profile` | A "Company Profile" downloadable PDF document system (preview/download/share), 6 real trust-pillar cards (Quality Assured, Verified Workforce, Technology Driven, Compliance, 24x7 Support, PAN India) with descriptions, and a stats strip — currently only shown as a compact teaser on the shared homepage | `src/features/home/components/CompanyProfile/{CompanyProfileSection,companyTrust,CompanyStatsList,DocumentShowcaseCard,ExecutiveFeatureCard}.tsx` |
| `/support` | `SupportBand` CTA copy ("Fast response. Expert coordination. Reliable follow-through."), contact-highlights content (Quick Response / Expert Support / Trusted Partner) currently rendered only on the Contact page | `KargarSinglePage.tsx` (`SupportBand`, `contactHighlights`) |
| All three | Real client-logo asset directories (companies, food, real-estate, schools — `hospitality`/`societies` present but empty) plus a live Supabase-backed logo/review system | `public/logos/*`, `TrustedClientsSection.tsx` |

### 3.2 A data problem discovered during this investigation — must be resolved before Phase 3 content is written

**The site currently displays two different, conflicting sets of company
statistics in different components:**

| Metric | `KargarSinglePage.tsx` `heroStats`/`serviceStats` (shown on `/`, `/services`) | `CompanyStatsList.tsx` (shown in the Company Profile section) |
|---|---|---|
| Workforce | 2,000+ Skilled Workforce | 150+ Expert Workforce |
| Clients | 10,000+ Happy Clients | 100+ Happy Clients |
| Cities | 5+ Cities Pan India | 25+ Cities Covered |
| Years | 10+ Years of Experience | 10+ Years of Excellence |
| Sites | 50+ Sites Managed | (not present) |

This was not visible in the original audit pass and is a material finding:
**these numbers cannot both be right**, and neither can be safely reused for
a new, more prominent `/company-profile` page without you telling us which
(if either) is current and accurate. Publishing either set at face value on
an expanded page risks amplifying a factual inconsistency instead of fixing
it.

**Business input required before writing Phase 3 copy:**
1. Correct, current figures for: workforce size, total clients, cities/sites
   covered, years in operation. (Resolves the conflict above.)
2. For `/sectors`: confirmation that the 8 listed sectors are accurate and
   complete, or a corrected list; whether any real (non-stock) project
   photography exists per sector (`IndustriesSection.tsx` currently uses
   generic Unsplash stock photos, not real Kargar site photos — acceptable
   to keep as-is, but flagged since a "genuine" page upgrade is a natural
   moment to ask).
3. For `/company-profile`: any real company history/founding facts,
   leadership names/bios if they should be public, and confirmation of the
   "Company Profile" PDF's current accuracy (it's already downloadable
   today, so this is a content-freshness check, not new content).
4. For `/support`: actual SLA terms/response-time commitments if Kargar
   wants to state one publicly (the current "aim to respond within 24
   hours" copy already exists in `contactHighlights` — confirm it's still
   accurate before promoting it to a dedicated page's headline claim), and
   whether a support escalation process exists that can be described
   factually.

**No case studies, named clients (beyond real logos already on file),
awards, or partnerships will be invented.** If none exist yet for a section
that would normally feature them, the page architecture below marks that
section as "omit until available" rather than filling it with placeholder
content.

### 3.3 Proposed page architecture (structure only — copy will not be drafted until 3.2's inputs are supplied)

**`/sectors`**
- Unique `<h1>` (e.g., a variant of "Facility Management by Sector" already
  used in `registry.ts`'s title, expanded into a real headline)
- Intro paragraph: what "sector-specific" facility management means at
  Kargar (distinct from the generic homepage pitch)
- Full expansion of the 8 sectors already in `IndustriesSection.tsx`, each
  with more depth than the current 1-sentence card description — real depth
  only if 3.2.2 supplies it; otherwise the existing description length is
  kept rather than padded
  - **Internal linking:** each sector card should link into the relevant
    `/services/*` pages where a genuine service connection exists (e.g.
    "Manufacturing" → hard-services/electrical + HVAC; "Corporate Offices" →
    soft-services/housekeeping + security) — resolves the §4.2 orphan-page
    concern from the original audit as a side effect, since this creates
    real, resolvable internal links into the service pages
- CTA: request a sector-specific proposal (reuses existing `buildContactUrl`
  pattern already used elsewhere for source/campaign tracking)
- `Service` schema entries per sector are **not** proposed — sectors aren't
  services, and inventing a schema relationship here would misrepresent the
  entity graph; a `BreadcrumbList` (already standard via `SEO.tsx`) is
  sufficient

**`/company-profile`**
- Unique `<h1>` distinct from the homepage's "Facility teams that keep
  operations moving"
- Intro paragraph on company identity/mission (using only confirmed facts
  from 3.2.3)
- Full versions of the 6 `companyTrust` pillar cards (already have real
  descriptions for 3 of 6 — `Compliance`, `24x7 Support`, `PAN India` are
  currently title+features only, no description — would need either real
  descriptions supplied or left as feature-list format)
- Resolved, single-source-of-truth statistics (post 3.2.1)
- The existing Company Profile PDF document showcase, promoted from
  teaser-in-page-section to full page-level feature
- `AboutPage` or `Organization`-anchored schema only (no fabricated
  `foundingDate`, `numberOfEmployees`, or `award` schema without confirmed
  data)

**`/support`**
- Unique `<h1>` (e.g., a real version of "Fast response. Expert
  coordination. Reliable follow-through.")
- Support process description (only if 3.2.4 confirms real process details;
  otherwise keep to what's already truthfully stated: response-time aim,
  contact channels)
- Reuse of `contactHighlights` content, expanded rather than duplicated
  verbatim from the homepage/contact page
- CTA into `/contact-us` (clear handoff — `/support` explains the *process*,
  `/contact-us` is where the form lives, avoiding the two pages competing
  for the same transactional intent)
- No SLA schema/guarantee claims without confirmed terms (3.2.4)

**Cross-cutting for all three:** each gets a `canonicalUrl` that points to
itself (already how `SEO.tsx`/`buildCanonicalUrl` work — no change needed
there, this just stops being functionally moot once the content is unique),
its own `<h1>` (fixes §5.1 from the original audit), and internal links both
*into* it (from `/` nav, already present) and *out* of it (to relevant
service pages, per the `/sectors` example above) — addressing the
`check-links.ts` orphan-page signal from §4.2 as a natural side effect
rather than a separate script fix.

**Not scheduled until 3.2's business inputs arrive.** No component code will
be written for this phase until the data conflict is resolved and the
content-source questions above are answered.

---

## Phase 4 — Explicitly deferred / rejected

- **Programmatic SEO (service×city, sector×city, mass location pages):**
  remains rejected, per original audit §11 and reaffirmed by owner
  instruction. Not revisited unless genuine per-location proof points exist
  in the future.
- **Prerendering implementation:** not authorized. See the technical
  recommendation below — investigation only, no code change proposed or
  scheduled.

---

## Technical Recommendation: Prerendering (Investigation Only — Not Authorized for Implementation)

**Current architecture:** Vite 8 + React 19 + React Router 8, pure
client-side rendering. `vercel.json` uses `"framework": "vite"` with a
catch-all SPA rewrite (`"/(.*)" → "/index.html"`) and `outputDirectory:
"dist"` — i.e., Vercel serves one static `index.html` shell for every route,
and React Router hydrates client-side. No server component, no Next.js,
no edge-rendering step currently exists anywhere in the deploy pipeline.

**Googlebot rendering implications:** Google's indexer executes JavaScript
(two-wave indexing: crawl → render in a headless Chromium → index). For a
site this size (12 known routes, confirmed via `route-inventory.ts`), Google
reliably renders and indexes CSR content today — this is not a Google
indexing risk in practice, and the original audit report correctly scored
this as a lower-severity issue for that reason.

**Social/messaging crawler implications (the actual problem):** Non-Google
unfurlers (Slack, WhatsApp, iMessage, Facebook/LinkedIn link previews,
Twitter/X cards) generally do **not** execute JavaScript — they read
`index.html`'s static `<head>` only. Today, every URL on the site — including
`/services/hard-services/electrical-maintenance` — produces the same generic
homepage OG title/description/image when shared, because `SEO.tsx`'s
per-page Helmet tags only exist after hydration. This is confirmed directly:
`index.html` lines 35-47 contain exactly one static OG block, site-wide.

**Options evaluated (none authorized for implementation yet):**

| Option | What it is | Build complexity | Deployment impact | Maintenance cost |
|---|---|---|---|---|
| A. Build-time static prerender (e.g. a script using `react-dom/server`'s `renderToString`/`renderToPipeableStream` against each route in `route-inventory.ts`, writing one `.html` file per route into `dist/`, run as an extra step after `vite build`) | Generates real static HTML with correct per-page `<head>` for every known route, served directly by Vercel's static hosting — no runtime component needed | Medium — the route list is already fully enumerated (`route-inventory.ts`), which is the hard part most sites lack; the remaining work is a Node script that imports the route tree and renders each entry, which is realistic without adopting a new framework | Low — output is still static files in `dist/`, `vercel.json`'s existing rewrite rule may need a small adjustment so real routes are served over the prerendered file instead of falling through to `index.html`, but no new infrastructure | Low-Medium — new routes must be added to the prerender script the same way they're already added to `route-inventory.ts` today (parallel maintenance, but the pattern already exists for the sitemap generator, so the team already does this kind of upkeep) |
| B. Dynamic rendering (Vercel Edge Middleware detects known bot/crawler user-agents and serves a prerendered snapshot only to them; real users still get the CSR app) | Historically Google's own recommended interim pattern (now deprecated in Google's guidance, though still functionally supported and commonly used for social-unfurler-only cases, which is this site's actual problem) | Medium-High — requires maintaining a bot/crawler user-agent list, a snapshot-generation step (could reuse Option A's rendered output), and Edge Middleware routing logic | Medium — adds a Vercel Edge Middleware layer that doesn't exist today | Medium — two rendering paths to keep in sync (human CSR app + bot snapshot) is a real ongoing cost; not recommended as a first choice given Option A covers the actual problem (unfurlers) without the added routing complexity |
| C. Full SSR framework migration (Next.js, Remix, etc.) | Not evaluated in detail — **explicitly not authorized** by owner instruction ("No framework migration is authorized") | N/A | N/A | N/A |

**Recommendation (for discussion, not authorized to build yet):** Option A
is the best fit — it solves the actual documented problem (social/messaging
previews), reuses work the team has already done (`route-inventory.ts`'s
complete route enumeration), requires no framework migration, and has a
bounded, understandable maintenance model consistent with how
`scripts/seo/*` is already maintained. Option B is not recommended as a
first move; it solves the same problem with more moving parts. This
recommendation is not scheduled into any phase above and requires separate,
explicit sign-off before any implementation work begins.

---

## Validation commands (for every Phase 1 change, once approved)

```
npm run seo         # regenerates robots.txt/sitemap.xml/vercel.json redirects, runs all 7 validators
npm run build        # tsc -b && vite build — must succeed with zero errors
npm run lint          # eslint src/
npm run type-check    # tsc -b (redundant with build's first step, run standalone for a faster signal)
```

**No automated test suite currently exists** (`package.json` has no `test`
script; `frontend/tests/` and no Playwright config were found during this
investigation) — this is a gap, not something this plan will silently work
around. Manual verification is required in its place:
- Load every public route (`/`, `/services`, `/sectors`, `/company-profile`,
  `/support`, `/contact-us`, `/services/hard-services`,
  `/services/soft-services`, all 4 service detail pages, `/404`) and confirm
  no console errors, no broken images.
- Run Google's Rich Results Test against `/` and one service page; confirm
  exactly one `Organization` node, no `AggregateRating` node.
- `grep -rn "kargar.co.in"` — confirm only the two approved email
  occurrences remain (or zero, if 1.2's business-input answer says the email
  should also change).
- `grep -rn "facebook.com\|instagram.com\|linkedin.com\|youtube.com"` across
  `src/` — confirm zero matches after 1.3.
- `grep -rn "services/.*\.png"` across `src/`, `scripts/`, and
  `public/sitemap.xml` — confirm zero matches after 1.6's reference-swap
  step (before the PNG deletion step, which is separately gated).
- Confirm no build warnings about missing assets after the image swap.

**Explicitly must not do:** weaken or skip any of the 7 existing
`scripts/seo/*` validators to force a pass. If a validator fails after a
Phase 1 change, the change is wrong, not the validator.

---

*Revised plan awaiting approval. No production code has been modified.*
