/**
 * Recording Controls — Loom-style bottom toolbar
 *
 * State-dependent controls: Record, Pause, Resume, Stop, Cancel.
 * Full keyboard accessibility (Space, Enter, Escape).
 */

import { useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { Circle, Square, Pause, Play, X } from 'lucide-react';
import type { RecordingControlsProps } from '../../types/video-recorder.types';
import { RecordingTimer } from './RecordingTimer';
import { RecorderLimits } from '../../config/recorder.config';
import { recorderStrings } from '../../i18n/recorder.i18n';
import '../../styles/video-recorder.css';

export function RecordingControls({
  state,
  onRecord,
  onPause,
  onResume,
  onStop,
  onCancel,
  elapsedSeconds,
}: RecordingControlsProps) {
  const isRecording = state === 'recording';
  const isPaused = state === 'paused';
  const isReady = state === 'ready';
  const isActive = isRecording || isPaused;

  /* ---- Keyboard shortcuts ---- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture when focus is in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isReady) onRecord();
        else if (isRecording) onPause();
        else if (isPaused) onResume();
      }

      if (e.code === 'Enter' && isActive) {
        e.preventDefault();
        onStop();
      }
    },
    [isReady, isRecording, isPaused, isActive, onRecord, onPause, onResume, onStop],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center gap-4 pt-4 recorder-bottom-controls">
      {/* Timer — visible during recording and paused */}
      {isActive && (
        <RecordingTimer
          elapsedSeconds={elapsedSeconds}
          maxSeconds={RecorderLimits.MAX_DURATION_SECONDS}
          isPaused={isPaused}
        />
      )}

      {/* Controls row */}
      <div className="flex items-center justify-center gap-4 recorder-controls-grid">
        {/* Cancel button — always visible */}
        <button
          type="button"
          onClick={onCancel}
          className={clsx(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium',
            'text-gray-400 hover:text-gray-200 hover:bg-white/10',
            'transition-all duration-200 recorder-focus-ring',
          )}
          aria-label={recorderStrings.cancel}
        >
          <X size={16} />
          <span className="hidden sm:inline">{recorderStrings.cancel}</span>
        </button>

        {/* Main Record / Pause / Resume button */}
        {isReady && (
          <button
            type="button"
            onClick={onRecord}
            className={clsx(
              'record-button-main relative flex items-center justify-center',
              'w-16 h-16 rounded-full',
              'bg-white border-4 border-red-500',
              'hover:bg-red-50 active:scale-95',
              'transition-all duration-200 recorder-focus-ring',
            )}
            aria-label={recorderStrings.record}
            title={`${recorderStrings.record} (Space)`}
          >
            <Circle size={24} className="text-red-500 fill-red-500" />
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-3">
            {/* Pause */}
            <button
              type="button"
              onClick={onPause}
              className={clsx(
                'flex items-center justify-center w-12 h-12 rounded-full',
                'bg-white/15 hover:bg-white/25 text-white',
                'transition-all duration-200 recorder-focus-ring',
              )}
              aria-label={recorderStrings.pause}
              title={`${recorderStrings.pause} (Space)`}
            >
              <Pause size={20} />
            </button>

            {/* Stop — large red pulsing button */}
            <button
              type="button"
              onClick={onStop}
              className={clsx(
                'record-button-main relative flex items-center justify-center',
                'w-16 h-16 rounded-full',
                'bg-red-500 record-button-pulse',
                'hover:bg-red-600 active:scale-95',
                'transition-all duration-200 recorder-focus-ring',
              )}
              aria-label={recorderStrings.stop}
              title={`${recorderStrings.stop} (Enter)`}
            >
              <Square size={20} className="text-white fill-white" />
            </button>
          </div>
        )}

        {isPaused && (
          <div className="flex items-center gap-3">
            {/* Resume */}
            <button
              type="button"
              onClick={onResume}
              className={clsx(
                'flex items-center justify-center w-12 h-12 rounded-full',
                'bg-white/15 hover:bg-white/25 text-white',
                'transition-all duration-200 recorder-focus-ring',
              )}
              aria-label={recorderStrings.resume}
              title={`${recorderStrings.resume} (Space)`}
            >
              <Play size={20} />
            </button>

            {/* Stop */}
            <button
              type="button"
              onClick={onStop}
              className={clsx(
                'record-button-main relative flex items-center justify-center',
                'w-16 h-16 rounded-full',
                'bg-red-500',
                'hover:bg-red-600 active:scale-95',
                'transition-all duration-200 recorder-focus-ring',
              )}
              aria-label={recorderStrings.stop}
              title={`${recorderStrings.stop} (Enter)`}
            >
              <Square size={20} className="text-white fill-white" />
            </button>
          </div>
        )}

        {/* Spacer to balance cancel button on the left */}
        <div className="w-20" aria-hidden="true" />
      </div>

      {/* Keyboard hints */}
      {isReady && (
        <p className="text-xs text-gray-500 select-none">
          Press <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-[10px]">Space</kbd> to record
        </p>
      )}
    </div>
  );
}
