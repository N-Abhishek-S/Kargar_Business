/**
 * Video Recorder Modal — Industry-Grade Top-Level Orchestrator
 *
 * Integrates ALL enterprise features:
 * - Device selection (camera, mic, quality)
 * - Real-time audio level meter
 * - Brightness detection + face detection hints
 * - Device hot-swap (disconnect / reconnect)
 * - Draft recovery (IndexedDB)
 * - Network status banner
 * - Navigation guard (beforeunload)
 * - Full keyboard accessibility
 * - Framer Motion animations
 * - Auto thumbnail generation
 * - Video metadata extraction
 *
 * Lazy-loaded by VideoUploadCard via React.lazy().
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Clock, Settings2, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

import type { VideoRecorderModalProps, VideoMetadata, VideoQuality } from '../../types/video-recorder.types';
import { RecorderLimits, RecorderFlags, DEFAULT_QUALITY, StorageKeys } from '../../config/recorder.config';
import { recorderStrings } from '../../i18n/recorder.i18n';
import { formatRecordingTime } from '../../utils/video-recorder.utils';

/* ---- Hooks ---- */
import { useVideoRecorder } from '../../hooks/useVideoRecorder';
import { useBrowserCapabilities } from '../../hooks/useBrowserCapabilities';
import { useMediaDevices } from '../../hooks/useMediaDevices';
import { useAudioLevel } from '../../hooks/useAudioLevel';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useNavigationGuard } from '../../hooks/useNavigationGuard';
import { useThumbnail } from '../../hooks/useThumbnail';
import { useVideoMetadata } from '../../hooks/useVideoMetadata';
import { useBrightnessCheck } from '../../hooks/useBrightnessCheck';
import { useFaceDetection } from '../../hooks/useFaceDetection';
import { useDraftRecovery } from '../../hooks/useDraftRecovery';
import { useMediaCapture } from '../../../../media-sdk/capture-react/useMediaCapture';

/* ---- Services ---- */
import { trackRecorderEvent } from '../../services/analytics.service';

/* ---- Components ---- */
import { CameraPreview } from '../../../../media-sdk/capture-ui/CameraPreview';
import { CountdownOverlay } from './CountdownOverlay';
import { RecordingControls } from './RecordingControls';
import { RecordingIndicator } from './RecordingIndicator';
import { VideoPreview } from './VideoPreview';
import { PermissionDialog } from './PermissionDialog';
import { UnsupportedBrowserNotice } from './UnsupportedBrowserNotice';
import { DeviceSelector } from './DeviceSelector';
import { QualitySelector } from './QualitySelector';
import { AudioLevelMeter } from './AudioLevelMeter';
import { NetworkStatusBanner } from './NetworkStatusBanner';
import { BrightnessWarning } from './BrightnessWarning';
import { FaceDetectionHint } from './FaceDetectionHint';
import { DeviceDisconnectedDialog } from './DeviceDisconnectedDialog';
import { DraftRecoveryDialog } from './DraftRecoveryDialog';
import '../../styles/video-recorder.css';

/* ================================================================ */

