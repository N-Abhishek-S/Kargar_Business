# Review System Production Hardening — Implementation Plan

Companion to `REVIEW_SYSTEM_AUDIT.md`. **No production code has been changed yet.** This plan sequences the 28 findings into small, independently-shippable commits, grouped by what was actually found in this repository (not a generic template). Each commit lists exact files, what changes, risk, and validation. **Awaiting approval before any implementation begins.**

---

## Commit A — Video recording performance & lifecycle (fixes the reported lag)

**Addresses:** Findings #1 (P0, root cause), #2, #3, #18, #25.

| File | Change |
|---|---|
| `src/features/reviews/hooks/useAudioLevel.ts` | No change to internal logic; the fix is in how it's consumed (see below). |
| `src/features/reviews/components/recorder/VideoRecorderModal.tsx` | Stop calling `useAudioLevel` at the top level (line 124). Move the audio-meter subscription into `AudioLevelMeter.tsx` itself (or a new small wrapper), so the 60fps `setState` churn is scoped to that leaf component only, not the whole modal. |
| `src/features/reviews/components/recorder/AudioLevelMeter.tsx` | Accept `stream`/`isActive` instead of `level`/`isSilent` props; call `useAudioLevel` internally. |
| `src/media-sdk/capture-core/constraints/ConstraintBuilder.ts` | Add `frameRate` to `videoConstraints`; accept resolution/frameRate as a parameter instead of always reading `config.maxWidth/maxHeight`. |
| `src/media-sdk/capture-core/camera/MediaCameraController.ts` | Thread a resolution/frameRate argument through `open()`/`switchCamera()` into `ConstraintBuilder.build()`. |
| `src/media-sdk/capture-react/useMediaCapture.tsx` | Extend the `open()` options type to accept `width`/`height`/`frameRate` (or a `QualityPreset`) and pass through to the controller. |
| `src/features/reviews/hooks/useVideoRecorder.ts` | In `requestPermission`, actually read `selectedQualityRef.current` → resolve to a `QualityPreset` → pass into `mediaCapture.open()`. |
| `src/media-sdk/capture-core/recording/VideoRecorderController.ts` | Pass `videoBitsPerSecond`/`audioBitsPerSecond` (from `RecorderLimits`, threaded in as a parameter, not a direct config import inside `media-sdk` — see risk note) into the `MediaRecorder` constructor, wrapped in a `try/catch` fallback to unconstrained construction if the browser rejects the combination. |
| `src/features/reviews/components/recorder/VideoRecorderModal.tsx` | Replace the 500ms `setInterval` ref-sync (lines 107-116) with a callback ref passed to `CameraPreview`. |
| `src/features/reviews/hooks/useVideoRecorder.ts` | `cleanup()` also calls `mediaCapture.close()` directly (defense in depth for #18, doesn't change today's behavior, guards future refactors). |

**Risk:** Medium. `ConstraintBuilder`/`MediaCameraController` are shared by the review recorder *and* the unrelated photo-capture flow (`SharedCameraCapture`/`GlobalCameraModal`) via the same `media-sdk`. The resolution/frameRate parameter must be **optional**, defaulting to today's behavior (1920×1080 ideal, no frameRate) so photo capture is unaffected — only the video recorder path will pass an explicit `QualityPreset`. This needs to be verified by exercising the photo-capture flow after the change (see validation below), not just the video recorder.

**Validation:**
- `npm run build`, `npm run lint`, `npm run type-check` (existing scripts — see Commit G for the actual test additions).
- Manual: open the recorder modal, confirm the modal no longer visibly stutters during live preview and during a 30+ second recording (subjective but should be dramatically better — the 60fps re-render elimination is the single biggest lever here).
- Manual: change the Quality Selector to 360p, confirm (via `getSettings()` in devtools or a temporary debug log, removed before commit) the actual camera stream resolution changes.
- Manual: exercise the **photo capture** flow (wherever `GlobalCameraModal`/`SharedCameraCapture` is used elsewhere in the app) to confirm it still requests its previous default resolution — this is the regression risk to watch for.
- **REQUIRES REAL-DEVICE TESTING:** actual perceived lag improvement on a real mid/low-end Android phone and on iOS Safari — cannot be measured in this environment.

---

## Commit B — Recording configuration follow-through & validation hygiene

**Addresses:** Findings #6, #7, #22.

| File | Change |
|---|---|
| `src/features/reviews/services/validation.service.ts` | Cross-check the detected/validated MIME type against the extension used for the storage path (or simply derive the storage extension *from* the validated MIME type instead of `file.name`, removing the untrusted input entirely). Add a lower-bound check (`size > 0`) to `validateFileSize` to reject zero-byte recordings. |
| `src/features/reviews/services/upload.service.ts` (and/or `src/services/reviews.service.ts`'s video path) | Use the MIME-derived extension from validation, not `file.name.split('.').pop()`. |
| *(new)* `src/features/reviews/services/imageValidation.service.ts` (or extend existing `validation.service.ts` to be media-type-generic) | Add server-adjacent-equivalent client validation for images (MIME allow-list + basic magic-byte check for JPEG/PNG/WebP) mirroring the video pipeline's rigor, applied in `ReviewSubmissionForm.tsx`'s `handleImageChange`/`handleGalleryChange`. |

**Risk:** Low — additive validation, doesn't change the happy path for already-valid files.

**Validation:** `npm run build/lint/type-check`; manual test of uploading a renamed non-video file (e.g. `.txt` renamed to `.webm`) to confirm rejection; manual test of a genuinely valid video/image to confirm no regression.

---

## Commit C — Upload reliability & orphan-file handling

**Addresses:** Findings #4, #5, #20, #21.

| File | Change |
|---|---|
| `src/features/reviews/services/upload.service.ts` | Add an explicit timeout (`xhr.timeout` + `xhr.ontimeout`, and an `AbortController`-based timeout wrapper around the Supabase-client fallback path) with a sensible default (e.g. 60-120s, configurable via `UploadConfig`). Wire the `AbortSignal` into the fallback path so cancellation actually stops the in-flight request, not just pre-flight. |
| `src/services/reviews.service.ts` | Change the gallery `review_media` insert failure from a swallowed `console.error` to: (a) still not fail the whole review submission (preserve current UX — the review itself is more important than the gallery), but (b) track the failure and surface it distinctly (e.g. return a partial-success result the form can show a specific warning for: "Review submitted, but N gallery images failed to attach"), and (c) attempt a compensating `cleanupUploadedAssets()` call for just the gallery images that failed to link (today, nothing cleans these up). |
| `src/repositories/review.repository.ts` / `src/services/reviews.service.ts` | For the "anon rollback silently fails under RLS" gap (#4): since anon genuinely cannot delete Storage objects (by design, per §9 of the audit — and that restriction should stay, see Commit E), the fix here is **not** to grant anon delete access. Instead, log orphan-candidate paths (bucket+path+timestamp) to a durable, admin-visible place when `cleanupUploadedAssets` fails — at minimum a structured log via the existing `*Logger` pattern (§15 of the audit), so orphans are *discoverable* even though they can't be self-cleaned by the anonymous client. A proper fix (a scheduled admin-side sweep job comparing Storage listings against `reviews`/`review_media` rows) is a larger effort — propose as a **Phase 2 item**, not bundled into this commit, and flagged below under "Requires Supabase/owner approval" since it would need either a new Edge Function or a scheduled Postgres job.

**Risk:** Low-Medium. The timeout value needs a sensible default that doesn't cut off legitimate large uploads on slow connections — propose starting conservative (120s) and making it configurable via `UploadConfig` rather than hardcoding.

**Validation:** `npm run build/lint/type-check`; manual test of a deliberately-slow/throttled upload (Chrome devtools network throttling) to confirm timeout fires and surfaces a clear error, not a silent hang; manual test of cancel-mid-upload on both the primary and fallback paths.

---

## Commit D — Public playback & carousel performance

**Addresses:** Findings #10, #19, #28.

| File | Change |
|---|---|
| `src/services/reviews.service.ts` (`fetchPublicReviews`) | Add real pagination to the carousel path instead of `fetchAll:true` → `.limit(1000)` — either page-based ("load more") or keep `fetchAll` for small sites but add a console/telemetry warning when the 1000-row cap is actually hit, so it's not a silent truncation. |
| `src/features/reviews/components/ReviewsCarousel.tsx` | If keeping "fetch all" for the current review volume (reasonable given today's scale), add the Swiper `Virtual` module so only visible+adjacent slides are mounted, protecting against future scale. |
| `src/features/reviews/components/ReviewsFilter.tsx` | Debounce the search input (e.g. 300-400ms) before calling `onFilterChange`, so typing doesn't fire a query per keystroke. |
| `src/features/reviews/components/ReviewDetailsModal.tsx` | Remove the unconditional `console.log('--- DEBUG REVIEW DETAILS MODAL ---', ...)` (line ~38-43) — pure deletion, no behavior change. Optionally add a `poster` attribute to the video element if a thumbnail URL is confirmed to be persisted on the `reviews` row (needs a quick check of whether one exists before deciding — see "Open question" below). |

**Risk:** Low. These are additive/subtractive changes to already-isolated components; the debounce and virtualization are standard, well-understood patterns.

**Open question before implementing the poster-image part of this commit:** does the `reviews` table actually persist a thumbnail URL from `useThumbnail.ts`'s generated frame, or is that thumbnail only ever used transiently in the submission-preview UI and discarded? This needs a quick, explicit check (not assumed) before deciding whether "add poster" is a real option or requires a schema addition — will confirm before writing this part of the commit.

**Validation:** `npm run build/lint/type-check`; manual test of the search box (confirm debounced, not per-keystroke, via Network tab); manual scroll through the carousel with many reviews (or a temporarily seeded larger dataset) to confirm smoothness.

---

## Commit E — Security & RLS hardening

**Addresses:** Findings #8, #9, #12.

**This commit requires Supabase/owner approval before execution — SQL is proposed below, not run.**

### E1 — Constrain `is_featured`/`display_order` at the RLS layer (closes #12)

```sql
-- Proposed migration (NOT executed). Tightens the existing anon INSERT policy on `reviews`
-- so a direct-API caller cannot set is_featured/display_order/approved_at/approved_by
-- on insert, matching what the application code already intends.

DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;

CREATE POLICY "Anyone can submit a review"
  ON public.reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND deleted_at IS NULL
    AND is_featured = false
    AND display_order = 0
    AND approved_at IS NULL
    AND approved_by IS NULL
  );
```
**Risk:** Low — this only tightens what an INSERT is allowed to set; it doesn't change any existing legitimate application behavior, since `reviews.service.ts` already sends exactly these default values. **REQUIRES SUPABASE / OWNER APPROVAL** before applying — any RLS policy change must be reviewed and applied deliberately, not silently.

### E2 — Rate limiting / abuse control on submission and storage upload (closes #9, contributes to #8)

This is the more involved item. Client-side-only mitigations (which don't require DB approval) can ship first:
- Keep the existing honeypot + localStorage check (already present, low value but free).
- Add a lightweight client-side exponential backoff on repeated failed submissions (doesn't stop a determined attacker, but raises the bar for casual abuse).

**Real** rate limiting requires either (a) a Postgres-level solution (e.g., a trigger + a rate-limit tracking table keyed by a hashed IP or session identifier — the `reviews` table already has an `ip_hash` column per the audit's schema notes, suggesting this was anticipated but never wired up), or (b) moving public submission behind a Supabase Edge Function that can apply its own rate limiting (e.g., via Upstash/Redis or a Postgres-backed token bucket) before touching Storage/DB directly. **This is a genuine architecture decision, not a small commit** — propose it as its own follow-up design discussion rather than bundling into this hardening pass, since it changes the submission path's shape (client → DB directly, vs. client → Edge Function → DB).

**Flagging, not implementing in this plan:** the specific SQL/Edge Function code for E2 is **not written here** because it requires an owner decision on approach (trigger-based vs. Edge Function) before design, per the audit brief's explicit instruction not to guess at Supabase configuration. **REQUIRES SUPABASE / OWNER APPROVAL** and a follow-up scoping conversation.

### E3 — Storage upload path scoping (contributes to #8)

Optionally scope anon Storage INSERT policies to require a specific path prefix pattern (e.g., enforcing the `${date}/${uuid}` shape at the RLS layer, not just trusting the client to follow it) — reduces (but doesn't eliminate, since anon can still call the endpoint) the abuse surface. Proposed SQL would follow the same `WITH CHECK` pattern as E1 but matching on `storage.foldername(name)` — **not drafted here in final form**, pending the E2 approach decision since a proper fix likely bundles with rate limiting rather than being a standalone half-measure.

---

## Commit F — Admin moderation hardening

**Addresses:** Findings #13, #14, #15, #24.

| File | Change |
|---|---|
| `src/features/admin/pages/AdminReviewsPage.tsx` | Add pagination (page/limit controls) and a search box, replacing the hardcoded `page=1, limit=100`. |
| `src/services/admin.service.ts` (`fetchAdminReviews`) | Accept page/limit/search parameters instead of hardcoding. |
| `src/services/admin.service.ts` (`deleteAdminReview`) | Extend to also clear `profile_image`/`company_logo` and associated `review_media` rows/files (via `ReviewRepository.clearMedia` for each media type, and a new bulk-delete for `review_media` rows tied to the review), closing the partial-orphan gap. |
| `src/contexts/AuthContext.ts` / `AuthProvider.tsx` / `src/features/admin/components/AdminLayout.tsx` | Consolidate to a single admin-session source of truth — either have `AdminLayout` consume `AuthContext` (if it's meant to be the shared mechanism) or remove the unused `AuthContext` admin-session logic if `AdminLayout`'s independent check is the intended pattern. Needs a decision on which is canonical before touching either — will confirm intent (was `AuthContext` meant to replace `AdminLayout`'s check, or vice versa, or are they for different purposes?) as part of this commit's design, not guessed. |
| `src/services/reviews.service.ts` | Replace bare `console.error` on DB-insert-adjacent failures with the existing `*Logger` pattern used elsewhere in the feature, for consistency (#24). |

**Risk:** Medium for the auth-consolidation piece specifically (touches the admin session mechanism — needs careful manual re-testing of login/logout/session-expiry, not just a quick smoke test). Low for pagination/search and media cleanup.

**Validation:** `npm run build/lint/type-check`; manual full admin login → moderate a review → archive a review → confirm all associated media (video, images, gallery) is removed from Storage; manual test of admin session expiry/logout behavior after the auth consolidation.

---

## Commit G — Tests

**Addresses:** Finding #11.

Given no test infrastructure currently exists (confirmed in the audit, §16), propose **Vitest** (Vite-native, minimal config overhead, a dedicated setup skill is already available in this environment) rather than introducing a heavier framework. Scope to unit/integration tests for the pieces that are pure-logic and don't require a real browser/camera:

| Area | Proposed test file | Coverage |
|---|---|---|
| Recording state machine | `src/features/reviews/hooks/useVideoRecorder.test.ts` | State transitions (idle→requesting→ready→countdown→recording→preview), double-start prevention, cleanup on unmount. |
| Video validation | `src/features/reviews/services/validation.service.test.ts` | MIME/magic-byte checks (trusted vs. untrusted origin), size limits, zero-byte rejection (once added in Commit B), duration edge cases. |
| Upload retry logic | `src/features/reviews/services/upload.service.test.ts` | Retry/backoff sequencing, abort handling, timeout (once added in Commit C). |
| Review submission validation | `ReviewSubmissionForm`'s zod schema (extract if needed) | Required-field validation, permission-checkbox enforcement, duplicate-submission window logic. |
| Public query shape | `src/services/reviews.service.test.ts` | `fetchPublicReviews` pagination vs. `fetchAll` behavior (mocked Supabase client), confirming only approved-filtering logic is requested correctly (RLS itself can't be unit tested here — that needs a real Postgres instance, out of scope for Vitest unit tests). |
| Moderation | `src/services/admin.service.test.ts` | `updateAdminReview`/`deleteAdminReview` call shape (mocked client), confirming the media-cleanup calls from Commit F are actually invoked. |

**Explicitly out of scope for this commit** (would need Playwright, already installed-but-unconfigured, or real devices): actual `getUserMedia`/`MediaRecorder` behavior, actual RLS enforcement, actual cross-browser codec playback. These are called out as `REQUIRES REAL-DEVICE TESTING` in the audit and are not something Vitest unit tests can meaningfully cover — proposing them as a **separate, later Playwright-based E2E effort** if the business wants that investment, not bundled here.

**Risk:** Low — additive only, no production code behavior changes from this commit itself (aside from whatever minimal refactoring is needed to make pure logic testable in isolation, e.g. extracting the zod schema if it's currently only defined inline).

**Validation:** `npm run test` (new script), confirm all new tests pass, confirm `npm run build/lint/type-check` still pass.

---

## Sequencing Rationale

**Commit A first** — it directly fixes the user's reported, named bug (video lag) and is the highest-value, most-requested fix; sequencing it first also means every subsequent commit's manual testing benefits from a non-laggy recorder to test against. **Commit B follows immediately** since it's small, low-risk, and closely related (recording configuration/validation, same files/area as A, easy to review together conceptually even as separate commits). **Commit C (upload reliability)** comes next — it's the next stage of the same pipeline and doesn't depend on A/B but is naturally sequenced after "the recording itself works well" is established. **Commit D (public performance)** is independent of A-C (different part of the system — display, not capture) and could technically ship in parallel, but is sequenced after since it's lower urgency (no user-reported bug there) and some of it (poster image) has an open question to resolve first. **Commit E (security/RLS)** is sequenced after D specifically because it requires owner approval and a scoping conversation (E2) — it shouldn't block the code-only commits A-D from shipping while that conversation happens. **Commit F (admin hardening)** depends conceptually on E's media-cleanup patterns being settled and is lower urgency than the public-facing fixes. **Commit G (tests)** is last so it can test the *final* shape of the state machine, validation, and upload logic rather than being written against code that Commits A-C are about to change out from under it — writing tests first against soon-to-change code would be wasted/rewritten effort.

---

## Database/RLS Changes Requiring Approval

1. **E1** — tightening the `reviews` INSERT policy to constrain `is_featured`/`display_order`/`approved_at`/`approved_by`. SQL drafted above, low risk, ready to review.
2. **E2** — rate limiting / abuse control design (trigger-based vs. Edge Function). **Not yet drafted** — needs an owner decision on approach before SQL/Edge Function code is written.
3. **E3** — Storage path-scoping RLS. **Not yet drafted** — pending E2's approach decision.
4. **(Mentioned in Commit C, not scheduled as its own commit)** — a scheduled orphan-file sweep job (Edge Function or Postgres scheduled job) comparing Storage listings against DB rows. This is a larger, separate infrastructure decision — flagged, not scoped into a commit yet.

**None of these will be executed without your explicit, separate sign-off on the SQL/design, per your Phase 0 instructions.**

---

## Things Requiring Real-Device Testing

1. Actual perceived lag improvement from Commit A on a real mid/low-end Android phone and iOS Safari (cannot be measured in this environment).
2. Codec/playback compatibility of the vp9/vp8/webm/mp4 negotiation chain across real Chrome (desktop + Android), Safari (desktop + iOS), and Edge.
3. Orientation-change, screen-lock, and tab-switch behavior during active recording (no code-level evidence of handling was found either way — needs to be checked on real devices, not assumed broken or working).
4. Camera-already-in-use / permission-denied / no-camera error message accuracy across real browsers (the error-classification logic itself was not traced line-by-line in this audit and should be re-verified against real `DOMException` names from real devices before or during Commit A/B).
5. Any HTTP range-request/streaming behavior of the Supabase Storage-served video files on real mobile network conditions.

---

*Awaiting approval. No production code has been modified as part of producing this audit or this plan.*
