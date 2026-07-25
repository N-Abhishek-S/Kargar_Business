/**
 * useMediaDevices — Device enumeration, selection, and hot-swap
 *
 * Items 1 (device selection), 2 (hot-swap), 14 (remember last devices).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  enumerateDevices,
  onDeviceChange,
} from '../services/media.service';
import { MediaLogger } from '../services/logger.service';
import { StorageKeys } from '../config/recorder.config';
import type { RecorderDeviceInfo, UseMediaDevicesReturn } from '../types/video-recorder.types';

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
  const [cameras, setCameras] = useState<RecorderDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<RecorderDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<RecorderDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [selectedMic, setSelectedMic] = useState<string | null>(null);
  const [isDeviceDisconnected, setIsDeviceDisconnected] = useState(false);
  const [disconnectedDeviceLabel, setDisconnectedDeviceLabel] = useState<string | null>(null);

  const prevCamerasRef = useRef<RecorderDeviceInfo[]>([]);
  const prevMicsRef = useRef<RecorderDeviceInfo[]>([]);

  const refreshDevices = useCallback(async () => {
    const devices = await enumerateDevices();
    setCameras(devices.cameras);
    setMicrophones(devices.microphones);
    setSpeakers(devices.speakers);

    // Detect disconnections
    const prevCams = prevCamerasRef.current;
    const prevMics = prevMicsRef.current;

    if (prevCams.length > 0 && devices.cameras.length < prevCams.length) {
      const removed = prevCams.find(
        (c) => !devices.cameras.some((d) => d.deviceId === c.deviceId),
      );
      if (removed) {
        MediaLogger.warn('Camera disconnected', { label: removed.label });
        setIsDeviceDisconnected(true);
        setDisconnectedDeviceLabel(removed.label || 'Camera');
      }
    }

    if (prevMics.length > 0 && devices.microphones.length < prevMics.length) {
      const removed = prevMics.find(
        (m) => !devices.microphones.some((d) => d.deviceId === m.deviceId),
      );
      if (removed) {
        MediaLogger.warn('Microphone disconnected', { label: removed.label });
        setIsDeviceDisconnected(true);
        setDisconnectedDeviceLabel(removed.label || 'Microphone');
      }
    }

    // Auto-detect reconnection
    if (isDeviceDisconnected && devices.cameras.length > 0) {
      setIsDeviceDisconnected(false);
      setDisconnectedDeviceLabel(null);
      MediaLogger.info('Device reconnected');
    }

    prevCamerasRef.current = devices.cameras;
    prevMicsRef.current = devices.microphones;

    // Auto-select if nothing selected
    if (!selectedCamera && devices.cameras.length > 0) {
      const stored = loadStoredId(StorageKeys.LAST_CAMERA);
      const match = stored ? devices.cameras.find((c) => c.deviceId === stored) : null;
      const first = match ?? devices.cameras[0];
      if (first) setSelectedCamera(first.deviceId);
    }

    if (!selectedMic && devices.microphones.length > 0) {
      const stored = loadStoredId(StorageKeys.LAST_MIC);
      const match = stored ? devices.microphones.find((m) => m.deviceId === stored) : null;
      const first = match ?? devices.microphones[0];
      if (first) setSelectedMic(first.deviceId);
    }
  }, [selectedCamera, selectedMic, isDeviceDisconnected]);

  // Initial enumeration
  useEffect(() => {
    void refreshDevices();
  }, [refreshDevices]);

  // Listen for device changes (hot-swap)
  useEffect(() => {
    const unsubscribe = onDeviceChange(() => {
      void refreshDevices();
    });
    return unsubscribe;
  }, [refreshDevices]);

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
