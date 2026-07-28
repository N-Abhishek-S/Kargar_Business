# ADR 001: Media Capture System Hardening and Unification

## Context
The application utilizes a Media Capture System for recording videos and capturing photos across multiple features (e.g., reviews, gallery, logos). 
Historically, development of the media capture SDK started in `src/media-sdk` (acting as the core gateway to browser APIs) but feature-specific extensions, UI components, and uploading logic were tightly coupled within the `features/reviews/` directory. This led to:
- Duplicated SDK logic and loose separation of concerns.
- A monolithic UI component (`VideoRecorderModal.tsx`) entangled with complex business logic.
- Fragmented upload pipelines.
- Direct invocation of browser media APIs outside of the core SDK (e.g., `MediaRecorder` usages inside capability services).
- Unpredictable lifecycle loops and memory leaks in React hooks (`useVideoRecorder.ts`).

## Decision
We will refactor the Media Capture System to strictly enforce a layered architecture.

1. **Strict SDK Gateway:** 
   - `src/media-sdk/capture-core` will be the exclusive owner of `navigator.mediaDevices`, `getUserMedia`, and `MediaRecorder`.
   - All references to browser media APIs outside of `capture-core` will be removed or proxied through the SDK.

2. **Component Consolidation:** 
   - Feature-agnostic, purely presentational or generic capture UI components (e.g., `CameraPreview`, `RecordingControls`) will be migrated from `features/reviews/components/recorder` to `src/media-sdk/capture-ui`.
   - Business-logic-heavy components (like `VideoRecorderModal` orchestrating drafts, plugins, and feature flags) will remain in `features/reviews/`.

3. **Unified Upload Abstraction:**
   - The frontend upload process will be unified into a generalized abstraction (handling chunking, progress, error recovery).
   - This service will route to existing backend storage buckets (e.g., `review-images`, `review-videos`) without altering the backend infrastructure or database contracts.

4. **Lifecycle & State Machine:**
   - React hooks will rely entirely on the Core SDK's event emitter for state changes.
   - The core controllers (`MediaCameraController` and `VideoRecorderController`) will enforce a strict, un-bypassable state machine (IDLE -> OPENING -> READY -> CAPTURING -> CLOSING).

5. **Feature Flags:**
   - Major experimental workflows (e.g., advanced camera selection, audio meters) will be gated behind feature flags to allow safe rollback without deployment.

## Rationale
- **Maintainability:** Isolating the core browser API interactions ensures that complex quirks (e.g., Safari iOS rendering issues) are fixed in one place.
- **Reusability:** Migrating UI components to `capture-ui` allows other features (like admin logo uploads) to compose media capture flows without importing from the `reviews` feature.
- **Safety:** Enforcing a single stream owner prevents "camera busy" errors and memory leaks across the app.

## Alternatives Considered
- *Do nothing and patch bugs individually:* Rejected because the entangled lifecycle hooks (`useEffect` cascades) cause regressions.
- *Rewrite the SDK from scratch:* Rejected as the current `capture-core` is largely functional and mature. A refactor is lower risk and respects existing investments.

## Rollback Strategy
- Feature flags will allow instant disabling of newly introduced UI features (e.g., new device selectors or brightness checks).
- If the unified upload pipeline fails in production, the previous direct Supabase `upload()` calls can be restored per-feature since the backend remains unchanged.