export function VideoRecorderModal({ isOpen, onClose, onUseVideo }: VideoRecorderModalProps) {
  /* ---- Core hooks ---- */
  const capabilities = useBrowserCapabilities();
  const mediaCapture = useMediaCapture();
  const recorder = useVideoRecorder();
  const devices = useMediaDevices();
  const network = useNetworkStatus();
  const { thumbnailUrl, generateThumbnail } = useThumbnail();
  const { metadata: extractedMeta, extractMetadata } = useVideoMetadata();
  const draftRecovery = useDraftRecovery();

  /* ---- Destructure recorder ---- */
  const {
    state, error, stream, previewUrl, recordedBlob,
    elapsedSeconds, countdownValue,
    requestPermission, startCountdown, pauseRecording, resumeRecording,
    stopRecording, retake, getRecordedFile, cleanup,
  } = recorder;

  /* ---- State ---- */
  const [showSettings, setShowSettings] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>(() => {
    try {
      const stored = localStorage.getItem(StorageKeys.LAST_QUALITY);
      return (stored as VideoQuality | null) ?? DEFAULT_QUALITY;
    } catch {
      return DEFAULT_QUALITY;
    }
  });
  const [brightnessWarningDismissed, setBrightnessWarningDismissed] = useState(false);
  const [faceHintDismissed, setFaceHintDismissed] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  /* ---- Refs ---- */
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  // Track the video element in state so brightness/face hooks get a stable value
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  /* ---- Sync ref → state for hooks that need the element ---- */
  useEffect(() => {
    // Use a small interval to pick up the element once CameraPreview mounts
    const check = () => {
      const el = cameraVideoRef.current;
      setVideoElement((prev) => (prev !== el ? el : prev));
    };
    check();
    const id = setInterval(check, 500);
    return () => { clearInterval(id); };
  }, [state]); // re-check when state changes (camera mounts/unmounts)

  /* ---- Derived state ---- */
  const isActive = state === 'recording' || state === 'paused' || state === 'countdown';
  const isCameraLive = state === 'ready' || state === 'countdown' || state === 'recording' || state === 'paused';
  const isSupported = capabilities.supportsCamera && capabilities.supportsMediaRecorder;

  /* ---- Phase 2 hooks (only active when camera is live) ---- */
  const audioLevel = useAudioLevel(isCameraLive ? stream : null);
  const { isTooDark } = useBrightnessCheck(videoElement, isCameraLive && state === 'ready');
  const { faceVisible } = useFaceDetection(videoElement, isCameraLive && state === 'ready');

  /* ---- Navigation guard ---- */
  useNavigationGuard(isActive);

  /* ---- Compute draft dialog on open (derived, no setState in effect) ---- */
  const enableDraftRecovery = RecorderFlags.ENABLE_DRAFT_RECOVERY as boolean;
  const shouldShowDraftDialog = isOpen && state === 'idle' && enableDraftRecovery && draftRecovery.hasDraft;

  /* ---- Auto-request permission when modal opens ---- */
  useEffect(() => {
    if (isOpen && state === 'idle') {
      if (!isSupported) return;

      // If there's a draft, show the dialog instead
      if (shouldShowDraftDialog) {
        return;
      }

      void requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ---- Show draft dialog when conditions met ---- */
  useEffect(() => {
    if (shouldShowDraftDialog && !showDraftDialog) {
      // Defer to next tick to avoid synchronous setState-in-effect
      const id = requestAnimationFrame(() => { setShowDraftDialog(true); });
      return () => { cancelAnimationFrame(id); };
    }
    return undefined;
  }, [shouldShowDraftDialog, showDraftDialog]);

  /* ---- Cleanup when modal closes ---- */
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    // Only run reset when transitioning from open → closed
    if (prevIsOpenRef.current && !isOpen) {
      cleanup();
      // Defer UI state resets to avoid synchronous setState cascades
      requestAnimationFrame(() => {
        setShowSettings(false);
        setBrightnessWarningDismissed(false);
        setFaceHintDismissed(false);
        setShowDraftDialog(false);
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, cleanup]);

  /* ---- Lock body scroll ---- */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* ---- Generate thumbnail + metadata when recording stops ---- */
  useEffect(() => {
    if (state === 'preview' && previewUrl) {
      void generateThumbnail(previewUrl);
      if (recordedBlob) {
        void extractMetadata(recordedBlob);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, previewUrl]);

  /* ---- Analytics events ---- */
  useEffect(() => {
    if (state === 'recording') trackRecorderEvent('record_clicked');
    if (state === 'paused') trackRecorderEvent('pause_clicked');
    if (state === 'preview') trackRecorderEvent('stop_clicked', { duration: elapsedSeconds });
  }, [state, elapsedSeconds]);

  /* ---- Handle device disconnection ---- */
  useEffect(() => {
    if (devices.isDeviceDisconnected && isActive) {
      pauseRecording();
      trackRecorderEvent('device_disconnected');
    }
  }, [devices.isDeviceDisconnected, isActive, pauseRecording]);

  /* ---- Quality change persists to localStorage ---- */
  const handleQualityChange = useCallback((q: VideoQuality) => {
    setSelectedQuality(q);
    try { localStorage.setItem(StorageKeys.LAST_QUALITY, q); } catch { /* */ }
    trackRecorderEvent('quality_changed', { quality: q });
  }, []);

  /* ---- Handlers ---- */
  const handleClose = useCallback(() => {
    if (isActive) {
      const confirmed = window.confirm(recorderStrings.navigationWarning);
      if (!confirmed) return;
    }
    cleanup();
    onClose();
  }, [isActive, cleanup, onClose]);

  const handleUseVideo = useCallback(() => {
    const file = getRecordedFile();
    if (file) {
      trackRecorderEvent('upload_clicked', { size: file.size });
      // Clear any draft
      void draftRecovery.discardDraft();
      onUseVideo(file);
      cleanup();
      onClose();
    }
  }, [getRecordedFile, onUseVideo, cleanup, onClose, draftRecovery]);

  const handleFallbackUpload = useCallback(() => {
    trackRecorderEvent('cancelled');
    cleanup();
    onClose();
  }, [cleanup, onClose]);

  const handleCancel = useCallback(() => {
    trackRecorderEvent('cancelled');
    cleanup();
    onClose();
  }, [cleanup, onClose]);

  const handleRetake = useCallback(() => {
    trackRecorderEvent('retake_clicked');
    retake();
  }, [retake]);

  const handleReconnect = useCallback(async () => {
    await devices.refreshDevices();
    if (!devices.isDeviceDisconnected) {
      void requestPermission();
    }
  }, [devices, requestPermission]);

  const handleDraftRestore = useCallback(async () => {
    setShowDraftDialog(false);
    const draft = await draftRecovery.restoreDraft();
    if (draft) {
      trackRecorderEvent('draft_restored');
      // Convert draft blob to file and use it directly
      const file = new File([draft.blob], 'restored-recording.webm', {
        type: draft.metadata.mimeType,
        lastModified: draft.createdAt,
      });
      onUseVideo(file);
      void draftRecovery.discardDraft();
      onClose();
    }
  }, [draftRecovery, onUseVideo, onClose]);

  const handleDraftDiscard = useCallback(() => {
    setShowDraftDialog(false);
    trackRecorderEvent('draft_discarded');
    void draftRecovery.discardDraft();
    void requestPermission();
  }, [draftRecovery, requestPermission]);

  /* ---- ESC key ---- */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); };
  }, [isOpen, handleClose]);

  /* ---- Build metadata for preview ---- */
  const metadata: VideoMetadata | null = extractedMeta ?? (recordedBlob
    ? {
        duration: elapsedSeconds,
        width: 0,
        height: 0,
        size: recordedBlob.size,
        mimeType: recordedBlob.type || 'video/webm',
      }
    : null);

  /* ---- Remaining seconds for duration warning ---- */
  const remaining = RecorderLimits.MAX_DURATION_SECONDS - elapsedSeconds;
  const showDurationWarning = isActive && remaining <= RecorderLimits.DURATION_WARNING_SECONDS && remaining > 0;

  /* ---- Feature flag booleans resolved at render time ---- */
  const enableCameraSelection = RecorderFlags.ENABLE_CAMERA_SELECTION as boolean;
  const enableQualitySelector = RecorderFlags.ENABLE_QUALITY_SELECTOR as boolean;
  const enableBrightnessCheck = RecorderFlags.ENABLE_BRIGHTNESS_CHECK as boolean;
  const enableFaceDetection = RecorderFlags.ENABLE_FACE_DETECTION as boolean;
  const enableAudioMeter = RecorderFlags.ENABLE_AUDIO_METER as boolean;

  if (typeof document === 'undefined') return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={isActive ? undefined : handleClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recorder-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={clsx(
              'relative z-10 flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden',
              'rounded-2xl bg-gray-900 shadow-2xl outline-none',
              'max-w-2xl',
            )}
          >
            {/* ======== HEADER ======== */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-500/15">
                  <Video size={18} className="text-orange-400" />
                </div>
                <div>
                  <h2 id="recorder-modal-title" className="text-base font-semibold text-white">
                    {recorderStrings.modalTitle}
                  </h2>
                  <p className="text-xs text-gray-400">{recorderStrings.modalSubtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Duration badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>{recorderStrings.maxDurationBadge}</span>
                </div>

                {/* Settings toggle */}
                {isCameraLive && (
                  <button
                    type="button"
                    onClick={() => { setShowSettings((v) => !v); }}
                    className={clsx(
                      'flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200',
                      showSettings
                        ? 'text-orange-400 bg-orange-500/15'
                        : 'text-gray-400 hover:text-white hover:bg-white/10',
                      'recorder-focus-ring',
                    )}
                    aria-label="Toggle settings"
                    aria-expanded={showSettings}
                  >
                    <Settings2 size={16} />
                  </button>
                )}

                {/* Flip Camera button */}
                {isCameraLive && (
                  <button
                    type="button"
                    onClick={() => {
                      trackRecorderEvent('camera_selected', { source: 'flip_button' });
                      void mediaCapture.switchCamera({ audio: true });
                    }}
                    disabled={state === 'recording' || state === 'countdown'}
                    className={clsx(
                      'flex items-center justify-center w-8 h-8 rounded-full',
                      'text-gray-400 hover:text-white hover:bg-white/10',
                      'transition-colors duration-200 recorder-focus-ring',
                      'disabled:opacity-30 disabled:cursor-not-allowed'
                    )}
                    aria-label="Flip Camera"
                    title="Flip Camera"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}

                {/* Close button */}
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={state === 'recording'}
                  className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-full',
                    'text-gray-400 hover:text-white hover:bg-white/10',
                    'transition-colors duration-200 recorder-focus-ring',
                    'disabled:opacity-30 disabled:cursor-not-allowed',
                  )}
                  aria-label="Close recorder"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ======== NETWORK STATUS ======== */}
            <NetworkStatusBanner isOnline={network.isOnline} wasOffline={network.wasOffline} />

            {/* ======== SETTINGS PANEL (Collapsible) ======== */}
            <AnimatePresence>
              {showSettings && isCameraLive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden border-b border-white/5"
                >
                  <div className="px-6 py-3 space-y-3 bg-gray-900/50">
                    {/* Device selectors */}
                    {enableCameraSelection && (
                      <DeviceSelector
                        cameras={devices.cameras}
                        microphones={devices.microphones}
                        selectedCamera={devices.selectedCamera}
                        selectedMic={devices.selectedMic}
                        onCameraChange={(id) => {
                          devices.selectCamera(id);
                          recorder._setSelectedCamera(id);
                          trackRecorderEvent('camera_selected');
                          if (state === 'ready') {
                            void requestPermission();
                          }
                        }}
                        onMicChange={(id) => {
                          devices.selectMic(id);
                          recorder._setSelectedMic(id);
                          trackRecorderEvent('microphone_selected');
                          if (state === 'ready') {
                            void requestPermission();
                          }
                        }}
                        disabled={state === 'recording'}
                      />
                    )}

                    {/* Quality selector */}
                    {enableQualitySelector && (
                      <QualitySelector
                        selectedQuality={selectedQuality}
                        onQualityChange={handleQualityChange}
                        disabled={state === 'recording'}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ======== BODY ======== */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Draft recovery dialog */}
              {showDraftDialog && draftRecovery.draft && (
                <DraftRecoveryDialog
                  draft={draftRecovery.draft}
                  onRestore={handleDraftRestore}
                  onDiscard={handleDraftDiscard}
                />
              )}

              {/* Unsupported browser */}
              {!isSupported && !showDraftDialog && (
                <UnsupportedBrowserNotice onClose={handleClose} />
              )}

              {/* Permission error */}
              {isSupported && state === 'error' && error && !showDraftDialog && (
                <PermissionDialog
                  errorType={error.type}
                  onRetry={requestPermission}
                  onFallbackUpload={handleFallbackUpload}
                />
              )}

              {/* Requesting permission — loading state */}
              {isSupported && state === 'requesting_permission' && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm text-gray-400">{recorderStrings.permissionTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">Allow camera and microphone access</p>
                </div>
              )}

              {/* ======== CAMERA PREVIEW ======== */}
              {isSupported && isCameraLive && !showDraftDialog && (
                <div className="relative">
                  <div className="aspect-video-container">
                    <CameraPreview
                      ref={cameraVideoRef}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Countdown overlay */}
                  {state === 'countdown' && countdownValue !== null && (
                    <CountdownOverlay value={countdownValue} />
                  )}

                  {/* Recording indicator (top-left) */}
                  {(state === 'recording' || state === 'paused') && (
                    <RecordingIndicator isPaused={state === 'paused'} />
                  )}

                  {/* Elapsed time badge (top-right) */}
                  {(state === 'recording' || state === 'paused') && (
                    <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                      <span className={clsx(
                        'text-xs font-semibold tabular-nums',
                        showDurationWarning ? 'text-amber-400' :
                        state === 'paused' ? 'text-amber-400' : 'text-white',
                      )}>
                        {formatRecordingTime(elapsedSeconds)}
                        {showDurationWarning && (
                          <span className="ml-1.5 text-[10px] text-amber-400/80 font-normal">
                            {remaining}s left
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Device disconnected overlay */}
                  {devices.isDeviceDisconnected && isActive && (
                    <DeviceDisconnectedDialog
                      deviceLabel={devices.disconnectedDeviceLabel}
                      onReconnect={handleReconnect}
                      onStop={stopRecording}
                    />
                  )}

                  {/* Brightness warning (bottom overlay) */}
                  <AnimatePresence>
                    {enableBrightnessCheck && isTooDark && !brightnessWarningDismissed && state === 'ready' && (
                      <BrightnessWarning onDismiss={() => { setBrightnessWarningDismissed(true); }} />
                    )}
                  </AnimatePresence>

                  {/* Face detection hint (bottom overlay) */}
                  <AnimatePresence>
                    {enableFaceDetection && !faceVisible && !faceHintDismissed && state === 'ready' && (
                      <FaceDetectionHint onDismiss={() => { setFaceHintDismissed(true); }} />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ======== AUDIO LEVEL METER (below preview) ======== */}
              {isSupported && isCameraLive && !showDraftDialog && enableAudioMeter && (
                <div className="mt-3">
                  <AudioLevelMeter level={audioLevel.level} isSilent={audioLevel.isSilent} />
                  {/* Silence warning */}
                  <AnimatePresence>
                    {audioLevel.isSilent && (state === 'recording' || state === 'ready') && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-amber-400 mt-1.5 flex items-center gap-1"
                      >
                        ⚠ {recorderStrings.noAudioDetected}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ======== VIDEO PREVIEW (post-recording) ======== */}
              {isSupported && state === 'preview' && previewUrl && !showDraftDialog && (
                <VideoPreview
                  previewUrl={previewUrl}
                  onRetake={handleRetake}
                  onUseVideo={handleUseVideo}
                  metadata={metadata}
                  thumbnailUrl={thumbnailUrl}
                />
              )}
            </div>

            {/* ======== FOOTER CONTROLS ======== */}
            {isSupported && (state === 'ready' || state === 'recording' || state === 'paused') && !showDraftDialog && (
              <div className="shrink-0 border-t border-white/10 bg-gray-900/80 px-6 py-4">
                {/* Duration warning banner */}
                <AnimatePresence>
                  {showDurationWarning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 text-xs font-medium text-amber-400">
                        <Clock size={14} />
                        <span>{recorderStrings.almostMaxDuration}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <RecordingControls
                  state={state}
                  onRecord={startCountdown}
                  onPause={pauseRecording}
                  onResume={resumeRecording}
                  onStop={stopRecording}
                  onCancel={handleCancel}
                  elapsedSeconds={elapsedSeconds}
                />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
