/**
 * Video Recorder — Browser Capabilities Hook
 *
 * Detects browser-level support for recording features.
 * Runs once on mount, memoized.
 */

import { useMemo } from 'react';
import { getCapabilities } from '../services/media.service';
import type { BrowserCapabilities } from '../types/video-recorder.types';

export function useBrowserCapabilities(): BrowserCapabilities {
  return useMemo(() => getCapabilities(), []);
}
