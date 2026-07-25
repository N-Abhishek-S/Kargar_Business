/**
 * Analytics Service — Event tracking
 *
 * Logs recorder events for analytics pipelines.
 * Currently logs to console in dev mode.
 * Replace the `sendEvent` implementation to forward to your analytics provider.
 */

import { AnalyticsLogger } from './logger.service';
import { RecorderFlags } from '../config/recorder.config';
import { detectBrowser, detectDeviceType } from '../utils/video-recorder.utils';
import type { RecorderAnalyticsEvent, AnalyticsPayload } from '../types/video-recorder.types';

const IS_ENABLED = RecorderFlags.ENABLE_ANALYTICS;

/**
 * Track a recorder analytics event.
 */
export function trackRecorderEvent(
  event: RecorderAnalyticsEvent,
  extra?: Record<string, unknown>,
): void {
  if (!IS_ENABLED) return;

  const payload: AnalyticsPayload = {
    event,
    browser: detectBrowser(),
    device: detectDeviceType(),
    timestamp: Date.now(),
    extra,
  };

  AnalyticsLogger.info(`Event: ${event}`, payload as unknown as Record<string, unknown>);

  // TODO: Replace with actual analytics provider (Mixpanel, Amplitude, GA4, etc.)
  // sendToAnalytics(payload);
}

/**
 * Track a timed event (start → end with duration).
 */
export function createTimedEvent(event: RecorderAnalyticsEvent) {
  const start = performance.now();

  return {
    end(extra?: Record<string, unknown>) {
      const durationMs = Math.round(performance.now() - start);
      trackRecorderEvent(event, { ...extra, durationMs });
    },
  };
}
