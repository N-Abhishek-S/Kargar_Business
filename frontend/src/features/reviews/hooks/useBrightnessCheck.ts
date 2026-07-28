/**
 * useBrightnessCheck — Low light detection via canvas pixel analysis
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { RecorderLimits, RecorderFlags } from '../config/recorder.config';
import type { UseBrightnessCheckReturn } from '../types/video-recorder.types';

// Extract flag to runtime variable so TypeScript doesn't narrow `true as const`
const brightnessCheckEnabled: boolean = RecorderFlags.ENABLE_BRIGHTNESS_CHECK;

export function useBrightnessCheck(
  videoElement: HTMLVideoElement | null,
  isActive: boolean,
): UseBrightnessCheckReturn {
  const [isTooDark, setIsTooDark] = useState(false);
  const [brightness, setBrightness] = useState(128);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const analyze = useCallback(() => {
    if (!videoElement || videoElement.readyState < 2) return;

    canvasRef.current ??= document.createElement('canvas');
    const canvas = canvasRef.current;
    // Use a small sample size for performance
    canvas.width = 64;
    canvas.height = 36;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(videoElement, 0, 0, 64, 36);
    const imageData = ctx.getImageData(0, 0, 64, 36);
    const pixels = imageData.data;

    let totalLuminance = 0;
    const pixelCount = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
      // Perceived luminance formula
      const r = pixels[i] ?? 0;
      const g = pixels[i + 1] ?? 0;
      const b = pixels[i + 2] ?? 0;
      totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const avg = totalLuminance / pixelCount;
    setBrightness(avg);
    setIsTooDark(avg < RecorderLimits.BRIGHTNESS_THRESHOLD);
  }, [videoElement]);

  useEffect(() => {
    if (!brightnessCheckEnabled || !isActive || !videoElement) {
      return;
    }

    // Initial check
    analyze();

    intervalRef.current = setInterval(analyze, RecorderLimits.BRIGHTNESS_SAMPLE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, videoElement, analyze]);

  return { isTooDark, brightness };
}
