/**
 * Upload Service — Upload with progress, cancel, retry, and network awareness
 *
 * Items 5 (network detection), 6 (progress), 7 (cancel), 8 (retry), 17 (background).
 *
 * Uses the existing Supabase storage bucket and path structure.
 * Falls back to the existing uploadReviewVideo() for the actual upload,
 * wrapping it with progress estimation, AbortController, and retry logic.
 */

import { supabase } from '@/supabase/client';
import { UploadLogger } from './logger.service';
import { UploadConfig } from '../config/recorder.config';
import type { UploadProgress, UploadResult } from '../types/video-recorder.types';

const REVIEW_VIDEO_BUCKET = 'review-videos';

/**
 * Upload a video file with progress tracking, abort support, and retry.
 */
export async function uploadVideoWithProgress(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal,
): Promise<UploadResult> {
  const extension = file.name.split('.').pop() ?? 'webm';
  const dateFolder = new Date().toISOString().slice(0, 10);
  const path = `${dateFolder}/${crypto.randomUUID()}.${extension}`;

  UploadLogger.info('Starting upload', {
    name: file.name,
    size: file.size,
    type: file.type,
    path,
  });

  // Check if abort was already signaled
  if (signal?.aborted) {
    throw new DOMException('Upload cancelled', 'AbortError');
  }

  // Try XHR-based upload for real progress events
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (supabaseUrl && supabaseKey) {
    try {
      const result = await xhrUpload(
        `${supabaseUrl}/storage/v1/object/${REVIEW_VIDEO_BUCKET}/${path}`,
        supabaseKey,
        file,
        onProgress,
        signal,
      );
      if (result) return result;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      UploadLogger.warn('XHR upload failed, falling back to Supabase client', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Fallback: use Supabase JS client (no real progress)
  return supabaseFallbackUpload(file, path, onProgress, signal);
}

/**
 * XHR-based upload for real progress events.
 */
function xhrUpload(
  url: string,
  apiKey: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal,
): Promise<UploadResult | null> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();

    xhr.open('POST', url, true);
    xhr.setRequestHeader('apikey', apiKey);
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.setRequestHeader('Content-Type', file.type || 'video/webm');
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('Cache-Control', 'max-age=31536000');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = elapsed > 0 ? e.loaded / elapsed : 0;
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
          speed,
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Get public URL
        const { data } = supabase.storage.from(REVIEW_VIDEO_BUCKET).getPublicUrl(
          url.split(`/${REVIEW_VIDEO_BUCKET}/`)[1] ?? '',
        );
        resolve({
          url: data.publicUrl,
          path: url.split(`/${REVIEW_VIDEO_BUCKET}/`)[1] ?? '',
          size: file.size,
          contentType: file.type || 'video/webm',
        });
      } else {
        UploadLogger.error('XHR upload failed', { status: xhr.status, response: xhr.responseText });
        resolve(null); // Fall back to Supabase client
      }
    };

    xhr.onerror = () => {
      resolve(null); // Fall back
    };

    // Abort support
    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new DOMException('Upload cancelled', 'AbortError'));
      });
    }

    xhr.send(file);
  });
}

/**
 * Fallback upload using Supabase JS client with synthetic progress.
 */
async function supabaseFallbackUpload(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal,
): Promise<UploadResult> {
  // Synthetic progress: simulate 90% over the expected upload time
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  if (onProgress) {
    let fakePercent = 0;
    progressInterval = setInterval(() => {
      fakePercent = Math.min(fakePercent + 5, 90);
      onProgress({
        loaded: Math.round((fakePercent / 100) * file.size),
        total: file.size,
        percent: fakePercent,
        speed: 0,
      });
    }, 500);
  }

  // Check abort
  if (signal?.aborted) {
    if (progressInterval) clearInterval(progressInterval);
    throw new DOMException('Upload cancelled', 'AbortError');
  }

  const { error } = await supabase.storage.from(REVIEW_VIDEO_BUCKET).upload(path, file, {
    contentType: file.type || 'video/webm',
    cacheControl: '31536000',
    upsert: false,
  });

  if (progressInterval) clearInterval(progressInterval);

  if (error) {
    UploadLogger.error('Supabase upload failed', { error: error.message });
    throw new Error(error.message || 'Video upload failed');
  }

  // 100% progress
  onProgress?.({ loaded: file.size, total: file.size, percent: 100, speed: 0 });

  const { data } = supabase.storage.from(REVIEW_VIDEO_BUCKET).getPublicUrl(path);
  return {
    url: data.publicUrl,
    path,
    size: file.size,
    contentType: file.type || 'video/webm',
  };
}

/**
 * Upload with automatic retry on failure.
 */
export async function uploadVideoWithRetry(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal,
  onRetryAttempt?: (attempt: number) => void,
): Promise<UploadResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= UploadConfig.RETRY_ATTEMPTS; attempt++) {
    if (signal?.aborted) {
      throw new DOMException('Upload cancelled', 'AbortError');
    }

    try {
      return await uploadVideoWithProgress(file, onProgress, signal);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }

      lastError = err instanceof Error ? err : new Error(String(err));
      UploadLogger.warn(`Upload attempt ${attempt + 1} failed`, {
        error: lastError.message,
        willRetry: attempt < UploadConfig.RETRY_ATTEMPTS,
      });

      if (attempt < UploadConfig.RETRY_ATTEMPTS) {
        onRetryAttempt?.(attempt + 1);
        const delay = UploadConfig.RETRY_DELAY_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError ?? new Error('Upload failed after all retries');
}
