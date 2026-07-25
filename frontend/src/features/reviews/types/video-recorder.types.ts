/**
 * Video Recorder — Type Definitions
 *
 * Every interface, union, and enum for the recording system.
 * No runtime code — pure type declarations.
 */

/* ================================================================
   State Machine
   ================================================================ */

/** All possible recorder states */
export type RecorderState =
  | 'idle'
  | 'requesting_permission'
  | 'ready'
  | 'countdown'
  | 'recording'
  | 'paused'
  | 'stopped'
  | 'preview'
  | 'error';

/* ================================================================
   Errors
   ================================================================ */

export type RecorderErrorType =
  | 'permission_denied'
  | 'not_found'
  | 'not_supported'
  | 'overconstrained'
  | 'recording_failed'
  | 'device_disconnected'
  | 'upload_failed'
  | 'file_too_large'
  | 'invalid_mime'
  | 'network_error'
  | 'unknown';

export interface RecorderError {
  readonly type: RecorderErrorType;
  readonly message: string;
  readonly originalError?: unknown;
}

/* ================================================================
   Device Management
   ================================================================ */

export interface RecorderDeviceInfo {
  readonly deviceId: string;
  readonly label: string;
  readonly kind: 'videoinput' | 'audioinput' | 'audiooutput';
  readonly groupId: string;
}

export interface DeviceSelection {
  readonly cameraId: string | null;
  readonly micId: string | null;
}

/* ================================================================
   Quality
   ================================================================ */

export type VideoQuality = '360p' | '720p' | '1080p';

/* ================================================================
   Upload
   ================================================================ */

export interface UploadProgress {
  readonly loaded: number;
  readonly total: number;
  readonly percent: number;
  /** Bytes per second */
  readonly speed: number;
}

export interface UploadResult {
  readonly url: string;
  readonly path: string;
  readonly size: number;
  readonly contentType: string;
}

/* ================================================================
   Video Metadata
   ================================================================ */

export interface VideoMetadata {
  readonly duration: number;
  readonly width: number;
  readonly height: number;
  readonly size: number;
  readonly mimeType: string;
}

/* ================================================================
   Browser Capabilities
   ================================================================ */

export interface BrowserCapabilities {
  readonly supportsCamera: boolean;
  readonly supportsMic: boolean;
  readonly supportsMediaRecorder: boolean;
  readonly supportsWebM: boolean;
  readonly supportsMP4: boolean;
  readonly supportsPause: boolean;
  readonly supportsResume: boolean;
  readonly supportsPictureInPicture: boolean;
}

/* ================================================================
   Extension / Plugin System  (AI-Ready)
   ================================================================ */

export interface RecorderPlugin {
  readonly name: string;
  beforeRecording?: (stream: MediaStream) => Promise<MediaStream>;
  afterRecording?: (blob: Blob, metadata: VideoMetadata) => Promise<Blob>;
  beforeUpload?: (file: File) => Promise<File>;
  afterUpload?: (result: UploadResult) => Promise<void>;
  onTranscriptReady?: (transcript: string) => void;
  onAnalysisReady?: (analysis: unknown) => void;
}

/* ================================================================
   Analytics
   ================================================================ */

export type RecorderAnalyticsEvent =
  | 'camera_selected'
  | 'microphone_selected'
  | 'quality_changed'
  | 'record_clicked'
  | 'pause_clicked'
  | 'resume_clicked'
  | 'stop_clicked'
  | 'retake_clicked'
  | 'upload_clicked'
  | 'upload_failed'
  | 'upload_success'
  | 'cancelled'
  | 'permission_denied'
  | 'device_disconnected'
  | 'draft_restored'
  | 'draft_discarded'
  | 'max_duration_reached'
  | 'brightness_warning'
  | 'face_not_detected'
  | 'network_lost'
  | 'network_restored';

export interface AnalyticsPayload {
  readonly event: RecorderAnalyticsEvent;
  readonly browser: string;
  readonly device: string;
  readonly resolution?: string;
  readonly duration?: number;
  readonly quality?: string;
  readonly timestamp: number;
  readonly extra?: Record<string, unknown>;
}

/* ================================================================
   Performance Metrics
   ================================================================ */

export interface PerformanceMetrics {
  cameraStartupMs: number;
  permissionTimeMs: number;
  recordingFps: number;
  uploadSpeedBps: number;
  previewGenerationMs: number;
  thumbnailGenerationMs: number;
}

/* ================================================================
   Draft Recovery
   ================================================================ */

export interface RecordingDraft {
  readonly id: string;
  readonly blob: Blob;
  readonly metadata: VideoMetadata;
  readonly thumbnail: string;
  readonly createdAt: number;
  readonly formData?: Record<string, unknown>;
}

/* ================================================================
   Hook Return Types
   ================================================================ */

export interface UseVideoRecorderReturn {
  /* State */
  readonly state: RecorderState;
  readonly error: RecorderError | null;

  /* Media */
  readonly stream: MediaStream | null;
  readonly previewUrl: string | null;
  readonly recordedBlob: Blob | null;

  /* Timing */
  readonly elapsedSeconds: number;
  readonly countdownValue: number | null;

  /* Actions */
  readonly open: () => void;
  readonly requestPermission: () => Promise<void>;
  readonly startCountdown: () => void;
  readonly pauseRecording: () => void;
  readonly resumeRecording: () => void;
  readonly stopRecording: () => void;
  readonly retake: () => void;
  readonly getRecordedFile: () => File | null;
  readonly cleanup: () => void;

