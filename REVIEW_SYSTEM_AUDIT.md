# Review System Production Hardening — Audit Report

**Scope:** the entire review/testimonal system — submission form, image upload, video recording SDK, upload pipeline, Supabase storage/RLS, public display (carousel/modal), and admin moderation.

**Method:** direct code reading (this session) of the recording hot path (`useVideoRecorder`, the `media-sdk` camera/recorder controllers, `VideoRecorderModal`, `ReviewSubmissionForm`) plus three parallel read-only investigations covering (1) upload/storage/RLS/migrations, (2) public display performance, (3) admin moderation/auth/security. All findings below cite exact files/lines. Nothing was fabricated — anywhere a claim needed a live browser/device to verify, it is explicitly labeled `REQUIRES REAL-DEVICE TESTING`. No code was changed to produce this report.

---

## 0. Safety / Scope Check

`git status` at the start of this workstream showed only pre-existing, unrelated state: a modified `supabase/migrations/004_rls_policies.sql` (present before this session began) and a set of already-untracked files (`.claude/`, `CLAUDE.md`, `artifacts/`, `docs/`, `run_migration.mjs`, `supabase/functions/`, several migration files, and the two SEO reports from the prior workstream). **None of these were touched during this audit.** No RLS was weakened, no migration was run, no destructive database action was taken — this phase was 100% read-only.

---

## 1. Root Cause of the Reported Video Lag

The user reported "video recording is very laggy" and asked for the *actual* root cause, broken out per the A–E framework (live preview / encoded recording / recorded preview / upload / playback-after-upload), not a single guess.

### Verdict: this is a React re-render problem, compounded by two camera-configuration gaps. It affects both **A (live preview)** and **B (encoded recording)**; **C, D, E are not implicated** by the evidence.

### Cause 1 (primary) — `useAudioLevel` re-renders the entire recorder modal ~60 times/second, starting the moment the camera is live, not just while recording

- **File:** `frontend/src/features/reviews/hooks/useAudioLevel.ts:78-113`, called from `frontend/src/features/reviews/components/recorder/VideoRecorderModal.tsx:124`:
  ```ts
  const audioLevel = useAudioLevel(isCameraLive ? stream : null);
  ```
  where `isCameraLive = state === 'ready' || state === 'countdown' || state === 'recording' || state === 'paused'` (line 120) — i.e. active from the moment the camera opens, well before the user presses record.
- Inside the hook, a `requestAnimationFrame` loop (`tick`, lines 78-111) runs every frame the browser paints (~60 fps on most devices) and calls `setLevel(normalized)` **every single frame** (line 91).
- Because `useAudioLevel` is called directly inside `VideoRecorderModal` (not inside a small, isolated, memoized child component), each `setLevel` call schedules a re-render of `VideoRecorderModal` itself — the entire modal: the Framer Motion `AnimatePresence`/`motion.div` wrappers, the settings panel, `RecordingControls`, the duration badge, etc. — not just the small audio-meter bar.
- **User impact:** ~60 full-tree re-renders per second, continuously, for as long as the camera preview is open — this directly matches "very laggy," and explains why it's laggy even before recording starts (Problem A), and gets worse once `MediaRecorder` is also actively encoding in real time and competing for the same main thread (Problem B), especially on mid/low-end Android devices.
- **Evidence this is unintentional, not "by design":** the returned `level`/`isSilent` values are only ever rendered inside a small `AudioLevelMeter` bar (`VideoRecorderModal.tsx:591`) — there is no reason the *entire modal* needs to re-render 60×/sec to update a small level bar; this is a classic "hook state colocated too high in the tree" bug, not a deliberate design tradeoff.

### Cause 2 (contributing) — camera resolution is uncapped and the "Quality" selector is non-functional; no `frameRate` constraint is ever requested

- **File:** `frontend/src/media-sdk/capture-core/constraints/ConstraintBuilder.ts:22-25`:
  ```ts
  const videoConstraints: MediaTrackConstraints = {
    width: { ideal: options.config.maxWidth },   // 1920, from camera.config.ts
    height: { ideal: options.config.maxHeight }, // 1080
  };
  ```
  `defaultConfig.maxWidth/maxHeight` = **1920×1080** (`frontend/src/media-sdk/capture-core/config/camera.config.ts:27-28`). **No `frameRate` constraint is set anywhere in this file or anywhere else in the codebase** — the browser/device default framerate is used, uncapped.
- Separately, `frontend/src/features/reviews/config/recorder.config.ts:63-69` defines `QualityPresets` (360p/720p/1080p, all pinned to 30fps) and a `DEFAULT_QUALITY = '720p'`, and `VideoRecorderModal.tsx` renders a working-looking `QualitySelector` UI (persisted to `localStorage`, `handleQualityChange`, lines 214-218) — **but this selected value is never passed into `getUserMedia`.** Tracing the call chain: `QualitySelector` → `selectedQuality` state in `VideoRecorderModal` → **nothing reads it when opening the camera**. `useVideoRecorder.ts`'s `requestPermission` (lines 102-114) calls `mediaCapture.open({ facingMode, deviceId, audio: true })` — no width/height/frameRate/quality argument at all. There is a `_setSelectedQuality`/`selectedQualityRef` in `useVideoRecorder.ts` (lines 50, 246-248) that exists and is wired to the ref, **but nothing ever reads `selectedQualityRef.current`** — grep-confirmed dead code.
- **User impact:** every recording session requests up to 1920×1080 from the camera regardless of what "quality" the user picks in the UI, at whatever framerate the device defaults to (which can be 30, 60, or higher on some devices/webcams) — heavier decode/composite load for the live preview, and a bigger frame for `MediaRecorder` to encode in real time. The Quality Selector is effectively decorative.

