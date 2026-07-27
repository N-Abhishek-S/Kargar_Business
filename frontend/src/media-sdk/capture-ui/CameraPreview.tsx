import React, { useEffect, useRef } from "react";
import { useMediaCapture } from "../capture-react";


export interface CameraPreviewProps {
  className?: string;
}

export const CameraPreview = React.forwardRef<HTMLVideoElement, CameraPreviewProps>(({ className }, forwardedRef) => {
  const { stream, state, facingMode } = useMediaCapture();
  const internalRef = useRef<HTMLVideoElement>(null);
  
  const videoRef = (forwardedRef as any) || internalRef;

  useEffect(() => {
    if (videoRef.current) {
      if (stream && state === "READY") {
        videoRef.current.srcObject = stream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream, state, videoRef]);

  // Strict Mirroring Rules: Front camera is mirrored in preview. Rear camera is not.
  const isMirrored = facingMode === "user";

  return (
    <div className={`relative overflow-hidden bg-black flex items-center justify-center ${className || ""}`}>
      {state === "OPENING" || state === "SWITCHING" ? (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm animate-pulse">
          Loading camera...
        </div>
      ) : null}
      
      {state === "ERROR" ? (
        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm text-center p-4">
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
    </div>
  );
});

CameraPreview.displayName = "CameraPreview";
