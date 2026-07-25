/**
 * Video Recorder — Media Service
 *
 * Wraps all navigator.mediaDevices interactions.
 * React components never touch getUserMedia directly.
 */

import { MediaLogger, PermissionLogger } from './logger.service';
import type { BrowserCapabilities, RecorderDeviceInfo, RecorderError } from '../types/video-recorder.types';
import { MimeNegotiationOrder } from '../config/recorder.config';

/* ================================================================
   Device Enumeration
   ================================================================ */

export async function enumerateDevices(): Promise<{
  cameras: RecorderDeviceInfo[];
  microphones: RecorderDeviceInfo[];
  speakers: RecorderDeviceInfo[];
}> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    MediaLogger.warn('enumerateDevices not available');
    return { cameras: [], microphones: [], speakers: [] };
  }

  const devices = await navigator.mediaDevices.enumerateDevices();

  const cameras: RecorderDeviceInfo[] = [];
  const microphones: RecorderDeviceInfo[] = [];
  const speakers: RecorderDeviceInfo[] = [];

  for (const d of devices) {
    const info: RecorderDeviceInfo = {
      deviceId: d.deviceId,
      label: d.label,
      kind: d.kind as RecorderDeviceInfo['kind'],
      groupId: d.groupId,
    };

    if (d.kind === 'videoinput') cameras.push(info);
    else if (d.kind === 'audioinput') microphones.push(info);
    else if (d.kind === 'audiooutput') speakers.push(info);
  }

  MediaLogger.debug('Devices enumerated', {
    cameras: cameras.length,
    microphones: microphones.length,
    speakers: speakers.length,
  });

  return { cameras, microphones, speakers };
}

/* ================================================================
   Stream Management
   ================================================================ */

export async function getStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
  MediaLogger.info('Requesting stream', { constraints: JSON.parse(JSON.stringify(constraints)) });
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  MediaLogger.info('Stream acquired', {
    videoTracks: stream.getVideoTracks().length,
    audioTracks: stream.getAudioTracks().length,
  });
  return stream;
}

export function stopStream(stream: MediaStream | null): void {
  if (!stream) return;

  for (const track of stream.getTracks()) {
    track.stop();
    MediaLogger.debug('Track stopped', { kind: track.kind, label: track.label });
  }
}

/**
 * Hot-swap a single track on an active stream without restarting the recorder.
 * Returns the new stream with the replaced track.
 */
export async function switchDevice(
  currentStream: MediaStream,
  newDeviceId: string,
  kind: 'video' | 'audio',
): Promise<MediaStream> {
  const constraints: MediaStreamConstraints =
    kind === 'video'
      ? { video: { deviceId: { exact: newDeviceId } } }
      : { audio: { deviceId: { exact: newDeviceId } } };

  const newStream = await navigator.mediaDevices.getUserMedia(constraints);
  const [newTrack] = kind === 'video' ? newStream.getVideoTracks() : newStream.getAudioTracks();

  if (!newTrack) {
    throw new Error(`No ${kind} track obtained from device ${newDeviceId}`);
  }

  // Stop old track
  const oldTracks = kind === 'video' ? currentStream.getVideoTracks() : currentStream.getAudioTracks();
  for (const old of oldTracks) {
    currentStream.removeTrack(old);
    old.stop();
  }

  currentStream.addTrack(newTrack);
  MediaLogger.info(`${kind} device switched`, { newDeviceId });

  return currentStream;
}

/* ================================================================
   Device Change Listener
   ================================================================ */

export function onDeviceChange(callback: () => void): () => void {
  if (!navigator.mediaDevices) return () => {};

  navigator.mediaDevices.addEventListener('devicechange', callback);
  MediaLogger.debug('Device change listener attached');

  return () => {
    navigator.mediaDevices.removeEventListener('devicechange', callback);
    MediaLogger.debug('Device change listener removed');
  };
}

/* ================================================================
   Permissions
   ================================================================ */

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

export async function checkPermission(kind: 'camera' | 'microphone'): Promise<PermissionState> {
  try {
    if (!navigator.permissions?.query) return 'unknown';
    const result = await navigator.permissions.query({ name: kind as PermissionName });
    PermissionLogger.debug(`${kind} permission: ${result.state}`);
    return result.state as PermissionState;
  } catch {
    PermissionLogger.debug(`permissions.query not supported for ${kind}`);
    return 'unknown';
  }
}

/* ================================================================
   Browser Capabilities
   ================================================================ */

export function getCapabilities(): BrowserCapabilities {
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

  const caps: BrowserCapabilities = {
    supportsCamera: hasGetUserMedia,
    supportsMic: hasGetUserMedia,
    supportsMediaRecorder: hasMediaRecorder,
    supportsWebM,
    supportsMP4,
    supportsPause,
    supportsResume,
    supportsPictureInPicture: 'pictureInPictureEnabled' in document,
  };

  MediaLogger.debug('Browser capabilities', caps as unknown as Record<string, unknown>);
  return caps;
}

/* ================================================================
   MIME Negotiation
   ================================================================ */

export function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';

  for (const mime of MimeNegotiationOrder) {
    if (MediaRecorder.isTypeSupported(mime)) {
      MediaLogger.info('Selected MIME type', { mime });
      return mime;
    }
  }

  MediaLogger.warn('No preferred MIME type supported, using default');
  return '';
}

/* ================================================================
   Recording Support Check
   ================================================================ */

export function isRecordingSupported(): boolean {
  return !!(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined';
}

/* ================================================================
   Error Classification
   ================================================================ */

export function classifyMediaError(error: unknown): RecorderError {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return { type: 'permission_denied', message: 'Camera or microphone access was denied.', originalError: error };
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return { type: 'not_found', message: 'No camera or microphone found.', originalError: error };
      case 'NotSupportedError':
        return { type: 'not_supported', message: 'Recording is not supported in this browser.', originalError: error };
      case 'OverconstrainedError':
        return { type: 'overconstrained', message: 'The selected quality is not supported by your camera.', originalError: error };
      case 'AbortError':
        return { type: 'device_disconnected', message: 'Camera or microphone was disconnected.', originalError: error };
      default:
        return { type: 'unknown', message: error.message || 'An unknown error occurred.', originalError: error };
    }
  }

  if (error instanceof Error) {
    return { type: 'unknown', message: error.message, originalError: error };
  }

  return { type: 'unknown', message: 'An unknown error occurred.', originalError: error };
}
