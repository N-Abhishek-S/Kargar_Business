/**
 * useMediaDevices — Device enumeration, selection, and hot-swap
 *
 * Items 1 (device selection), 2 (hot-swap), 14 (remember last devices).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MediaLogger } from '../services/logger.service';
import { StorageKeys } from '../config/recorder.config';
import type { RecorderDeviceInfo, UseMediaDevicesReturn } from '../types/video-recorder.types';
import { useMediaCapture } from '../../../media-sdk/capture-react/useMediaCapture';

function loadStoredId(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveStoredId(key: string, id: string | null): void {
  try {
    if (id) localStorage.setItem(key, id);
    else localStorage.removeItem(key);
  } catch {
    // localStorage unavailable
  }
}

export function useMediaDevices(): UseMediaDevicesReturn {
  const mediaCapture = useMediaCapture();
  
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [selectedMic, setSelectedMic] = useState<string | null>(null);
  const [isDeviceDisconnected, setIsDeviceDisconnected] = useState(false);
  const [disconnectedDeviceLabel, setDisconnectedDeviceLabel] = useState<string | null>(null);

  const prevCamerasRef = useRef<RecorderDeviceInfo[]>([]);
  const prevMicsRef = useRef<RecorderDeviceInfo[]>([]);

  // The devices are already managed by the SDK, so we just use them
  const cameras = mediaCapture.devices.cameras;
  const microphones = mediaCapture.devices.microphones;
  const speakers = mediaCapture.devices.speakers;

  const detectChanges = useCallback(() => {
    // Detect disconnections
    const prevCams = prevCamerasRef.current;
    const prevMics = prevMicsRef.current;

    if (prevCams.length > 0 && cameras.length < prevCams.length) {
      const removed = prevCams.find(
        (c) => !cameras.some((d) => d.deviceId === c.deviceId),
      );
      if (removed) {
        MediaLogger.warn('Camera disconnected', { label: removed.label });
        setIsDeviceDisconnected(true);
        setDisconnectedDeviceLabel(removed.label || 'Camera');
      }
    }

    if (prevMics.length > 0 && microphones.length < prevMics.length) {
      const removed = prevMics.find(
        (m) => !microphones.some((d) => d.deviceId === m.deviceId),
      );
      if (removed) {
        MediaLogger.warn('Microphone disconnected', { label: removed.label });
        setIsDeviceDisconnected(true);
        setDisconnectedDeviceLabel(removed.label || 'Microphone');
      }
    }

    // Auto-detect reconnection
    if (isDeviceDisconnected && cameras.length > 0) {
      setIsDeviceDisconnected(false);
      setDisconnectedDeviceLabel(null);
      MediaLogger.info('Device reconnected');
    }

    prevCamerasRef.current = cameras;
    prevMicsRef.current = microphones;

    // Auto-select if nothing selected
    if (!selectedCamera && cameras.length > 0) {
      const stored = loadStoredId(StorageKeys.LAST_CAMERA);
      const match = stored ? cameras.find((c) => c.deviceId === stored) : null;
      const first = match ?? cameras[0];
      if (first) setSelectedCamera(first.deviceId);
    }

    if (!selectedMic && microphones.length > 0) {
      const stored = loadStoredId(StorageKeys.LAST_MIC);
      const match = stored ? microphones.find((m) => m.deviceId === stored) : null;
      const first = match ?? microphones[0];
      if (first) setSelectedMic(first.deviceId);
    }
  }, [cameras, microphones, selectedCamera, selectedMic, isDeviceDisconnected]);

  // Run change detection when SDK devices change
  useEffect(() => {
    detectChanges();
  }, [cameras, microphones, detectChanges]);

  const selectCamera = useCallback((id: string) => {
    setSelectedCamera(id);
    saveStoredId(StorageKeys.LAST_CAMERA, id);
    MediaLogger.info('Camera selected', { deviceId: id });
  }, []);

  const selectMic = useCallback((id: string) => {
    setSelectedMic(id);
    saveStoredId(StorageKeys.LAST_MIC, id);
    MediaLogger.info('Microphone selected', { deviceId: id });
  }, []);

  const refreshDevices = useCallback(async () => {
    // We could ask SDK to refresh, but the SDK auto-listens
    // If we really need manual refresh, we could add a refresh method to the SDK.
    // For now, this is a no-op because SDK listens to devicechange.
    return Promise.resolve();
  }, []);

  return {
    cameras,
    microphones,
    speakers,
    selectedCamera,
    selectedMic,
    selectCamera,
    selectMic,
    isDeviceDisconnected,
    disconnectedDeviceLabel,
    refreshDevices,
  };
}
