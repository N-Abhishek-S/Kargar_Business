import type { Emitter } from "../utils/EventEmitter";
import type { CameraState, SDKEventMap, FacingMode } from "../types";
import { SDKError } from "../types";
import type { PermissionService } from "../services/PermissionService";
import type { MediaDeviceService } from "../services/MediaDeviceService";
import type { ConstraintBuilder } from "../constraints/ConstraintBuilder";
import type { CameraConfig } from "../config/camera.config";
import type { CameraCapabilityService } from "../services/CameraCapabilityService";

import type { BrowserAdapter } from "./BrowserAdapter";

export class MediaCameraController {
  private state: CameraState = "IDLE";
  private stream: MediaStream | null = null;
  private currentFacingMode: FacingMode | null = null;
  private currentDeviceId: string | null = null;
  private abortController: AbortController | null = null;
  private cancellationReason: "close" | "switch" | null = null;

  constructor(
    private emitter: Emitter<SDKEventMap>,
    private config: CameraConfig,
    private permissionService: PermissionService,
    private deviceService: MediaDeviceService,
    private constraintBuilder: ConstraintBuilder,
    private capabilityService: CameraCapabilityService,
    private browserAdapter: BrowserAdapter
  ) {}

  getState(): CameraState {
    return this.state;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  private transition(newState: CameraState): boolean {
    const validTransitions: Record<CameraState, CameraState[]> = {
      IDLE: ["OPENING"],
      OPENING: ["READY", "ERROR", "IDLE", "CLOSING"],
      READY: ["SWITCHING", "CLOSING"],
      SWITCHING: ["READY", "ERROR", "CLOSING"],
      CLOSING: ["IDLE"],
      ERROR: ["IDLE", "OPENING", "CLOSING"],
    };

    const isValid = validTransitions[this.state].includes(newState);

    if (!isValid) {
      console.warn(`MediaCameraController: Invalid state transition ${this.state} -> ${newState}`);
      this.emitter.emit("transition.failed", { from: this.state, to: newState, reason: this.cancellationReason });
      return false;
    }

    this.state = newState;
    return true;
  }

  async open(options?: { facingMode?: FacingMode; deviceId?: string; audio?: boolean }): Promise<void> {
    if (this.state === "READY" || this.state === "OPENING") {
      return;
    }

    if (!this.transition("OPENING")) return;

    // Cancel any previous pending open operations
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    const startMs = performance.now();

    try {
      // 1. Ensure permissions are granted
      await this.permissionService.requestCameraPermission();

      if (signal.aborted) throw new SDKError("Aborted");

      // 2. Fetch devices
      const { cameras: devices } = await this.deviceService.getDevices();
      
      if (devices.length === 0) {
        throw new SDKError("CameraNotFoundError");
      }

      // Determine initial facing mode or device
      this.currentFacingMode = options?.facingMode ?? this.config.mobileDefaultFacingMode;
      // Do not override facing mode with default device ID on mobile
      const isMobile = this.capabilityService.isMobileDevice();
      this.currentDeviceId = isMobile ? (options?.deviceId ?? null) : (options?.deviceId ?? (devices[0]?.deviceId ?? null));

      // 3. Build Constraints
      const constraints = this.constraintBuilder.build({
        facingMode: this.currentFacingMode,
        deviceId: this.currentDeviceId ?? undefined,
        config: this.config,
        audio: options?.audio,
      });

      // 4. Request Stream using BrowserAdapter
      this.stream = await this.browserAdapter.getStream(constraints);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (signal.aborted) {
        this.stopCurrentStream();
        throw new SDKError("Aborted");
      }

      // 5. Wire up stream recovery
      this.wireUpStreamRecovery(options?.audio);

      // Update actual active parameters from the stream's tracks
      const track = this.stream.getVideoTracks()[0];
      if (track) {
        const settings = track.getSettings();
        if (settings.facingMode) {
          this.currentFacingMode = settings.facingMode as FacingMode;
        }
        if (settings.deviceId) {
          this.currentDeviceId = settings.deviceId;
        }
      }

      if (!this.transition("READY")) {
        this.stopCurrentStream();
        return;
      }

      this.emitter.emit("camera.opened", {
        camera: this.currentFacingMode,
        deviceId: this.currentDeviceId ?? "unknown",
        browser: navigator.userAgent,
        platform: isMobile ? "mobile" : "desktop",
        durationMs: Math.round(performance.now() - startMs),
      });
    } catch (e: unknown) {
      if (this.cancellationReason !== null) {
        this.cancellationReason = null;
        return;
      }

      if (e instanceof Error) {
        this.transition("ERROR");
        Object.assign(e, {
          durationMs: Math.round(performance.now() - startMs),
          facingMode: this.currentFacingMode
        });
        this.emitter.emit("error", e);
      } else {
        this.transition("ERROR");
        this.emitter.emit("error", new Error(String(e)));
      }
    }
  }

  private wireUpStreamRecovery(audio?: boolean) {
    if (!this.stream) return;
    const track = this.stream.getVideoTracks()[0];
    if (track) {
      track.onended = async () => {
        if (this.state !== "READY" && this.state !== "SWITCHING") return;
        console.warn("MediaCameraController: Stream lost (track ended unexpectedly)");
        this.stopCurrentStream();
        
        try {
          const permissionState = await this.permissionService.checkCameraPermission();
          const granted = permissionState === "granted";
          if (granted) {
            console.log("MediaCameraController: Permission still granted, attempting reconnect...");
            this.state = "IDLE";
            await this.open({ facingMode: this.currentFacingMode ?? undefined, deviceId: this.currentDeviceId ?? undefined, audio });
          } else {
            console.error("MediaCameraController: Permission lost after stream ended.");
            this.transition("ERROR");
            this.emitter.emit("error", new SDKError("PermissionDeniedError", "Permission lost during recovery"));
          }
        } catch (err) {
          this.transition("ERROR");
          this.emitter.emit("error", err instanceof Error ? err : new Error("Recovery failed"));
        }
      };
    }
  }

  async switchCamera(options?: { audio?: boolean }): Promise<void> {
    // Switching Preconditions Validation
    if (this.state !== "READY") {
      console.warn(`MediaCameraController: switchCamera not allowed in state ${this.state}.`);
      return;
    }

    const permissionState = await this.permissionService.checkCameraPermission();
    const permissionGranted = permissionState === "granted";
    if (!permissionGranted) {
      console.warn(`MediaCameraController: switchCamera not allowed without permission.`);
      return;
    }

    if (!this.transition("SWITCHING")) return;

    if (this.abortController) {
      this.cancellationReason = "switch";
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const fromMode = this.currentFacingMode ?? "user";
    let toMode: FacingMode = fromMode === "environment" ? "user" : "environment";

    try {
      const isMobile = this.capabilityService.isMobileDevice();

      if (isMobile) {
        this.currentFacingMode = toMode;
        this.currentDeviceId = null;
      } else {
        // Desktop device cycling
        const { cameras: devices } = await this.deviceService.getDevices();
        if (devices.length > 1) {
          const currentIndex = devices.findIndex((d) => d.deviceId === this.currentDeviceId);
          const nextIndex = (currentIndex + 1) % devices.length;
          this.currentDeviceId = devices[nextIndex]?.deviceId ?? null;
          toMode = "user"; // Desktop webcams are almost always 'user' facing conceptually
        }
      }

      const constraints = this.constraintBuilder.build({
        facingMode: this.currentFacingMode ?? toMode,
        deviceId: this.currentDeviceId ?? undefined,
        config: this.config,
        audio: options?.audio,
      });

      // Crucial: Stop previous stream BEFORE requesting new one on mobile to free hardware
      this.stopCurrentStream();

      // Request Stream using BrowserAdapter
      this.stream = await this.browserAdapter.getStream(constraints);

      if (signal.aborted) {
        this.stopCurrentStream();
        throw new SDKError("Aborted");
      }

      this.wireUpStreamRecovery(options?.audio);

      if (!this.transition("READY")) {
        this.stopCurrentStream();
        return;
      }
      this.emitter.emit("camera.switched", { from: fromMode, to: toMode });
    } catch (e: unknown) {
      if (this.cancellationReason !== null) {
        this.cancellationReason = null;
        return;
      }

      if (e instanceof Error) {
        this.transition("ERROR");
        this.emitter.emit("error", e);
      } else {
        this.transition("ERROR");
        this.emitter.emit("error", new Error(String(e)));
      }
    }
  }

  close(): void {
    if (this.state === "IDLE") return;
    if (!this.transition("CLOSING")) return;

    if (this.abortController) {
      this.cancellationReason = "close";
      this.abortController.abort();
    }
    
    this.stopCurrentStream();
    this.stream = null;
    this.currentFacingMode = null;
    this.currentDeviceId = null;
    
    this.transition("IDLE");
    this.emitter.emit("camera.closed", undefined);
  }

  private stopCurrentStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.onended = null; // Clear handler to prevent false recovery
        track.stop();
      });
    }
  }
}
