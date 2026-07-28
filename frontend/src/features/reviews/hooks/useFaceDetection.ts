/**
 * useFaceDetection — Lightweight face visibility heuristic
 *
 * Uses contrast/edge detection on the center region of the frame.
 * NOT ML-based — this is a simple heuristic behind a feature flag.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { RecorderFlags } from '../config/recorder.config';
import type { UseFaceDetectionReturn } from '../types/video-recorder.types';

// Extract flag to runtime variable so TypeScript doesn't narrow `false as const`
const faceDetectionEnabled: boolean = RecorderFlags.ENABLE_FACE_DETECTION;

export function useFaceDetection(
  videoElement: HTMLVideoElement | null,
  isActive: boolean,
): UseFaceDetectionReturn {
  const [faceVisible, setFaceVisible] = useState(true); // Default to true (non-blocking)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const analyze = useCallback(() => {
    if (!videoElement || videoElement.readyState < 2) return;

    canvasRef.current ??= document.createElement('canvas');
    const canvas = canvasRef.current;
    canvas.width = 64;
    canvas.height = 64;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Sample the center 50% of the frame (where a face typically is)
    const vw = videoElement.videoWidth;
    const vh = videoElement.videoHeight;
    const sx = vw * 0.25;
    const sy = vh * 0.1;
    const sw = vw * 0.5;
    const sh = vh * 0.6;

    ctx.drawImage(videoElement, sx, sy, sw, sh, 0, 0, 64, 64);
    const imageData = ctx.getImageData(0, 0, 64, 64);
    const pixels = imageData.data;

    // Simple edge detection: count significant luminance changes between adjacent pixels
    let edgeCount = 0;
    for (let y = 0; y < 64; y++) {
      for (let x = 1; x < 64; x++) {
        const idx = (y * 64 + x) * 4;
        const prevIdx = (y * 64 + x - 1) * 4;
        const diff = Math.abs((pixels[idx] ?? 0) - (pixels[prevIdx] ?? 0)) +
                     Math.abs((pixels[idx + 1] ?? 0) - (pixels[prevIdx + 1] ?? 0)) +
                     Math.abs((pixels[idx + 2] ?? 0) - (pixels[prevIdx + 2] ?? 0));
        if (diff > 60) edgeCount++;
      }
    }

    // A face typically produces many edges (eyes, nose, mouth, hair, etc.)
    // A blank wall or empty chair produces very few
    const edgeRatio = edgeCount / (64 * 63);
    setFaceVisible(edgeRatio > 0.08);
  }, [videoElement]);

  useEffect(() => {
    if (!faceDetectionEnabled || !isActive || !videoElement) {
      return;
    }

    // Check every 3 seconds
    intervalRef.current = setInterval(analyze, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, videoElement, analyze]);

  return { faceVisible };
}
