/**
 * useThumbnail — Auto thumbnail generation from video
 */

import { useState, useCallback } from 'react';
import type { UseThumbnailReturn } from '../types/video-recorder.types';
import { safeRevokeObjectURL } from '../utils/video-recorder.utils';

export function useThumbnail(): UseThumbnailReturn {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateThumbnail = useCallback(async (videoUrl: string): Promise<string | null> => {
    setIsGenerating(true);

    try {
      const url = await captureFrame(videoUrl, 1);
      // Revoke previous thumbnail
      safeRevokeObjectURL(thumbnailUrl);
      setThumbnailUrl(url);
      setIsGenerating(false);
      return url;
    } catch {
      setIsGenerating(false);
      return null;
    }
  }, [thumbnailUrl]);

  return { thumbnailUrl, isGenerating, generateThumbnail };
}

/**
 * Capture a frame from a video at the given seek time.
 */
function captureFrame(videoUrl: string, seekSeconds: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    video.onloadedmetadata = () => {
      // Seek to the desired time (or 0 if video is shorter)
      video.currentTime = Math.min(seekSeconds, video.duration * 0.1 || 0);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

        // Cleanup
        video.removeAttribute('src');
        video.load();

        resolve(dataUrl);
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    video.onerror = () => {
      reject(new Error('Failed to load video for thumbnail'));
    };

    video.src = videoUrl;
  });
}
