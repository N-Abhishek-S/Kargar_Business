import React, { useEffect, useRef } from "react";
import { useMediaCapture } from "../capture-react";


export interface CameraPreviewProps {
  className?: string;
}

export const CameraPreview = React.forwardRef<HTMLVideoElement, CameraPreviewProps>(({ className }, forwardedRef) => {
  const { stream, state, facingMode, recordingState } = useMediaCapture();
  const internalRef = useRef<HTMLVideoElement>(null);
  
  const videoRef = (forwardedRef as React.RefObject<HTMLVideoElement | null> | null) ?? internalRef;

  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") {
            // Expected when stream is quickly replaced (e.g., flipping camera)
            return;
          }
          console.warn("[MediaSDK] Failed to auto-play video stream:", err);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream, videoRef]);

  // Strict Mirroring Rules: Front camera is mirrored in preview. Rear camera is not.
  const isMirrored = facingMode === "user";
  const isRecording = recordingState === "RECORDING";
  const isPaused = recordingState === "PAUSED";

  return (
    <div className={`relative overflow-hidden bg-black flex items-center justify-center ${className ?? ""}`}>
      {state === "OPENING" || state === "SWITCHING" ? (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm animate-pulse z-10">
          Loading camera...
        </div>
      ) : null}
      
      {state === "ERROR" ? (
        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm text-center p-4 z-10">
          Camera Error. Please check permissions.
        </div>
      ) : null}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-transform duration-200 ${
          isMirrored ? "scale-x-[-1]" : "scale-x-100"
        } ${state !== "READY" ? "opacity-0" : "opacity-100"}`}
      />
      
      {/* Subtle border overlay for a polished look */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none z-10" />

      {/* Recording/Paused state border */}
      {isRecording && !isPaused && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-inset ring-red-500/50 pointer-events-none z-10" />
      )}
      {isPaused && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-inset ring-amber-400/50 pointer-events-none z-10" />
      )}
    </div>
  );
});

CameraPreview.displayName = "CameraPreview";