### Cause 3 (contributing) — `MediaRecorder` is created with no bitrate cap, despite config values existing for exactly this purpose

- **File:** `frontend/src/media-sdk/capture-core/recording/VideoRecorderController.ts:50-53`:
  ```ts
  this.recorder = new MediaRecorder(stream, {
    ...(targetMimeType ? { mimeType: targetMimeType } : {}),
  });
  ```
  No `videoBitsPerSecond`/`audioBitsPerSecond` passed. `frontend/src/features/reviews/config/recorder.config.ts:39-41` defines `VIDEO_BITS_PER_SECOND: 1_500_000` and `AUDIO_BITS_PER_SECOND: 128_000` specifically for this — **but nothing in the codebase ever reads these two constants** (grep-confirmed: only referenced in their own definition file's comments/exports). Browser-default encoding bitrate is used instead, which most browsers scale up with resolution — compounding Cause 2.

### Ruled out (checked directly, not implicated)

- **C — Recorded-video preview** (`VideoPreview.tsx:24-30`): a plain `<video src={objectURL}>` with native `controls`, no canvas reprocessing, no extra encode step. Not implicated by any evidence found.
- **CameraPreview rendering itself** (`frontend/src/media-sdk/capture-ui/CameraPreview.tsx:51-59`): uses native `<video srcObject={stream}>` — the correct, efficient, hardware-accelerated approach, not a canvas redraw loop. Not a contributor.
- **`useFaceDetection`** (`frontend/src/features/reviews/hooks/useFaceDetection.ts:65-68`): correctly checked — the hook internally gates on `RecorderFlags.ENABLE_FACE_DETECTION` (currently `false`) *before* starting its interval, so despite being called unconditionally from `VideoRecorderModal.tsx:126`, it does not run any canvas work while disabled. Verified clean.
- **`useBrightnessCheck`**: does real canvas work (`drawImage` + full pixel loop over a 64×36 sample) but only every 2000ms (`BRIGHTNESS_SAMPLE_INTERVAL_MS`) and only while `state === 'ready'` (stops once recording starts) — a real but minor cost, not the primary cause.
- **D — Upload** and **E — Playback after upload**: architecturally separate from the recording hot path (upload happens after the user clicks "Use Video"; playback happens on a completely different device — the reviewer's, not the recorder's). See §8/§11 for their own, separate findings — they are real issues but not the cause of *recording* lag.

### Minor, secondary observation
`VideoRecorderModal.tsx:107-116` polls `cameraVideoRef.current` via `setInterval(check, 500)` to sync the video element into state for the brightness/face hooks, instead of a zero-cost ref callback. Low frequency (2/sec), minor cost — noted for completeness, not a lag driver.

---

## 2. Architecture Trace (as actually implemented, not assumed)

```
ReviewSubmissionForm.tsx (react-hook-form + zod)
  ├─ Images (profile/logo/gallery): FileReader → base64 data URL, embedded directly in the
  │   JSON payload (client-side only 5MB/MIME check, no magic-byte validation)
  ├─ Video: VideoUploadCard → CameraProvider (fresh per modal-open) → VideoRecorderModal
  │     └─ useMediaCapture (media-sdk/capture-react) → MediaCameraController.open()
  │           → ConstraintBuilder.build() → getUserMedia({ video: {width:{ideal:1920},
  │             height:{ideal:1080}}, audio:true })  [no frameRate, quality ignored]
  │     └─ CameraPreview: <video srcObject=stream> (native, efficient)
  │     └─ useAudioLevel: rAF loop, 60fps setState in VideoRecorderModal (ROOT CAUSE)
  │     └─ VideoRecorderController.start(stream) → new MediaRecorder(stream, {mimeType})
  │             [no bitrate config] → recorder.start(1000) → ondataavailable → chunks[]
  │     └─ stop() → new Blob(chunks) → File → onUseVideo(file) → back to form
  ├─ Submit clicked → useUploadProgress.upload(videoFile)
  │     → upload.service.ts: XHR PUT to Supabase Storage REST endpoint using the
  │       anon key, path `${date}/${uuid()}.${ext-from-filename}`, upsert:false,
  │       cacheControl 1yr; falls back to supabase-js client upload on XHR failure;
  │       retries 3x with 2s/4s/8s backoff; no request timeout
  ├─ reviews.service.ts submitPublicReview():
  │     1. uploads profile/logo images sequentially (not parallel)
  │     2. uploads gallery images sequentially, tracking {bucket,path} for rollback
  │     3. inserts into `reviews` (status:'pending' hardcoded client-side)
  │        — on failure: best-effort supabase.storage.remove() rollback of everything
  │          uploaded so far (silently fails under RLS for anon — see §9)
  │     4. inserts gallery rows into `review_media` — on failure: only console.error'd,
  │        NOT thrown, NOT rolled back (self-documented gap in the code)
  ├─ RLS: anon can INSERT into `reviews` only WITH CHECK (status='pending'), can INSERT
  │   into storage buckets (review-images, review-videos) with no further constraint
  ├─ Admin (AdminReviewsPage): fetch (page=1, limit=100 hardcoded, no pagination UI),
  │   status <select> → updateAdminReview() (non-optimistic), "Archive" → soft-delete
  │   (status='archived', deleted_at set) + clears ONLY the video from storage —
  │   profile image / company logo / review_media gallery rows are left orphaned
  ├─ Public SELECT: RLS restricts `reviews`/`review_media` SELECT to
  │   status='approved' AND deleted_at IS NULL — the "only approved reviews are public"
  │   invariant IS enforced at the database layer (verified, not assumed — see §10)
  └─ Display: ReviewsCarousel fetches up to 1000 rows in one unpaginated request
      (fetchAll:true → .limit(1000)), renders every ReviewCard into Swiper with no
      virtualization. ReviewCard itself has NO <video> element — video only renders
      inside ReviewDetailsModal, on demand, when a specific review is opened
      (preload="metadata", no autoplay). So "eagerly downloading every video" is
      NOT currently happening — only one video can ever be in the DOM at a time.
```

---

## 3. Findings — Video Recording Performance & Lifecycle

### P0-1 — 60fps full-modal re-render from the audio meter (see §1, Cause 1)
- **File/function:** `src/features/reviews/hooks/useAudioLevel.ts:78-113`; consumed at `src/features/reviews/components/recorder/VideoRecorderModal.tsx:124`.
- **Root cause:** rAF-driven `setState` colocated in the top-level modal component instead of an isolated child.
- **User impact:** the reported "very laggy" recording/preview experience, worst on mid/low-end mobile.
- **Performance impact:** ~60 unnecessary React reconciliations/sec of a large component tree (Framer Motion, multiple conditional subtrees) for the entire duration the camera is open.
- **Proposed fix (not yet implemented):** move `useAudioLevel`'s consumption into a small, isolated `AudioLevelMeter`-owning component (or use a ref + imperative DOM update / `requestAnimationFrame`-driven canvas bar instead of React state) so only that leaf re-renders, not the whole modal.
- **Implementation risk:** Low — purely a component-boundary refactor; the hook's public contract can stay the same if consumed from a child instead of the parent.

### P1-1 — Camera resolution uncapped; Quality Selector is non-functional (see §1, Cause 2)
- **Files:** `src/media-sdk/capture-core/constraints/ConstraintBuilder.ts:22-25`, `src/media-sdk/capture-core/config/camera.config.ts:27-28`, `src/features/reviews/hooks/useVideoRecorder.ts:102-114,246-248`.
- **Root cause:** `ConstraintBuilder` hardcodes `defaultConfig.maxWidth/maxHeight` (1920×1080) instead of accepting a resolution/frameRate argument; `selectedQualityRef` is set but never read.
- **User impact:** users who explicitly pick "360p" to save bandwidth/CPU on a weak device get no benefit — the camera is still opened at up to 1080p.
- **Performance impact:** heavier live-preview decode and MediaRecorder encode load than necessary, and a larger output file (bandwidth cost on upload) than the UI implies.
- **Proposed fix:** thread the selected `QualityPreset` (`width`/`height`/`frameRate`) through `mediaCapture.open()` → `MediaCameraController.open()` → `ConstraintBuilder.build()`, and add `frameRate: { ideal: preset.frameRate }` to the constraints.
- **Implementation risk:** Low-Medium — touches the shared `media-sdk` constraint-building path used by both the review recorder and (via `SharedCameraCapture`) the unrelated photo-capture flow; needs care not to regress photo capture, which doesn't use quality presets.

### P1-2 — `MediaRecorder` created without bitrate limits (see §1, Cause 3)
- **File:** `src/media-sdk/capture-core/recording/VideoRecorderController.ts:50-53`.
- **Root cause:** `RecorderLimits.VIDEO_BITS_PER_SECOND`/`AUDIO_BITS_PER_SECOND` defined but never passed to the `MediaRecorder` constructor.
- **User impact:** larger-than-necessary encoded files, higher CPU load during recording, longer uploads.
- **Proposed fix:** pass `videoBitsPerSecond`/`audioBitsPerSecond` into the `MediaRecorder` constructor (with a `try/catch` fallback to unconstrained construction if a browser rejects the option — some browsers are picky about combining explicit bitrate with certain codecs).
- **Implementation risk:** Low.

### P2-1 — Ref-sync via 500ms polling instead of a ref callback
- **File:** `VideoRecorderModal.tsx:107-116`.
- **Proposed fix:** replace with a callback ref passed to `CameraPreview`, eliminating the interval entirely.
- **Implementation risk:** Low.

### P2-2 — Two disconnected camera-stream cleanup owners
- **Evidence:** `useVideoRecorder.ts`'s `cleanup()`/unmount effect (lines 78-94) never stops MediaStream tracks; the actual `track.stop()` call only happens when `CameraProvider` itself unmounts (`useMediaCapture.tsx:152`, via `core.cameraController.close()`). Today this works because `VideoUploadCard.tsx:258-274` mounts `<CameraProvider>` only while `isRecorderOpen` is true, and every close handler (`handleClose`/`handleCancel`/`handleUseVideo`/`handleDraftRestore`) calls both `cleanup()` and `onClose()` (which flips `isRecorderOpen` false) in the same tick, so React batches the unmount promptly.
- **Risk if untouched:** functionally correct today, but fragile — any future refactor that separates `recorder.cleanup()` from the `isRecorderOpen` toggle (e.g., an early return, an error path that forgets to call `onClose()`) would leave the camera stream (and its LED) running with no compensating cleanup.
- **Proposed fix:** make `useVideoRecorder`'s `cleanup()` also call `mediaCapture.close()` directly, so stream-stopping isn't solely dependent on the provider unmounting — defense in depth, not a behavior change.
- **Implementation risk:** Low.

### Verified correct (no action needed)
- Double-recording-start is already guarded: `startCountdown` returns early unless `derivedState === 'ready'` (`useVideoRecorder.ts:175`).
- `useFaceDetection` correctly no-ops while its feature flag is off (verified above).
- Draft recovery, network status banner, device-disconnect handling, and ESC-to-close are all implemented with real cleanup (`VideoRecorderModal.tsx` various `useEffect`s) — not audited line-by-line for edge cases, but structurally present, not absent.

---

## 4. Findings — Recording Configuration (Phase 4)

- `QualityPresets` (360p/720p/1080p @30fps) exist and are well-formed, but are not wired to `getUserMedia` (P1-1 above) — this is the single biggest configuration gap.
- MIME negotiation is done correctly with capability detection: `VideoRecorderController.ts:39-47` checks `MediaRecorder.isTypeSupported('video/webm;codecs=vp9')` → falls back to `video/webm` → falls back to `video/mp4` (the right order for Safari/iOS compatibility, since Safari doesn't support WebM but does support MP4/H.264 recording on modern versions). This matches the brief's requirement ("do not hardcode a codec that breaks Safari") — **verified correct, not a finding**.
- Bitrate is not wired (P1-2 above).

---

## 5. Findings — Mobile Support & Browser Compatibility

Everything in this section that depends on actual device behavior is unverified and explicitly labeled. Code-level facts only:

- `MediaCameraController.ts` has real device-loss recovery: `wireUpStreamRecovery` (lines 158-185) listens for `track.onended` and attempts to reopen the camera if permission is still granted. Structurally present.
- `useMediaDevices` hook exists and is wired into `VideoRecorderModal.tsx` for device hot-swap/disconnect handling (`devices.isDeviceDisconnected`, lines 206-211, 564-570) — pauses recording and shows a `DeviceDisconnectedDialog`. Structurally present.
- `useNavigationGuard` only guards the browser-level `beforeunload` event (tab close/refresh) — it does **not** intercept in-app SPA navigation (e.g., clicking a header nav link while recording). If a user navigates away mid-recording via React Router, there's no confirmation prompt at the router level; the component would simply unmount (triggering the cleanup effects, so no resource leak, but no user warning either — different from what `handleClose`'s `window.confirm` provides for the explicit close button).
  - **P2 finding**, `src/features/reviews/hooks/useNavigationGuard.ts`.
- Codec fallback chain (§4) is Safari-aware by construction, but **whether it actually works on real iOS Safari/Android Chrome — REQUIRES REAL-DEVICE TESTING.**
- Camera-in-use / no-camera / permission-denied error surfaces exist (`PermissionDialog.tsx`, `UnsupportedBrowserNotice.tsx`, referenced from `VideoRecorderModal.tsx:503-514`) but the actual error *classification* logic (which `getUserMedia` `DOMException.name` maps to which user-facing message) was not traced file-by-file in this pass — **flag as needing a follow-up read before Commit D** (see implementation plan).
- Orientation change / screen lock / tab switch behavior — **REQUIRES REAL-DEVICE TESTING**, no code-level evidence either way was found (no `visibilitychange` listener was located in the recorder feature during this audit — if one doesn't exist, recording likely continues silently in the background tab, which is probably fine for audio+video capture but unverified).

---

## 6. Findings — Recording Lifecycle (Phase 6)

- **State machine:** `useVideoRecorder.ts` derives a single `derivedState` from `internalState` + `mediaCapture`'s own state (lines 30-40) — `idle | requesting_permission | ready | countdown | recording | paused | preview | error`. This is a real, if slightly indirect (two state sources merged each render), state machine — **not** a bag of independent booleans, so the "recording=true and uploading=true simultaneously" failure mode the brief warns about does not appear to be structurally possible: `state` only reaches `'preview'` after `stopRecordingInternal` completes, and uploading is a wholly separate hook (`useUploadProgress`) triggered only from `ReviewSubmissionForm.onSubmit`, well after the recorder modal has already closed and handed off a `File`. **Verified: no impossible-state combination found.**
- **Double-submission prevention:** `ReviewSubmissionForm`'s `isSubmitting || isUploading` disables the submit button (line 491) — standard React Hook Form guard against double-click submission. Combined with the (weak, client-only) localStorage 5-minute check (§9).
- **Object URL lifecycle:** `previewUrlRef`/`releasePreview` correctly call `safeRevokeObjectURL` (`useVideoRecorder.ts:70-75`) whenever a new recording replaces an old preview, on retake, and on cleanup — **verified correct**, no leaked object URLs found in this hook. (`VideoUploadCard.tsx:41-46` similarly revokes its own preview URL on unmount/replacement — also correct.)
- **Camera LED / stream cleanup:** see P2-2 above — works today, structurally fragile.

---

## 7. Findings — Video Validation (Phase 7)

- **Video:** `validation.service.ts` implements a real origin-aware pipeline — SDK-recorded blobs skip MIME/magic-byte checks (trusted, since the app itself produced them via `MediaRecorder`), user-uploaded files get both a MIME-string check and a 12-byte magic-byte signature check (WebM EBML `1A 45 DF A3`, MP4/MOV `ftyp` at offset 4). Size (`≤100MB`) and duration (`≤180s +1s tolerance`) are checked for both origins.
  - **P2 finding:** duration-check failure ("can't read metadata") explicitly resolves `{valid:true, duration:0}` rather than rejecting (`validation.service.ts:124`) — a deliberate "don't block on metadata failure" choice per its own comment, but it does mean a file whose duration truly cannot be determined is let through unchecked for length.
  - **P1 finding:** the storage-path file extension is taken verbatim from the client-supplied `File.name` (`file.name.split('.').pop() ?? 'mp4'`), with no allow-list and **no cross-check against the validated/detected MIME type**. A file that passes magic-byte validation as `video/webm` could still be stored with an arbitrary extension (e.g. `.svg`, `.html`) since nothing constrains it. Combined with the bucket being `public: true` (§9), this is a content-type-confusion hygiene gap worth closing even though Supabase Storage doesn't execute uploaded files.
- **Images:** **no equivalent validation service exists.** `profileImage`/`companyLogo`/`galleryImages` are checked only client-side in `ReviewSubmissionForm.tsx` (`handleImageChange`/`handleGalleryChange`, 5MB size + MIME-string allow-list) — trivially bypassable by any client not going through this exact form (direct API call, modified request). No magic-byte sniffing for images anywhere in the audited code.
  - **P1 finding** — images are the *less*-validated upload path despite carrying the same public-facing risk profile as video.
- **Zero-byte recordings:** not explicitly guarded against in `validation.service.ts` — `validateFileSize` only checks an upper bound (`≤ MAX_FILE_SIZE_BYTES`), not a lower bound `> 0`. **P2 finding.**

---

## 8. Findings — Upload Architecture (Phase 8)

- **Filenames:** collision-resistant — `${dateFolder}/${crypto.randomUUID()}.${ext}` for both images and video (`reviews.service.ts`, `upload.service.ts`) — **not** `Date.now()`-based. **Verified good practice, not a finding.**
- **cacheControl/contentType:** `cacheControl: '31536000'` (1 year) hardcoded consistently across both upload paths; `contentType` is client-declared (not sniffed) for both images and video at the Storage-write layer (separate from the magic-byte check that validates video *before* upload — the two are not cross-referenced at write time).
- **P2 — No request timeout:** neither the raw `XMLHttpRequest` path nor the Supabase-client fallback path in `upload.service.ts` sets any timeout — an upload can hang indefinitely absent a user-initiated cancel or a browser/network-layer timeout.
- **P2 — Fallback path cancellation is best-effort only:** `supabaseFallbackUpload`'s `AbortSignal` is checked once before starting, but not wired into the in-flight Supabase SDK call, so cancelling mid-upload on the fallback path doesn't actually stop the network request.
- **P1 — Storage-upload-succeeds-but-DB-insert-fails is handled, but the rollback silently fails for anonymous users:** `submitPublicReview` does call `cleanupUploadedAssets()` (best-effort `storage.remove()`) on any downstream failure — **but** the Storage `DELETE` RLS policy for both `review-images` and `review-videos` restricts deletion to authenticated admins (`public.is_admin()`) — see §9. An anonymous submitter's own rollback-triggered `remove()` call will itself fail RLS and be **silently swallowed** (`cleanupUploadedAssets` only `console.error`s, never surfaces the failure). Net effect: **whenever an anonymous submission's DB insert fails after a successful storage upload, the uploaded file becomes a genuine, permanent orphan with no automated way to detect or reclaim it.**
- **P1 — Gallery `review_media` insert failure is explicitly non-fatal, explicitly undocumented-as-fixed:** `reviews.service.ts` (per agent report, lines ~372-390) contains a self-documented comment: *"We do NOT throw here to avoid failing the whole review submission if just the gallery insert fails, but ideally this should be a transaction."* This is a genuine, acknowledged-in-code gap — a review can be created successfully while its gallery images silently fail to link, leaving unlinked files in storage.
- **P2 — `fetchAll: true` is capped at 1000 rows with no truncation signal:** `fetchPublicReviews` sets `.limit(1000)` even in "fetch all" mode (own code comment acknowledges the Supabase default cap) — fine at current review volumes, will silently truncate once the site has 1000+ approved reviews, with no indicator to the caller that more rows exist.
- **P3 — Dead code:** `QueueManager.ts` (media-sdk) is an entirely simulated stub (`setTimeout` loop, always resolves `COMPLETED`, never calls real upload code) and is not imported/used anywhere outside its own file — confirmed via repo-wide search. Not a live bug (unused), but misleading to maintain.
- **P3 — Misleading filename:** `storage.service.ts` contains no Supabase Storage code at all — it's the IndexedDB draft-persistence layer. The real bucket/path logic lives in `reviews.service.ts` and `upload.service.ts`. Naming/organization issue only.

---

## 9. Findings — Security (Phase 9)

**No RLS was disabled or weakened to produce this report. Any RLS change below is proposed SQL only, requiring explicit approval — nothing was executed.**

- **`reviews` SELECT RLS** (`004_rls_policies.sql:182-187`): `USING (status = 'approved' AND deleted_at IS NULL)` — public/anon truly cannot read pending/rejected/spam/archived rows. **Verified: the "only approved reviews are public" invariant genuinely exists at the database layer**, independent of any client-side filtering (see §10 — this is the specific thing the brief said to flag as Critical if absent; it is present).
- **`reviews` INSERT RLS**: `WITH CHECK (status = 'pending' AND deleted_at IS NULL)` — anon cannot self-approve via a direct insert. **However**, this `WITH CHECK` does **not** constrain `is_featured` or `display_order` — those are only client-side defaulted to `false`/`0` in `reviews.service.ts`, not enforced by the database. **P2 finding:** a caller speaking directly to the Supabase REST API with the (public) anon key could insert a `pending` review with `is_featured: true` or an arbitrary `display_order` — it still wouldn't be publicly visible until an admin approves it (SELECT RLS still applies), but it pollutes the admin queue with attacker-controlled sort/feature flags an admin might not notice before approving.
- **Storage INSERT RLS is fully open to anonymous callers, with no path scoping:** both `review-images` and `review-videos` have a policy `TO anon WITH CHECK (bucket_id = '<bucket>')` — no folder/path restriction, no per-session scoping (unlike, per the agent's cross-reference, an `avatars`-style bucket elsewhere in the same migration set that does scope by `auth.uid()`). Combined with `public: true` buckets and 100MB/5MB size caps enforced by Storage itself, this means **any anonymous client can upload arbitrary allowed-MIME-type files into these buckets at will, unlimited in count**, bounded only by per-file size — there is no evidence of any quota, count limit, or throttle. **P1 finding** — this is a real abuse/cost vector (storage-filling spam) independent of whether the resulting review ever gets approved, since the objects land in Storage before any review-approval gate applies.
- **No rate limiting or duplicate-submission control exists server/DB-side** — only a client-side, trivially-bypassable `localStorage` 5-minute check and a honeypot field (`websiteTrap`). **P1 finding**, directly enabling spam/abuse of both the `reviews` INSERT path and, more importantly, the open Storage INSERT policies above (an attacker doesn't even need a successful review submission to abuse storage — they can call the Storage REST endpoint directly).
- **No hardcoded Supabase service-role key found anywhere in `frontend/src`** — confirmed via repo-wide search; the browser client (`supabase/client.ts`) correctly uses only the anon/publishable key. **Verified clean, not a finding.**
- **No XSS via `dangerouslySetInnerHTML` or raw HTML rendering found** in `ReviewCard.tsx`, `ReviewDetailsModal.tsx`, or `AdminReviewsPage.tsx` — all user-controlled text fields go through standard React JSX interpolation (auto-escaped). **Verified clean, not a finding.** (Narrower, unverified caveat: `companyLogo`/`profileImage`/`videoUrl` are used as `src` attributes without scheme allow-listing — lower severity, browser-mitigated for `img`/`video` `src`, not independently investigated further in this pass.)
- **Admin authorization is enforced by RLS (`public.is_admin()`), not by application code** — `admin.service.ts`'s mutation functions (`updateAdminReview`, `deleteAdminReview`, etc.) perform no client-side role check before issuing the Supabase call; they rely entirely on the database policies. This is an acceptable pattern (RLS as the real boundary) **but** two disconnected client-side "am I an admin" mechanisms exist side by side (`AuthContext`/`AuthProvider`, seemingly unused by the admin pages, vs. `AdminLayout`'s own independent `getCurrentAdmin()` check) — confusing, not a live vulnerability since RLS backstops both, but a maintainability/consistency **P2 finding**.
- **Admin delete/"Archive" is a soft delete** (`status:'archived'`, `deleted_at` set) that only clears the video from Storage, leaving profile image, company logo, and `review_media` gallery rows/files orphaned. **P2 finding** (data hygiene, not a security hole — orphaned files stay behind admin-only-deletable RLS, so not publicly exposed, just wasted storage).
- **`console.log` of full review data (including implicitly email/phone via the review object) unconditionally on every render** of `ReviewDetailsModal.tsx` (not gated by `import.meta.env.DEV`). **P2 finding** — a debug leftover shipping to the production bundle; not a severe PII exposure (it's the same data already rendered visibly in the modal), but avoidable console noise and a bad pattern to leave in place.

---

## 10. Findings — Review Moderation (Phase 10)

- **Statuses supported:** `pending | approved | rejected | spam | archived`, plus an independent `featured` boolean — confirmed in both the DB enum (`review_status`, `001_core_schema.sql`) and `AdminReviewsPage.tsx`.
- **Approved-only public visibility invariant: verified to exist**, enforced at the RLS layer (§9), not just in application code — this is the strongest possible place for it to live. **Not a Critical finding — it is present and correctly implemented.**
- **P2 — No pagination/search/filter in the admin UI:** `fetchAdminReviews()` hardcodes `page=1, limit=100` with no UI control to see more or search — will silently hide reviews beyond the first 100 once the table grows past that.
- **P2 — Status changes are not optimistic:** acceptable UX tradeoff (avoids rollback complexity), but worth noting the admin has to wait for a round-trip per status change with no immediate visual feedback beyond a disabled row.
- **P2 — Partial media cleanup on delete** (see §8/§9) — video is cleared, images/gallery are not.
- **No accidental-double-action guard beyond the `window.confirm` on Archive** — acceptable for a low-frequency destructive action, not flagged further.

---

## 11. Findings — Public Review Performance (Phase 11)

- **The video-eager-loading concern the brief specifically calls out does NOT currently apply**, verified directly: `ReviewCard.tsx` (rendered for every review in the carousel) contains **no `<video>` element at all** — video only appears inside `ReviewDetailsModal`, which only mounts its content (including the `<video preload="metadata">`) when a specific review's modal is open. **At most one video can ever be in the DOM at a time in the public review UI**, and it uses `preload="metadata"` (not `"auto"`), no `autoplay`. **This is good, verified behavior — not a finding requiring a fix**, contrary to what the audit brief anticipated might be found.
- **P1 — No pagination, no virtualization on the carousel itself:** `ReviewsCarousel` fetches up to 1000 reviews in one request (`fetchAll:true` → `.limit(1000)`, see §8) and mounts every resulting `ReviewCard` into Swiper simultaneously — no `Virtual`/`Lazy` Swiper module is imported, no `react-window`/`react-virtual`. At current review volumes this is likely invisible; it will degrade as the review count grows into the hundreds.
- **P2 — Unthrottled search-as-you-type:** `ReviewsFilter.tsx`'s search input fires a new Supabase query on every keystroke with no debounce — each keystroke both re-fetches and (per the "fetchAll" default) requests up to 1000 rows again.
- **Caching:** global React Query defaults (`main.tsx`) set `staleTime: 5min`, `refetchOnWindowFocus: false` — reasonable, applied uniformly, no per-hook override needed. **Verified adequate.**
- **P3 — Stray debug log** already covered in §9 (`ReviewDetailsModal.tsx` unconditional `console.log`).

---

## 12. Findings — Video Playback (Phase 12)

- `ReviewDetailsModal.tsx`'s `<video src={review.videoUrl} controls preload="metadata">` — no `autoplay`, no `muted`, no `playsInline`, no `poster`. Reasonable defaults for an on-demand, user-initiated playback context (a modal the user explicitly opened).
- **P3 — no `poster` image set**, despite a thumbnail being generated at recording time (`useThumbnail.ts`) and presumably available somewhere in the pipeline for the *submission* preview — it's not clear from this pass whether that thumbnail is persisted and available at *display* time (this would require checking whether a thumbnail URL is stored on the `reviews` row, which was not confirmed either way — **not fabricated as a finding, flagged as unverified**).
- **Streaming/range-request behavior:** Supabase Storage serves objects via a standard object-storage backend that supports HTTP range requests by default for public objects — this is a platform-level behavior, not something the app code controls, and was not independently verified against the live bucket in this pass. **Codec universality (whether the vp9/vp8/webm output plays back correctly cross-browser) — REQUIRES REAL-DEVICE/REAL-BROWSER TESTING.**

---

## 13. Findings — Accessibility / UX (Phase 13)

Not independently re-investigated in this pass beyond what surfaced incidentally while reading the recorder — the modal does have `role="dialog" aria-modal="true" aria-labelledby`, keyboard ESC-to-close, and disabled-state styling on buttons during active states (`VideoRecorderModal.tsx` throughout). A dedicated accessibility pass (focus trapping specifically, screen-reader status announcements for state transitions, and touch-target sizing on mobile) was **not performed in this audit** and should be a distinct, explicit item in the implementation plan rather than assumed adequate or inadequate.

---

## 14. Findings — Privacy (Phase 14)

- **Consent wording does exist** — `ReviewSubmissionForm.tsx:466`: *"I allow Kargar Construction to use my review and media for marketing purposes on their website and social media."*
- **BUSINESS INPUT REQUIRED:** this text says **"Kargar Construction"** — every other page/component/schema in the codebase (including the just-completed SEO workstream) refers to the business as "Kargar Facility Management" / "Kargar Business Services." This is either a leftover from an earlier/different project template or a genuine naming error in a legally-relevant consent statement. **Not corrected here** — flagged for the business to confirm the correct legal entity/brand name before any wording change is made, per the instruction not to invent legal text.
- No other privacy/consent gaps were identified in the submission flow itself (the checkbox is required — `permissionToDisplay: z.boolean().refine(Boolean, ...)` — a user cannot submit without it).

---

## 15. Findings — Observability (Phase 15)

- `logger.service.ts` (`RecorderLogger`, `UploadLogger`, `StorageLogger` — referenced throughout the recorder/upload code) provides structured logging for `getUserMedia` failures, `MediaRecorder` failures, upload failures, etc. — **present and used consistently** in the files read (`useVideoRecorder.ts`, `upload.service.ts`).
- **P2 — No equivalent structured logging around the DB-insert/gallery-insert failure paths in `reviews.service.ts`** — those failures are handled with bare `console.error` rather than the same `*Logger` pattern used elsewhere, and (per §8) the gallery-insert failure is swallowed without even a user-facing signal.
- **No credential/sensitive-media logging was found** — logger calls reference IDs, sizes, error messages, not raw file contents or credentials. **Verified clean.**

---

## 16. Findings — Testing (Phase 16)

- **No automated test infrastructure exists for the review system, or anywhere in the frontend project.** Confirmed: `package.json` has no `test` script; no Vitest/Jest config file found; no `*.test.*`/`*.spec.*` files found anywhere under `frontend/` (a `tests/` directory exists but contains no files, consistent with the earlier SEO-workstream finding). Playwright is a devDependency (`@playwright/test`) but no `playwright.config.*` exists — it appears installed but unconfigured.
- **This is a real, standing gap** — per the brief's own instruction ("do not introduce a huge testing framework without checking what the project already uses"), the implementation plan proposes **Vitest** (lightweight, Vite-native, and a dedicated `vitest` skill is already available in this environment) as the minimal-friction choice for unit/integration coverage of the pure-logic pieces (validation, state transitions, upload retry logic) rather than reaching for Playwright's heavier browser-automation model for what are mostly non-DOM concerns.

---

## Summary Table — All Findings by Severity

| # | Severity | Area | Finding |
|---|---|---|---|
| 1 | **P0** | Recording perf | 60fps full-modal re-render from `useAudioLevel` (root cause of reported lag) |
| 2 | P1 | Recording config | Camera resolution uncapped (1080p ideal always); Quality Selector non-functional |
| 3 | P1 | Recording config | `MediaRecorder` has no bitrate limits despite config existing for it |
| 4 | P1 | Upload/Storage | Anon rollback cleanup silently fails under RLS → real orphaned files |
| 5 | P1 | Upload/Storage | Gallery `review_media` insert failure explicitly swallowed, self-documented gap |
| 6 | P1 | Validation | Video file extension trusted from client filename, not cross-checked vs. detected MIME |
| 7 | P1 | Validation | Images have no server-adjacent validation at all (video does) |
| 8 | P1 | Security | Storage INSERT open to anon with no path scoping/quota — abuse/cost vector |
| 9 | P1 | Security | No server/DB-side rate limiting or dedup on submissions or storage uploads |
| 10 | P1 | Public perf | Carousel fetches up to 1000 rows unpaginated, no virtualization |
| 11 | P1 | Testing | No automated test coverage anywhere in the review system |
| 12 | P2 | Security | `reviews` INSERT RLS doesn't constrain `is_featured`/`display_order` |
| 13 | P2 | Security | Two disconnected admin-auth mechanisms (`AuthContext` vs. `AdminLayout`) |
| 14 | P2 | Moderation | Admin review list hardcoded to 100 rows, no pagination/search |
| 15 | P2 | Moderation | Delete only clears video; profile/logo/gallery media orphaned |
| 16 | P2 | Privacy leak | `console.log` of full review data on every modal render, ungated |
| 17 | P2 | Privacy/legal | Consent text says "Kargar Construction" — wrong brand name (BUSINESS INPUT REQUIRED) |
| 18 | P2 | Recording lifecycle | Camera-stream cleanup split across two owners — fragile, not currently broken |
| 19 | P2 | Public perf | Unthrottled search-as-you-type refetches on every keystroke |
| 20 | P2 | Upload | No request timeout on video upload |
| 21 | P2 | Upload | Fallback-path cancellation is best-effort/pre-flight only |
| 22 | P2 | Validation | Zero-byte / empty recordings not explicitly rejected |
| 23 | P2 | Mobile/UX | `useNavigationGuard` doesn't cover in-app SPA navigation, only `beforeunload` |
| 24 | P2 | Observability | DB-insert failures use bare `console.error`, inconsistent with the rest of the logging pattern |
| 25 | P3 | Recording lifecycle | 500ms polling for video-element ref instead of a ref callback |
| 26 | P3 | Code health | `QueueManager.ts` is a dead, simulated stub, unused anywhere |
| 27 | P3 | Code health | `storage.service.ts` misnamed — it's IndexedDB draft persistence, not Supabase Storage |
| 28 | P3 | Playback | No `poster` image on playback `<video>` despite a thumbnail being generated at record time |

**Verified clean / not findings (explicitly confirmed correct):** approved-only public visibility (RLS-enforced), no hardcoded service-role key anywhere in frontend, no XSS via raw HTML rendering, collision-resistant UUID filenames (not `Date.now()`-based), codec negotiation order is Safari-safe, no impossible recording/uploading state combination, object-URL lifecycle in the recorder hook is correctly revoked, double-recording-start and double-submit are both guarded, `useFaceDetection` correctly no-ops while disabled.
