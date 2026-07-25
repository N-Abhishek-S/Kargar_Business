/**
 * Video Recorder — Core Utility Functions
 *
 * Pure utility functions with no side effects.
 */

/**
 * Format seconds into MM:SS display string.
 */
export function formatRecordingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format bytes into a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'] as const;
  const k = 1024;
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i > 1 ? 2 : 0)} ${units[i]}`;
}

/**
 * Format bits per second into a human-readable bitrate string.
 */
export function formatBitrate(bps: number): string {
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(0)} Kbps`;
  return `${bps} bps`;
}

/**
 * Convert a Blob into a proper File object.
 * The File constructor sets name and lastModified.
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, {
    type: blob.type || 'video/webm',
    lastModified: Date.now(),
  });
}

/**
 * Get file extension from MIME type.
 */
export function getFileExtension(mimeType: string): string {
  const base = mimeType.split(';')[0]?.trim() ?? '';
  switch (base) {
    case 'video/webm': return 'webm';
    case 'video/mp4': return 'mp4';
    case 'video/quicktime': return 'mov';
    default: return 'webm';
  }
}

/**
 * Generate a recording file name with timestamp.
 */
export function generateRecordingFileName(mimeType: string): string {
  const ext = getFileExtension(mimeType);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toISOString().slice(11, 19).replace(/:/g, '-');
  return `recording-${date}_${time}.${ext}`;
}

/**
 * Safely revoke an object URL.
 */
export function safeRevokeObjectURL(url: string | null): void {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Already revoked or invalid
    }
  }
}

/**
 * Detect browser name from user agent.
 */
export function detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'chrome';
  if (ua.includes('Firefox/')) return 'firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'safari';
  return 'unknown';
}

/**
 * Detect device type from user agent.
 */
export function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

/**
 * Check if the current device is mobile.
 */
export function isMobileDevice(): boolean {
  return detectDeviceType() !== 'desktop';
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
