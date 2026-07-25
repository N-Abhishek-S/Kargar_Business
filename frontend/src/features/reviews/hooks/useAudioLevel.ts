/**
 * useAudioLevel — Real-time audio level meter
 *
 * Uses AudioContext + AnalyserNode to read frequency data from a MediaStream.
 * Returns normalized level (0–1) and silence detection.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { RecorderLimits } from '../config/recorder.config';
import type { UseAudioLevelReturn } from '../types/video-recorder.types';

export function useAudioLevel(stream: MediaStream | null): UseAudioLevelReturn {
  const [level, setLevel] = useState(0);
  const [isSilent, setIsSilent] = useState(false);
  const [silenceDurationMs, setSilenceDurationMs] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const silenceStartRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const cleanup = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      void audioContextRef.current.close();
    }
    audioContextRef.current = null;
    dataArrayRef.current = null;
  }, []);

  useEffect(() => {
    if (!stream) {
      cleanup();
      requestAnimationFrame(() => {
        setLevel(0);
        setIsSilent(false);
        setSilenceDurationMs(0);
      });
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      requestAnimationFrame(() => {
        setIsSilent(true);
      });
      return;
    }

    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      silenceStartRef.current = 0;

      const tick = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        // Calculate RMS level
        let sum = 0;
        for (const value of dataArrayRef.current) {
          sum += value * value;
        }
        const rms = Math.sqrt(sum / dataArrayRef.current.length);
        const normalized = Math.min(rms / 128, 1); // 0–1

        setLevel(normalized);

        // Silence detection
        const now = Date.now();
        const silenceThreshold = 0.02;

        if (normalized < silenceThreshold) {
          if (silenceStartRef.current === 0) {
            silenceStartRef.current = now;
          }
          const elapsed = now - silenceStartRef.current;
          setSilenceDurationMs(elapsed);
          setIsSilent(elapsed >= RecorderLimits.SILENCE_THRESHOLD_SECONDS * 1000);
        } else {
          silenceStartRef.current = 0;
          setSilenceDurationMs(0);
          setIsSilent(false);
        }

        animFrameRef.current = requestAnimationFrame(tick);
      };

      animFrameRef.current = requestAnimationFrame(tick);
    } catch {
      // AudioContext not available
      requestAnimationFrame(() => {
        setIsSilent(false);
      });
    }

    return cleanup;
  }, [stream, cleanup]);

  return { level, isSilent, silenceDurationMs };
}
