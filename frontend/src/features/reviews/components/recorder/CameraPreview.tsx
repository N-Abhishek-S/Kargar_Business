/**
 * Camera Preview — Live mirrored webcam feed
 *
 * Renders a 16:9 video element with the live MediaStream.
 * Mirrored for a natural selfie experience.
 */

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import type { CameraPreviewProps } from '../../types/video-recorder.types';
import '../../styles/video-recorder.css';

export function CameraPreview({ stream, isRecording, isPaused, videoRef: externalRef }: CameraPreviewProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoElement = externalRef ?? internalRef;

  useEffect(() => {
    const el = videoElement.current;
    if (!el) return;

    if (stream) {
      el.srcObject = stream;
    } else {
      el.srcObject = null;
    }

    return () => {
      if (el) el.srcObject = null;
    };
  }, [stream, videoElement]);

  return (
    <div className="aspect-video-container">
      <video
        ref={videoElement}
        autoPlay
        muted
        playsInline
        className={clsx(
          'camera-preview-mirror',
          'w-full h-full object-cover',
        )}
        aria-label="Camera preview"
      />

      {/* Subtle border overlay for a polished look */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />

      {/* Recording/Paused state border */}
      {isRecording && !isPaused && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-inset ring-red-500/50 pointer-events-none" />
      )}
      {isPaused && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-inset ring-amber-400/50 pointer-events-none" />
      )}
    </div>
  );
}
