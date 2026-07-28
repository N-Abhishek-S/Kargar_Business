/**
 * Video Recorder — Barrel Export Index
 *
 * Single import point for all recorder components, hooks, services, and utilities.
 */

/* ---- Components ---- */
export { VideoRecorderModal } from './components/recorder/VideoRecorderModal';
export { CameraPreview } from '../../media-sdk/capture-ui/CameraPreview';
export { CountdownOverlay } from './components/recorder/CountdownOverlay';
export { RecordingControls } from './components/recorder/RecordingControls';
export { RecordingTimer } from './components/recorder/RecordingTimer';
export { RecordingIndicator } from './components/recorder/RecordingIndicator';
export { VideoPreview } from './components/recorder/VideoPreview';
export { PermissionDialog } from './components/recorder/PermissionDialog';
export { UnsupportedBrowserNotice } from './components/recorder/UnsupportedBrowserNotice';
export { DeviceSelector } from './components/recorder/DeviceSelector';
export { QualitySelector } from './components/recorder/QualitySelector';
export { AudioLevelMeter } from './components/recorder/AudioLevelMeter';
export { UploadProgressBar } from './components/recorder/UploadProgressBar';
export { NetworkStatusBanner } from './components/recorder/NetworkStatusBanner';
export { VideoMetadataDisplay } from './components/recorder/VideoMetadataDisplay';
export { ThumbnailPreview } from './components/recorder/ThumbnailPreview';
export { BrightnessWarning } from './components/recorder/BrightnessWarning';
export { FaceDetectionHint } from './components/recorder/FaceDetectionHint';
export { DeviceDisconnectedDialog } from './components/recorder/DeviceDisconnectedDialog';
export { DraftRecoveryDialog } from './components/recorder/DraftRecoveryDialog';

/* ---- Hooks ---- */
export { useVideoRecorder } from './hooks/useVideoRecorder';
export { useBrowserCapabilities } from './hooks/useBrowserCapabilities';
export { useMediaDevices } from './hooks/useMediaDevices';
export { useAudioLevel } from './hooks/useAudioLevel';
export { useUploadProgress } from './hooks/useUploadProgress';
export { useNetworkStatus } from './hooks/useNetworkStatus';
export { useThumbnail } from './hooks/useThumbnail';
export { useVideoMetadata } from './hooks/useVideoMetadata';
export { useBrightnessCheck } from './hooks/useBrightnessCheck';
export { useFaceDetection } from './hooks/useFaceDetection';
export { useDraftRecovery } from './hooks/useDraftRecovery';
export { useNavigationGuard } from './hooks/useNavigationGuard';

/* ---- Services ---- */
export { pluginManager } from './services/plugin.service';
export { performanceMonitor } from './services/performance.service';
export { trackRecorderEvent, createTimedEvent } from './services/analytics.service';

/* ---- Config ---- */
export { RecorderFlags, RecorderLimits, QualityPresets } from './config/recorder.config';

/* ---- Types ---- */
export type * from './types/video-recorder.types';
