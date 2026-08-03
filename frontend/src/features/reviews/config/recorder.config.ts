/**
 * Video Recorder — Centralized Configuration
 *
 * All feature flags, recording limits, quality presets, upload settings,
 * and storage keys for the video recording system.
 */

/* ---------- Feature Flags ---------- */

export const RecorderFlags = {
  /** Master toggle for the recording feature */
  ENABLE_VIDEO_RECORDING: true,
  /** Allow users to pick camera / microphone */
  ENABLE_CAMERA_SELECTION: true,
  /** Show real-time audio level meter */
  ENABLE_AUDIO_METER: true,
  /** Allow 360p / 720p / 1080p quality selection */
  ENABLE_QUALITY_SELECTOR: true,
  /** Track analytics events (camera_selected, record_clicked, etc.) */
  ENABLE_ANALYTICS: true,
  /** Upload continues while user fills form */
  ENABLE_BACKGROUND_UPLOAD: true,
  /** Save recording to IndexedDB for crash recovery */
  ENABLE_DRAFT_RECOVERY: true,
  /** Lightweight face-visibility heuristic (non-blocking) */
  ENABLE_FACE_DETECTION: false,
  /** Warn when camera feed is too dark */
  ENABLE_BRIGHTNESS_CHECK: true,
} as const;

/* ---------- Recording Limits ---------- */

export const RecorderLimits = {
  /** Maximum recording length in seconds */
  MAX_DURATION_SECONDS: 180,
  /** Maximum file size in bytes (100 MB) */
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024,
  /** Audio bitrate — shared across all quality presets; audio doesn't need to scale with video resolution */
  AUDIO_BITS_PER_SECOND: 128_000,
  /** Pre-recording countdown length */
  COUNTDOWN_SECONDS: 3,
  /** Seconds before max-duration to show warning */
  DURATION_WARNING_SECONDS: 30,
  /** Silence threshold (seconds) before showing "No audio detected" */
  SILENCE_THRESHOLD_SECONDS: 3,
  /** Minimum average luminance (0-255) before brightness warning */
  BRIGHTNESS_THRESHOLD: 40,
  /** How often to sample brightness (ms) */
  BRIGHTNESS_SAMPLE_INTERVAL_MS: 2_000,
} as const;

/* ---------- Quality Presets ---------- */

export interface QualityPreset {
  readonly width: number;
  readonly height: number;
  readonly frameRate: number;
  readonly label: string;
  /** Requested (not guaranteed) MediaRecorder video encoding bitrate for this preset. */
  readonly videoBitsPerSecond: number;
}

/**
 * Single source of truth for recording quality — resolution, framerate, and a
 * bitrate scaled to that resolution (testimonial/talking-head content, not
 * professional video: priorities are smooth capture and reasonable file size
 * over maximum visual fidelity).
 */
export const QualityPresets = {
  '360p': { width: 640, height: 360, frameRate: 30, label: '360p', videoBitsPerSecond: 800_000 },
  '720p': { width: 1280, height: 720, frameRate: 30, label: '720p', videoBitsPerSecond: 1_500_000 },
  '1080p': { width: 1920, height: 1080, frameRate: 30, label: '1080p', videoBitsPerSecond: 2_500_000 },
} as const satisfies Record<string, QualityPreset>;

export const DEFAULT_QUALITY = '720p' as const;

/* ---------- Upload ---------- */

export const UploadConfig = {
  /** Number of retry attempts on failure */
  RETRY_ATTEMPTS: 3,
  /** Base delay between retries (ms) — doubles each attempt */
  RETRY_DELAY_MS: 2_000,
  /** Interval between connectivity checks (ms) */
  NETWORK_CHECK_INTERVAL_MS: 3_000,
} as const;

/* ---------- LocalStorage / IndexedDB Keys ---------- */

export const StorageKeys = {
  LAST_CAMERA: 'kargar_recorder_last_camera',
  LAST_MIC: 'kargar_recorder_last_mic',
  LAST_QUALITY: 'kargar_recorder_last_quality',
  DRAFT_DB_NAME: 'kargar_recorder_drafts',
  DRAFT_STORE_NAME: 'drafts',
} as const;

/* ---------- Accepted MIME Types ---------- */

export const AcceptedVideoMimes = [
  'video/webm',
  'video/mp4',
  'video/quicktime',
] as const;

/** MIME priority list for MediaRecorder — first supported wins */
export const MimeNegotiationOrder = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4',
] as const;
