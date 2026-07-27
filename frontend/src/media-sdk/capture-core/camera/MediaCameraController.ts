import type { Emitter } from "../utils/EventEmitter";
import type { CameraState, SDKEventMap, FacingMode } from "../types";
import { SDKError } from "../types";
import { PermissionService } from "../services/PermissionService";
import { MediaDeviceService } from "../services/MediaDeviceService";
import { ConstraintBuilder } from "../constraints/ConstraintBuilder";
import type { CameraConfig } from "../config/camera.config";
import { CameraCapabilityService } from "../services/CameraCapabilityService";

import { BrowserAdapter } from "./BrowserAdapter";

export class MediaCameraController {
  private state: CameraState = "IDLE";
  private stream: MediaStream | null = null;
  private currentFacingMode: FacingMode | null = null;
  private currentDeviceId: string | null = null;
  private abortController: AbortController | null = null;

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

  private transition(newState: CameraState) {
    // Basic FSM enforcement (in a full production SDK, this might be a table lookup)
    const validTransitions: Record<CameraState, CameraState[]> = {
      IDLE: ["OPENING"],
      OPENING: ["READY", "ERROR", "IDLE"],
      READY: ["SWITCHING", "CLOSING"],
      SWITCHING: ["READY", "ERROR"],
      CLOSING: ["IDLE"],
      ERROR: ["IDLE", "OPENING"],
    };

    if (!validTransitions[this.state].includes(newState)) {
      console.warn(`Invalid state transition: ${this.state} -> ${newState}. Forcing state anyway for safety.`);
    }

    this.state = newState;
  }

  async open(options?: { facingMode?: FacingMode; deviceId?: string; audio?: boolean }): Promise<void> {
    if (this.state === "READY" || this.state === "OPENING") {
      return;
    }

    this.transition("OPENING");

    // Cancel any previous pending open operations
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      // 1. Ensure permissions are granted
      await this.permissionService.requestCameraPermission();

      if (signal.aborted) throw new SDKError("Aborted");

      // 2. Fetch devices
      const devices = await this.deviceService.getCameraDevices();
      
      if (devices.length === 0) {
        throw new SDKError("CameraNotFoundError");
      }

      // Determine initial facing mode or device
      this.currentFacingMode = options?.facingMode || this.config.mobileDefaultFacingMode;
      // Do not override facing mode with default device ID on mobile
      const isMobile = this.capabilityService.isMobileDevice();
      this.currentDeviceId = isMobile ? (options?.deviceId || null) : (options?.deviceId || (devices[0]?.deviceId ?? null));

      // 3. Build Constraints
      const constraints = this.constraintBuilder.build({
        facingMode: this.currentFacingMode || undefined,
        deviceId: this.currentDeviceId || undefined,
        config: this.config,
        audio: options?.audio,
      });

      // 4. Request Stream using BrowserAdapter
      this.stream = await this.browserAdapter.getStream(constraints);

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

      this.transition("READY");

      this.emitter.emit("camera.opened", {
        camera: this.currentFacingMode!,
        deviceId: this.currentDeviceId || "unknown",
        browser: navigator.userAgent,
        platform: isMobile ? "mobile" : "desktop",
      });
    } catch (e: any) {
      if (e.message !== "Aborted") {
        this.transition("ERROR");
        this.emitter.emit("error", e instanceof Error ? e : new Error(String(e)));
      } else {
        this.transition("IDLE"); // Transition back to idle if aborted before finishing
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
          const granted = await this.permissionService.hasCameraPermission();
          if (granted) {
            console.log("MediaCameraController: Permission still granted, attempting reconnect...");
            this.state = "IDLE";
            await this.open({ facingMode: this.currentFacingMode || undefined, deviceId: this.currentDeviceId || undefined, audio });
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

    const permissionGranted = await this.permissionService.hasCameraPermission();
    if (!permissionGranted) {
      console.warn(`MediaCameraController: switchCamera not allowed without permission.`);
      return;
    }

    this.transition("SWITCHING");

    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const fromMode = this.currentFacingMode!;
    let toMode: FacingMode = fromMode === "environment" ? "user" : "environment";

    try {
      const isMobile = this.capabilityService.isMobileDevice();

      if (isMobile) {
        this.currentFacingMode = toMode;
        this.currentDeviceId = null;
      } else {
        // Desktop device cycling
        const devices = await this.deviceService.getCameraDevices();
        if (devices.length > 1) {
          const currentIndex = devices.findIndex((d) => d.deviceId === this.currentDeviceId);
          const nextIndex = (currentIndex + 1) % devices.length;
          this.currentDeviceId = devices[nextIndex]?.deviceId ?? null;
          toMode = "user"; // Desktop webcams are almost always 'user' facing conceptually
        }
      }

      const constraints = this.constraintBuilder.build({
        facingMode: this.currentFacingMode || toMode,
        deviceId: this.currentDeviceId || undefined,
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

      this.transition("READY");
      this.emitter.emit("camera.switched", { from: fromMode, to: toMode });
    } catch (e: any) {
      if (e.message !== "Aborted") {
        this.transition("ERROR");
        this.emitter.emit("error", e instanceof Error ? e : new Error(String(e)));
      }
    }
  }

  async close(): Promise<void> {
    if (this.state === "IDLE") return;
    this.transition("CLOSING");

    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.stopCurrentStream();
    this.stream = null;
    this.currentFacingMode = null;
    this.currentDeviceId = null;
    
    this.transition("IDLE");
    this.emitter.emit("camera.closed", undefined as any);
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
