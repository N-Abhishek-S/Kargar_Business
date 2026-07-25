/**
 * useVideoMetadata — Duration, resolution, and size extraction
 */

import { useState, useCallback } from 'react';
import type { VideoMetadata, UseVideoMetadataReturn } from '../types/video-recorder.types';

export function useVideoMetadata(): UseVideoMetadataReturn {
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const extractMetadata = useCallback(async (source: Blob | string): Promise<VideoMetadata | null> => {
    setIsLoading(true);

    try {
      const result = await loadVideoMetadata(source);
      setMetadata(result);
      setIsLoading(false);
      return result;
    } catch {
      setIsLoading(false);
      return null;
    }
  }, []);

  return { metadata, isLoading, extractMetadata };
}

function loadVideoMetadata(source: Blob | string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;

    let url: string;
    let shouldRevoke = false;
    if (source instanceof Blob) {
      url = URL.createObjectURL(source);
      shouldRevoke = true;
    } else {
      url = source;
    }

    video.onloadedmetadata = () => {
      const result: VideoMetadata = {
        duration: isFinite(video.duration) ? video.duration : 0,
        width: video.videoWidth,
        height: video.videoHeight,
        size: source instanceof Blob ? source.size : 0,
        mimeType: source instanceof Blob ? source.type : 'video/webm',
      };

      video.removeAttribute('src');
      video.load();
      if (shouldRevoke) URL.revokeObjectURL(url);

      resolve(result);
    };

    video.onerror = () => {
      if (shouldRevoke) URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = url;
  });
}
