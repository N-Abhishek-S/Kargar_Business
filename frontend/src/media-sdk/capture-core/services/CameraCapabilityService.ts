export class CameraCapabilityService {
  /**
   * Determines if the current environment is likely a mobile device.
   * This is used as a fallback or heuristic for setting facingMode vs deviceId.
   */
  isMobileDevice(): boolean {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  }

  /**
   * Detects if the current browser supports facingMode constraints reliably.
   * Note: Safari on iOS supports it but sometimes requires specific patterns.
   */
  supportsFacingMode(): boolean {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return false;
    
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    return !!supportedConstraints.facingMode;
  }

  getBrowserCapabilities() {
    const hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia);
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';

    let supportsWebM = false;
    let supportsMP4 = false;
    let supportsPause = false;
    let supportsResume = false;

    if (hasMediaRecorder) {
      supportsWebM = MediaRecorder.isTypeSupported('video/webm');
      supportsMP4 = MediaRecorder.isTypeSupported('video/mp4');
      supportsPause = typeof MediaRecorder.prototype.pause === 'function';
      supportsResume = typeof MediaRecorder.prototype.resume === 'function';
    }

    return {
      supportsCamera: hasGetUserMedia,
      supportsMic: hasGetUserMedia,
      supportsMediaRecorder: hasMediaRecorder,
      supportsWebM,
      supportsMP4,
      supportsPause,
      supportsResume,
      supportsPictureInPicture: typeof document !== 'undefined' && 'pictureInPictureEnabled' in document,
    };
  }

  getSupportedMimeType(preferredOrder: string[]): string {
    if (typeof MediaRecorder === 'undefined') return '';

    for (const mime of preferredOrder) {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    }

    return '';
  }
}
