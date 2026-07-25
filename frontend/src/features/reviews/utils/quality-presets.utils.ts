/**
 * Video Recorder — Quality Preset Utilities
 *
 * Builds MediaStreamConstraints from quality presets and device selections.
 */

import { QualityPresets, DEFAULT_QUALITY } from '../config/recorder.config';
import type { VideoQuality } from '../types/video-recorder.types';

/**
 * Build MediaStreamConstraints for getUserMedia from quality preset + device IDs.
 */
export function buildConstraints(
  quality: VideoQuality = DEFAULT_QUALITY,
  cameraId?: string | null,
  micId?: string | null,
): MediaStreamConstraints {
  const preset = QualityPresets[quality];

  const video: MediaTrackConstraints = {
    width: { ideal: preset.width },
    height: { ideal: preset.height },
    frameRate: { ideal: preset.frameRate },
    facingMode: 'user', // Default to front camera
  };

  if (cameraId) {
    video.deviceId = { exact: cameraId };
    // Remove facingMode when a specific device is chosen
    delete video.facingMode;
  }

  const audio: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  if (micId) {
    audio.deviceId = { exact: micId };
  }

  return { video, audio };
}

/**
 * Probe the maximum supported quality for the user's camera.
 * Tries from highest to lowest, returns the first that succeeds.
 */
export async function getMaxSupportedQuality(
  cameraId?: string | null,
): Promise<VideoQuality> {
  const qualityOrder: VideoQuality[] = ['1080p', '720p', '360p'];

  for (const q of qualityOrder) {
    try {
      const constraints = buildConstraints(q, cameraId);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Immediately stop — we only wanted to test
      for (const track of stream.getTracks()) {
        track.stop();
      }
      return q;
    } catch {
      // This quality not supported, try next
    }
  }

  return DEFAULT_QUALITY;
}

/**
 * Get human-readable resolution string from quality preset.
 */
export function getResolutionLabel(quality: VideoQuality): string {
  const p = QualityPresets[quality];
  return `${p.width}×${p.height}`;
}