  /* Companion Hook Sync */
  readonly _setSelectedCamera: (id: string | null) => void;
  readonly _setSelectedMic: (id: string | null) => void;
  readonly _setSelectedQuality: (q: VideoQuality) => void;
}

export interface UseMediaDevicesReturn {
  readonly cameras: RecorderDeviceInfo[];
  readonly microphones: RecorderDeviceInfo[];
  readonly speakers: RecorderDeviceInfo[];
  readonly selectedCamera: string | null;
  readonly selectedMic: string | null;
  readonly selectCamera: (id: string) => void;
  readonly selectMic: (id: string) => void;
  readonly isDeviceDisconnected: boolean;
  readonly disconnectedDeviceLabel: string | null;
  readonly refreshDevices: () => Promise<void>;
}

export interface UseAudioLevelReturn {
  readonly level: number;
  readonly isSilent: boolean;
  readonly silenceDurationMs: number;
}

export interface UseUploadProgressReturn {
  readonly upload: (file: File) => Promise<UploadResult>;
  readonly cancelUpload: () => void;
  readonly progress: UploadProgress | null;
  readonly isUploading: boolean;
  readonly isRetrying: boolean;
  readonly retryCount: number;
  readonly error: string | null;
}

export interface UseNetworkStatusReturn {
  readonly isOnline: boolean;
  readonly wasOffline: boolean;
  readonly lastOnlineAt: number;
}

export interface UseDraftRecoveryReturn {
  readonly hasDraft: boolean;
  readonly draft: RecordingDraft | null;
  readonly saveDraft: (blob: Blob, metadata: VideoMetadata, thumbnail: string) => Promise<void>;
  readonly restoreDraft: () => Promise<RecordingDraft | null>;
  readonly discardDraft: () => Promise<void>;
}

export interface UseThumbnailReturn {
  readonly thumbnailUrl: string | null;
  readonly isGenerating: boolean;
  readonly generateThumbnail: (videoUrl: string) => Promise<string | null>;
}

export interface UseVideoMetadataReturn {
  readonly metadata: VideoMetadata | null;
  readonly isLoading: boolean;
  readonly extractMetadata: (source: Blob | string) => Promise<VideoMetadata | null>;
}

export interface UseBrightnessCheckReturn {
  readonly isTooDark: boolean;
  readonly brightness: number;
}

export interface UseFaceDetectionReturn {
  readonly faceVisible: boolean;
}

/* ================================================================
   Component Props
   ================================================================ */

export interface VideoRecorderModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onUseVideo: (file: File) => void;
}

export interface CameraPreviewProps {
  readonly stream: MediaStream | null;
  readonly isRecording: boolean;
  readonly isPaused: boolean;
  readonly videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export interface RecordingControlsProps {
  readonly state: RecorderState;
  readonly onRecord: () => void;
  readonly onPause: () => void;
  readonly onResume: () => void;
  readonly onStop: () => void;
  readonly onCancel: () => void;
  readonly elapsedSeconds: number;
}

export interface VideoPreviewProps {
  readonly previewUrl: string;
  readonly onRetake: () => void;
  readonly onUseVideo: () => void;
  readonly metadata?: VideoMetadata | null;
  readonly thumbnailUrl?: string | null;
}

export interface PermissionDialogProps {
  readonly errorType: RecorderErrorType;
  readonly onRetry: () => void;
  readonly onFallbackUpload: () => void;
}

export interface CountdownOverlayProps {
  readonly value: number;
}

export interface RecordingTimerProps {
  readonly elapsedSeconds: number;
  readonly maxSeconds: number;
  readonly isPaused: boolean;
}

export interface AudioLevelMeterProps {
  readonly level: number;
  readonly isSilent: boolean;
}

export interface DeviceSelectorProps {
  readonly cameras: RecorderDeviceInfo[];
  readonly microphones: RecorderDeviceInfo[];
  readonly selectedCamera: string | null;
  readonly selectedMic: string | null;
  readonly onCameraChange: (id: string) => void;
  readonly onMicChange: (id: string) => void;
  readonly disabled?: boolean;
}

export interface QualitySelectorProps {
  readonly selectedQuality: VideoQuality;
  readonly onQualityChange: (quality: VideoQuality) => void;
  readonly disabled?: boolean;
}

export interface UploadProgressBarProps {
  readonly progress: UploadProgress;
  readonly onCancel: () => void;
  readonly isRetrying?: boolean;
}

export interface NetworkStatusBannerProps {
  readonly isOnline: boolean;
  readonly wasOffline: boolean;
}

export interface DeviceDisconnectedDialogProps {
  readonly deviceLabel: string | null;
  readonly onReconnect: () => void;
  readonly onStop: () => void;
}

export interface DraftRecoveryDialogProps {
  readonly draft: RecordingDraft;
  readonly onRestore: () => void;
  readonly onDiscard: () => void;
}

export interface VideoMetadataDisplayProps {
  readonly metadata: VideoMetadata;
}

export interface ThumbnailPreviewProps {
  readonly thumbnailUrl: string;
}

export interface BrightnessWarningProps {
  readonly onDismiss: () => void;
}

export interface FaceDetectionHintProps {
  readonly onDismiss: () => void;
}
