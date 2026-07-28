/**
 * Video Recorder — Validation Service
 *
 * Validates video files before upload: MIME type, magic bytes, size, duration, resolution.
 */

import { ValidationLogger } from './logger.service';
import { RecorderLimits, AcceptedVideoMimes } from '../config/recorder.config';

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: string[];
}

export interface MagicBytesResult {
  readonly valid: boolean;
  readonly detectedType: string;
}

/**
 * Discriminates between files created by the application's own Media SDK
 * (browser-generated, trusted) and files uploaded from the user's disk
 * (untrusted, require full validation).
 */
export type VideoOrigin = 'sdk-recorded' | 'user-uploaded';

/* ================================================================
   Magic Bytes — File Signature Validation
   ================================================================ */

const MAGIC_SIGNATURES: { bytes: number[]; offset: number; type: string; mask?: number[] }[] = [
  // WebM: starts with EBML header 1A 45 DF A3
  { bytes: [0x1a, 0x45, 0xdf, 0xa3], offset: 0, type: 'video/webm' },
  // MP4/MOV: has 'ftyp' at offset 4
  { bytes: [0x66, 0x74, 0x79, 0x70], offset: 4, type: 'video/mp4' },
];

export async function validateMagicBytes(file: File | Blob): Promise<MagicBytesResult> {
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const view = new Uint8Array(buffer);

    for (const sig of MAGIC_SIGNATURES) {
      let match = true;
      for (let i = 0; i < sig.bytes.length; i++) {
        const byteIndex = sig.offset + i;
        if (byteIndex >= view.length) { match = false; break; }
        const expected = sig.bytes[i];
        const actual = sig.mask ? ((view[byteIndex] ?? 0) & (sig.mask[i] ?? 0)) : (view[byteIndex] ?? 0);
        if (actual !== expected) { match = false; break; }
      }
      if (match) {
        ValidationLogger.debug('Magic bytes matched', { type: sig.type });
        return { valid: true, detectedType: sig.type };
      }
    }

    ValidationLogger.warn('Magic bytes did not match any known signature');
    return { valid: false, detectedType: 'unknown' };
  } catch (err) {
    ValidationLogger.error('Magic bytes validation failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return { valid: false, detectedType: 'error' };
  }
}

/* ================================================================
   MIME Validation
   ================================================================ */

export function validateMimeType(mimeType: string): boolean {
  // Accept any of our accepted types or codec-qualified variants
  const baseMime = mimeType.split(';')[0]?.trim() ?? '';
  return (AcceptedVideoMimes as readonly string[]).includes(baseMime);
}

/* ================================================================
   Size Validation
   ================================================================ */

export function validateFileSize(size: number): boolean {
  return size <= RecorderLimits.MAX_FILE_SIZE_BYTES;
}

/* ================================================================
   Duration Validation (via video element)
   ================================================================ */

export function validateDuration(
  source: Blob | string,
): Promise<{ valid: boolean; duration: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
      if (typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };

    let url: string;
    if (source instanceof Blob) {
      url = URL.createObjectURL(source);
    } else {
      url = source;
    }

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const valid = isFinite(duration) && duration <= RecorderLimits.MAX_DURATION_SECONDS + 1; // +1s tolerance
      ValidationLogger.debug('Duration validated', { duration, valid });
      cleanup();
      resolve({ valid, duration });
    };

    video.onerror = () => {
      ValidationLogger.warn('Could not read video duration');
      cleanup();
      resolve({ valid: true, duration: 0 }); // Don't block on metadata failure
    };

    video.src = url;
  });
}

/* ================================================================
   Resolution Extraction
   ================================================================ */

export function extractResolution(
  source: Blob | string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;

    let url: string;
    if (source instanceof Blob) {
      url = URL.createObjectURL(source);
    } else {
      url = source;
    }

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    };

    video.onloadedmetadata = () => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      cleanup();
      resolve({ width: w, height: h });
    };

    video.onerror = () => {
      cleanup();
      resolve({ width: 0, height: 0 });
    };

    video.src = url;
  });
}

/* ================================================================
   Full Validation Pipeline
   ================================================================ */

export async function validateVideoFile(
  file: File | Blob,
  origin: VideoOrigin = 'user-uploaded',
): Promise<ValidationResult> {
  const errors: string[] = [];
  const mimeType = file instanceof File ? file.type : (file).type;

  // SDK-recorded files: trust the browser's MediaRecorder output.
  // Only validate size and duration — skip MIME and magic bytes.
  const isTrusted = origin === 'sdk-recorded';

  // 1. MIME type (external uploads only)
  if (!isTrusted && mimeType && !validateMimeType(mimeType)) {
    errors.push(`Unsupported format: ${mimeType}. Use MP4, MOV, or WebM.`);
  }

  // 2. Magic bytes — cross-reference with declared MIME (external uploads only)
  if (!isTrusted) {
    const magicResult = await validateMagicBytes(file);
    if (!magicResult.valid) {
      errors.push('File contents do not match a recognized video format.');
    }
  }

  // 3. Size (always validated)
  if (!validateFileSize(file.size)) {
    const maxMB = Math.round(RecorderLimits.MAX_FILE_SIZE_BYTES / (1024 * 1024));
    errors.push(`File is too large. Maximum size is ${maxMB} MB.`);
  }

  // 4. Duration (always validated)
  const durationResult = await validateDuration(file);
  if (!durationResult.valid) {
    errors.push(`Video is too long. Maximum duration is ${RecorderLimits.MAX_DURATION_SECONDS / 60} minutes.`);
  }

  const valid = errors.length === 0;
  ValidationLogger.info('Validation complete', { valid, errorCount: errors.length, origin });

  return { valid, errors };
}
