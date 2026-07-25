/**
 * useUploadProgress — Upload hook with progress, cancel, retry
 */

import { useState, useRef, useCallback } from 'react';
import { uploadVideoWithRetry } from '../services/upload.service';
import { UploadLogger } from '../services/logger.service';
import type { UploadProgress, UploadResult, UseUploadProgressReturn } from '../types/video-recorder.types';

export function useUploadProgress(): UseUploadProgressReturn {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const upload = useCallback(async (file: File): Promise<UploadResult> => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsUploading(true);
    setError(null);
    setProgress(null);
    setRetryCount(0);
    setIsRetrying(false);

    try {
      const result = await uploadVideoWithRetry(
        file,
        (p) => setProgress(p),
        controller.signal,
        (attempt) => {
          setIsRetrying(true);
          setRetryCount(attempt);
          UploadLogger.info(`Retry attempt ${attempt}`);
        },
      );

      setIsUploading(false);
      setIsRetrying(false);
      UploadLogger.info('Upload complete', { url: result.url });
      return result;
    } catch (err) {
      setIsUploading(false);
      setIsRetrying(false);

      if (err instanceof DOMException && err.name === 'AbortError') {
        UploadLogger.info('Upload cancelled by user');
        setError(null);
        throw err;
      }

      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      UploadLogger.error('Upload failed', { error: message });
      throw err;
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      setProgress(null);
      UploadLogger.info('Upload cancelled');
    }
  }, []);

  return {
    upload,
    cancelUpload,
    progress,
    isUploading,
    isRetrying,
    retryCount,
    error,
  };
}
