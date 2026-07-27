/**
 * Video Recorder — Browser Capabilities Hook
 *
 * Detects browser-level support for recording features.
 * Runs once on mount, memoized.
 */

import { useMemo } from 'react';
import { CameraCapabilityService } from '../../../media-sdk/capture-core/services/CameraCapabilityService';
import type { BrowserCapabilities } from '../types/video-recorder.types';

export function useBrowserCapabilities(): BrowserCapabilities {
  return useMemo(() => {
    const service = new CameraCapabilityService();
    return service.getBrowserCapabilities();
  }, []);
}
