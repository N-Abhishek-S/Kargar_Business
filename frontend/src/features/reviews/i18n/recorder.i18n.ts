/**
 * Video Recorder — Internationalization Strings
 *
 * Every user-facing string in the recorder system lives here.
 * Components import from this module instead of hardcoding text.
 */

export const recorderStrings = {
  /* ---- Modal ---- */
  modalTitle: 'Record Video Testimonial',
  modalSubtitle: 'Help us by recording your experience.',
  maxDurationBadge: 'Max 3 minutes',

  /* ---- Upload Card ---- */
  videoSectionLabel: 'Video Testimonial',
  videoSectionOptional: '(Optional)',
  uploadExistingVideo: 'Upload Existing Video',
  uploadExistingDesc: 'Choose a file from your device',
  recordVideo: 'Record Video',
  recordVideoDesc: 'Use your webcam & microphone',
  supportedFormats: 'MP4, MOV, WebM',
  maxSize: 'Max 100 MB',

  /* ---- Recording Controls ---- */
  record: 'Record',
  pause: 'Pause',
  resume: 'Resume',
  stop: 'Stop',
  cancel: 'Cancel',
  retake: 'Retake',
  useVideo: 'Use this Video',

  /* ---- Countdown ---- */
  getReady: 'Get ready…',

  /* ---- Timer ---- */
  timeRemaining: 'remaining',

  /* ---- Permission ---- */
  permissionTitle: 'Camera & Microphone Access Required',
  permissionDescription:
    'Please allow access to your camera and microphone to record your testimonial.',
  permissionDeniedTitle: 'Permission Denied',
  permissionDeniedDescription:
    'Camera or microphone access was denied. Please update your browser settings to allow access.',
  tryAgain: 'Try Again',
  uploadInstead: 'Upload a video instead',

  /* ---- Permission Recovery (Browser-specific) ---- */
  chromeInstructions: [
    'Click the lock icon (🔒) in the address bar',
    'Find "Camera" and "Microphone" in the list',
    'Set both to "Allow"',
    'Reload this page',
  ],
  firefoxInstructions: [
    'Click the camera/microphone icon in the address bar',
    'Click "Clear This Permission"',
    'Click "Try Again" below',
  ],
  safariInstructions: [
    'Open Safari → Settings → Websites',
    'Find "Camera" and "Microphone"',
    'Set this website to "Allow"',
    'Reload this page',
  ],
  edgeInstructions: [
    'Click the lock icon (🔒) in the address bar',
    'Find "Camera" and "Microphone" permissions',
    'Set both to "Allow"',
    'Reload this page',
  ],
  genericInstructions: [
    'Open your browser settings',
    'Find Privacy or Site Settings',
    'Allow Camera and Microphone for this website',
    'Reload this page',
  ],

  /* ---- Unsupported Browser ---- */
  unsupportedTitle: 'Recording Not Supported',
  unsupportedDescription:
    "Your browser doesn't support video recording. Please upload a video file instead.",
  unsupportedAction: 'Close',

  /* ---- Device Selection ---- */
  cameraLabel: 'Camera',
  microphoneLabel: 'Microphone',
  defaultCamera: 'Default Camera',
  defaultMic: 'Default Microphone',
  cameraFallback: (index: number) => `Camera ${index + 1}`,
  micFallback: (index: number) => `Microphone ${index + 1}`,

  /* ---- Quality ---- */
  qualityLabel: 'Quality',

  /* ---- Audio Level ---- */
  micLevel: 'Mic Level',
  noAudioDetected: 'No audio detected — check your microphone',

  /* ---- Recording Indicator ---- */
  recording: 'REC',

  /* ---- Duration Warnings ---- */
  maxDurationReached: 'Maximum recording duration reached (3 minutes).',
  almostMaxDuration: '30 seconds remaining',

  /* ---- Video Preview / Metadata ---- */
  duration: 'Duration',
  resolution: 'Resolution',
  fileSize: 'Size',

  /* ---- Upload Progress ---- */
  uploading: 'Uploading…',
  uploadComplete: 'Upload complete',
  uploadFailed: 'Upload failed',
  cancelUpload: 'Cancel Upload',
  retryUpload: 'Retrying…',

  /* ---- Network ---- */
  networkLost: 'Network connection lost. Upload will resume automatically.',
  networkRestored: 'Back online!',

  /* ---- Device Disconnected ---- */
  deviceDisconnectedTitle: 'Camera Disconnected',
  deviceDisconnectedDescription:
    'Recording has been paused. Please reconnect your camera to continue.',
  reconnect: 'Reconnect',
  stopRecording: 'Stop Recording',

  /* ---- Draft Recovery ---- */
  draftFoundTitle: 'Unfinished Recording Found',
  draftFoundDescription:
    'We found a recording from your last session. Would you like to restore it?',
  restoreDraft: 'Restore',
  discardDraft: 'Discard',

  /* ---- Brightness ---- */
  brightnessWarning: 'Lighting appears low. Improve lighting for better video quality.',

  /* ---- Face Detection ---- */
  faceNotDetected: 'Face not detected — please move into frame.',

  /* ---- Navigation Guard ---- */
  navigationWarning:
    'You have an active recording. Leaving this page will discard your recording.',

  /* ---- Errors ---- */
  errorGeneric: 'Something went wrong. Please try again.',
  errorCameraNotFound: 'No camera found. Please connect a camera and try again.',
  errorMicNotFound: 'No microphone found. Please connect a microphone and try again.',
  errorOverconstrained:
    'The selected quality is not supported by your camera. Try a lower quality setting.',
  errorRecordingFailed: 'Recording failed unexpectedly. Please try again.',
  errorFileTooLarge: 'The recorded video exceeds the 100 MB limit. Please record a shorter video.',
  errorInvalidMime: 'The video format is not supported.',
} as const;
