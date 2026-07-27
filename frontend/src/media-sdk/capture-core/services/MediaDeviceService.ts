export class MediaDeviceService {
  /**
   * Retrieves all available media devices
   */
  async getDevices(): Promise<{ cameras: MediaDeviceInfo[]; microphones: MediaDeviceInfo[]; speakers: MediaDeviceInfo[] }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
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
  listenForDeviceChanges(onDevicesChanged: (devices: MediaDeviceInfo[]) => void) {
    const handleDeviceChange = () => {
      navigator.mediaDevices.enumerateDevices().then((newDevices) => {
        onDevicesChanged(newDevices);
      }).catch((e: unknown) => {
        console.error("MediaDeviceService: Failed to enumerate devices on change", e);
      });
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
    };
  }
}
