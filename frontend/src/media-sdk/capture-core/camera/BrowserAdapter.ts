import { SDKError } from "../types";

export class BrowserAdapter {
  /**
   * Encapsulates navigator.mediaDevices.getUserMedia with a deterministic fallback strategy:
   * 1. Attempt 1: ideal facingMode
   * 2. Attempt 2: exact/string facingMode fallback
   * 3. Attempt 3: Enumerate & choose rear by label
   * 4. Attempt 4: Any camera fallback
   */
  async getStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof window === "undefined" || !navigator.mediaDevices.getUserMedia) {
      throw new SDKError("Camera access is not supported in this environment.", "NotSupportedError");
    }

    try {
      // Attempt 1
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError") {
          return this.handleOverconstrainedFallback(constraints, err);
        }
        
        if (err.name === "NotAllowedError" && this.isSafari()) {
          console.warn("BrowserAdapter: Safari NotAllowedError detected. Attempting generic constraints fallback.");
          return this.handleSafariFallback(constraints);
        }

        // If it's another error that indicates device missing or unsupported, try enumeration
        if (err.name === "NotFoundError" || err.name === "NotReadableError") {
          return this.handleDeviceEnumerationFallback(constraints);
        }
      }

      throw err;
    }
  }

  private async handleOverconstrainedFallback(
    originalConstraints: MediaStreamConstraints, 
    originalError: unknown
  ): Promise<MediaStream> {
    console.warn("BrowserAdapter: OverconstrainedError encountered. Falling back to relaxed constraints.", originalError);
    
    const relaxedConstraints = JSON.parse(JSON.stringify(originalConstraints)) as MediaStreamConstraints;
    
    // Attempt 2: Relax facingMode and resolution constraints
    if (relaxedConstraints.video && typeof relaxedConstraints.video === "object") {
      const videoOpts = relaxedConstraints.video;
      
      const width = videoOpts.width as ConstrainULongRange | undefined;
      if (width && typeof width === "object" && "exact" in width) {
        videoOpts.width = { ideal: width.exact };
      }
      
      const height = videoOpts.height as ConstrainULongRange | undefined;
      if (height && typeof height === "object" && "exact" in height) {
        videoOpts.height = { ideal: height.exact };
      }
      
      const facingMode = videoOpts.facingMode as ConstrainDOMStringParameters | undefined;
      if (facingMode && typeof facingMode === "object") {
        if ("exact" in facingMode) {
          videoOpts.facingMode = facingMode.exact;
        } else if ("ideal" in facingMode) {
          videoOpts.facingMode = facingMode.ideal;
        }
      }
    }

    try {
      return await navigator.mediaDevices.getUserMedia(relaxedConstraints);
    } catch {
      // If Attempt 2 fails, move to Attempt 3
      return this.handleDeviceEnumerationFallback(originalConstraints);
    }
  }

  private async handleDeviceEnumerationFallback(originalConstraints: MediaStreamConstraints): Promise<MediaStream> {
    console.warn("BrowserAdapter: Falling back to device enumeration (Attempt 3).");
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      
      if (videoDevices.length === 0) {
        throw new SDKError("No video devices found on the system.", "NotFoundError");
      }

      // Attempt 3: Choose rear camera by label
      const rearCamera = videoDevices.find(d => 
        d.label.toLowerCase().includes("back") || 
        d.label.toLowerCase().includes("rear") ||
        d.label.toLowerCase().includes("environment")
      );

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const deviceId = rearCamera ? rearCamera.deviceId : videoDevices[0]!.deviceId;
      
      // Attempt 3/4: Request specific device ID
      const fallbackConstraints: MediaStreamConstraints = {
        video: { deviceId: { exact: deviceId } },
        audio: originalConstraints.audio
      };

      return await navigator.mediaDevices.getUserMedia(fallbackConstraints);
    } catch {
      // If all else fails, attempt 4 with completely generic constraints
      return this.handleSafariFallback(originalConstraints);
    }
  }

  private async handleSafariFallback(originalConstraints: MediaStreamConstraints): Promise<MediaStream> {
    const genericConstraints: MediaStreamConstraints = {
      video: true, // Just ask for any video stream
      audio: originalConstraints.audio
    };
    try {
      return await navigator.mediaDevices.getUserMedia(genericConstraints);
    } catch {
      throw new SDKError("Browser denied camera access or the camera is unavailable.", "NotAllowedError");
    }
  }

  private isSafari(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium") && !ua.includes("android");
  }
}
