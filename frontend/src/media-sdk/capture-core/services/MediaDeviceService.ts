import type { Emitter, EventMap } from "../utils/EventEmitter";

export interface DeviceChangeEventMap extends EventMap {
  devicesChanged: MediaDeviceInfo[];
}

export class MediaDeviceService {
  private currentDevices: MediaDeviceInfo[] = [];

  /**
   * Retrieves all available media devices
   */
  async getDevices(): Promise<{ cameras: MediaDeviceInfo[]; microphones: MediaDeviceInfo[]; speakers: MediaDeviceInfo[] }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.currentDevices = devices;
      return {
        cameras: devices.filter((d) => d.kind === "videoinput"),
        microphones: devices.filter((d) => d.kind === "audioinput"),
        speakers: devices.filter((d) => d.kind === "audiooutput"),
      };
    } catch (e) {
      console.warn("MediaDeviceService: Failed to enumerate devices", e);
      return { cameras: [], microphones: [], speakers: [] };
    }
  }

  /**
   * Listens for device changes (plugging in a webcam/mic)
   */
  listenForDeviceChanges(emitter: Emitter<DeviceChangeEventMap>) {
    const handleDeviceChange = async () => {
      const newDevices = await navigator.mediaDevices.enumerateDevices();
      this.currentDevices = newDevices;
      emitter.emit("devicesChanged", newDevices);
    };

    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    }

    return () => {
      if (navigator.mediaDevices && navigator.mediaDevices.removeEventListener) {
        navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
      }
    };
  }
}
