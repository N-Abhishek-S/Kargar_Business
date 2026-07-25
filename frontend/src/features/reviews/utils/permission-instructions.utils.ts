/**
 * Video Recorder — Browser-Specific Permission Recovery Instructions
 *
 * Provides step-by-step instructions for each browser on how to
 * re-enable camera/microphone permissions after denial.
 */

import { recorderStrings } from '../i18n/recorder.i18n';
import { detectBrowser } from './video-recorder.utils';

export interface PermissionInstructions {
  readonly steps: readonly string[];
  readonly browserName: string;
  readonly iconHint: 'lock' | 'shield' | 'settings' | 'info';
}

/**
 * Get browser-specific instructions for recovering camera/mic permissions.
 */
export function getPermissionInstructions(
  browser?: string,
): PermissionInstructions {
  const detected = browser ?? detectBrowser();

  switch (detected) {
    case 'chrome':
      return {
        steps: recorderStrings.chromeInstructions,
        browserName: 'Google Chrome',
        iconHint: 'lock',
      };
    case 'firefox':
      return {
        steps: recorderStrings.firefoxInstructions,
        browserName: 'Mozilla Firefox',
        iconHint: 'shield',
      };
    case 'safari':
      return {
        steps: recorderStrings.safariInstructions,
        browserName: 'Safari',
        iconHint: 'settings',
      };
    case 'edge':
      return {
        steps: recorderStrings.edgeInstructions,
        browserName: 'Microsoft Edge',
        iconHint: 'lock',
      };
    default:
      return {
        steps: recorderStrings.genericInstructions,
        browserName: 'your browser',
        iconHint: 'info',
      };
  }
}
