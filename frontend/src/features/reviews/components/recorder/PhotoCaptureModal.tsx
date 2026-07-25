import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Zap, ZapOff, X, Image as ImageIcon } from 'lucide-react';

import { mediaSDK } from '../../media-sdk/MediaSDK';
import { mediaCamera } from '../../media-sdk/media-camera/MediaCamera';
import { capabilityService } from '../../media-sdk/core/capabilities/CapabilityService';

export interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (bitmap: ImageBitmap) => void;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync the class-level video element with our React DOM ref once it's mounted
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    if (isOpen && videoRef.current) {
      setIsReady(false);
      setError(null);
      
      const startCamera = async () => {
        try {
          // Initialize SDK (just ensures state is fresh)
          mediaSDK.initialize();
          
          activeStream = await mediaCamera.start({ facingMode });
          
          // Wire up the internal video element stream to our React video element
          if (videoRef.current) {
            videoRef.current.srcObject = activeStream;
            videoRef.current.play().catch(console.error);
          }
          setIsReady(true);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Camera access denied');
          setIsReady(false);
        }
      };

      void startCamera();
    }

    return () => {
      mediaCamera.stop();
      setIsReady(false);
      setFlashEnabled(false);
    };
  }, [isOpen, facingMode]);

  const handleCapture = async () => {
    if (!isReady) return;
    try {
      const bitmap = await mediaCamera.captureFrame();
      onCapture(bitmap);
      mediaCamera.stop();
      onClose();
    } catch (err: unknown) {
      console.error('Capture failed', err);
      setError('Failed to capture photo');
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const toggleFlash = async () => {
    if (!capabilityService.current.hasTorch) return;
    
    const nextFlash = !flashEnabled;
    const success = await mediaCamera.setTorch(nextFlash);
    if (success) {
      setFlashEnabled(nextFlash);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full h-full sm:h-auto sm:max-w-md bg-zinc-950 sm:rounded-3xl sm:border border-white/10 overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            {capabilityService.current.hasTorch && (
              <button 
                onClick={() => void toggleFlash()} 
                className={`p-2 rounded-full transition-colors ${flashEnabled ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {flashEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
              </button>
            )}
            
            <button onClick={toggleCamera} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder */}
        <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-center p-6 text-red-400">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
              />
              
              {/* Grid Overlay (Rule of Thirds) */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white" />
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white" />
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="p-8 bg-zinc-950 flex justify-center items-center gap-12">
          {/* Gallery placeholder (future) */}
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
             <ImageIcon className="w-5 h-5 text-white/50" />
          </div>

          {/* Capture Button */}
          <button 
            onClick={() => void handleCapture()}
            disabled={!isReady || !!error}
            className="relative group disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-white rounded-full blur group-hover:blur-md transition-all duration-300 opacity-50" />
            <div className="relative w-20 h-20 bg-white rounded-full border-[6px] border-zinc-950 shadow-[0_0_0_2px_rgba(255,255,255,0.3)] flex items-center justify-center transition-transform active:scale-95">
              <div className="w-16 h-16 rounded-full border border-zinc-200" />
            </div>
          </button>
          
          <div className="w-12 h-12" /> {/* Spacer for alignment */}
        </div>
      </div>
    </div>
  );
};
