import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Zap, ZapOff, X, Image as ImageIcon, Loader2 } from 'lucide-react';

import { mediaSDK } from '../../media-sdk/MediaSDK';
import { mediaCamera } from '../../media-sdk/media-camera/MediaCamera';
import { capabilityService } from '../../media-sdk/core/capabilities/CapabilityService';

const PREFS_KEY = 'kargar_camera_prefs';

interface CameraPrefs {
  preferredFacingMode: 'user' | 'environment';
  lastDeviceId: string | null;
  label: string | null;
  timestamp: number;
}

// Read preferences safely
const getStoredPrefs = (): CameraPrefs => {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, unknown>;
      if (typeof parsed.preferredFacingMode === 'string') {
        return parsed as unknown as CameraPrefs;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return {
    preferredFacingMode: 'environment',
    lastDeviceId: null,
    label: null,
    timestamp: Date.now()
  };
};

const savePrefs = (prefs: Partial<CameraPrefs>) => {
  const current = getStoredPrefs();
  const updated = { ...current, ...prefs, timestamp: Date.now() };
  localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
};

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
  
  // UI State
  const [isReady, setIsReady] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Camera State
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  const [cameraLabel, setCameraLabel] = useState<string>('Rear Camera');
  const [isMirrored, setIsMirrored] = useState(false);

  // Determine if stream should be mirrored
  const checkMirroring = useCallback((deviceId?: string) => {
    const settings = mediaCamera.getActiveTrackSettings();
    const caps = mediaCamera.getActiveTrackCapabilities();
    const prefs = getStoredPrefs();
    
    let shouldMirror = false;
    
    if (settings?.facingMode) {
      shouldMirror = settings.facingMode === 'user';
    } else if (caps?.facingMode?.includes('user')) {
      shouldMirror = true;
    } else if (prefs.preferredFacingMode === 'user') {
      shouldMirror = true;
    } else {
      // Label fallback
      const activeDevice = cameras.find(c => c.deviceId === deviceId);
      if (activeDevice?.label.toLowerCase().includes('front')) {
        shouldMirror = true;
      }
    }
    
    setIsMirrored(shouldMirror);
  }, [cameras]);

  // Start a specific camera
  const startCamera = useCallback(async (deviceId?: string, fallbackMode?: 'user' | 'environment') => {
    setIsSwitching(true);
    setError(null);
    try {
      mediaSDK.initialize();
      const stream = await mediaCamera.start({ 
        deviceId, 
        facingMode: fallbackMode 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(console.error);
      }
      
      // Once stream is running, we can read actual device labels
      const available = await capabilityService.getAvailableCameras();
      setCameras(available);
      
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings() ?? {};
      const currentDeviceId = settings.deviceId ?? deviceId;
      
      setActiveDeviceId(currentDeviceId);
      
      // Update label
      let currentLabel = 'Camera';
      if (settings.facingMode === 'environment') currentLabel = 'Rear Camera';
      else if (settings.facingMode === 'user') currentLabel = 'Front Camera';
      
      const matchedDevice = available.find(d => d.deviceId === currentDeviceId);
      if (matchedDevice?.label) {
        currentLabel = matchedDevice.label;
      }
      setCameraLabel(currentLabel);
      
      savePrefs({
        lastDeviceId: currentDeviceId,
        preferredFacingMode: (settings.facingMode as 'user' | 'environment' | undefined) ?? 'environment',
        label: currentLabel
      });

      checkMirroring(currentDeviceId);
      setIsReady(true);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access denied';
      console.error(msg);
      setError(msg);
      setIsReady(false);
      return false;
    } finally {
      setIsSwitching(false);
    }
  }, [checkMirroring]);

  // Initial mount setup
  useEffect(() => {
    if (isOpen) {
      const init = async () => {
        // Push to microtask queue to avoid synchronous setState in effect
        await Promise.resolve();
        const prefs = getStoredPrefs();
        void startCamera(prefs.lastDeviceId ?? undefined, prefs.preferredFacingMode);
      };
      void init();
    }

    return () => {
      mediaCamera.stop();
      setIsReady(false);
      setFlashEnabled(false);
      setIsSwitching(false);
    };
  }, [isOpen, startCamera]);

  const handleCapture = async () => {
    if (!isReady || isSwitching) return;
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

  const handleFlipCamera = async () => {
    if (isSwitching) return;
    
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(c => c.deviceId === activeDeviceId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCamera = cameras[nextIndex];
      
      if (nextCamera) {
        // Attempt switch with recovery
        const previousDeviceId = activeDeviceId;
        const success = await startCamera(nextCamera.deviceId);
        
        if (!success && previousDeviceId) {
          setError('Selected camera unavailable. Reverting...');
          await startCamera(previousDeviceId);
        }
        return;
      }
    }
    
    // Fallback if device enumeration fails (e.g. Safari strict mode) or only 1 camera reported
    const prefs = getStoredPrefs();
    const nextMode = prefs.preferredFacingMode === 'user' ? 'environment' : 'user';
    savePrefs({ preferredFacingMode: nextMode });
    await startCamera(undefined, nextMode);
  };

  const toggleFlash = async () => {
    if (!capabilityService.current.hasTorch) return;
    const nextFlash = !flashEnabled;
    if (await mediaCamera.setTorch(nextFlash)) {
      setFlashEnabled(nextFlash);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full h-full sm:h-auto sm:max-w-md bg-zinc-950 sm:rounded-3xl sm:border border-white/10 overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-linear-to-b from-black/60 to-transparent">
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          {/* Active Camera Indicator */}
          <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/90 text-xs font-medium flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            {cameraLabel}
          </div>
          
          <div className="flex gap-2">
            {capabilityService.current.hasTorch && (
              <button 
                onClick={() => void toggleFlash()} 
                className={`p-2 rounded-full transition-colors ${flashEnabled ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {flashEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
              </button>
            )}
            
            <button 
              onClick={() => void handleFlipCamera()} 
              disabled={isSwitching}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Switch Camera"
            >
              <RefreshCw className={`w-5 h-5 ${isSwitching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Viewfinder */}
        <div 
          className="relative grow bg-black flex items-center justify-center overflow-hidden"
          onDoubleClick={() => void handleFlipCamera()}
        >
          {error ? (
            <div className="text-center p-6 text-red-400 z-10">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : null}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'} ${isMirrored ? 'scale-x-[-1]' : ''}`}
          />
          
          {/* Switching Overlay */}
          {isSwitching && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-white/90">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-white/70" />
              <p className="text-sm font-medium tracking-wide">Switching Camera...</p>
            </div>
          )}
          
          {/* Grid Overlay (Rule of Thirds) */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white" />
          </div>
        </div>

        {/* Controls */}
        <div className="p-8 bg-zinc-950 flex justify-center items-center gap-12 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
             <ImageIcon className="w-5 h-5 text-white/50" />
          </div>

          <button 
            onClick={() => void handleCapture()}
            disabled={!isReady || isSwitching || !!error}
            className="relative group disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-white rounded-full blur group-hover:blur-md transition-all duration-300 opacity-50" />
            <div className="relative w-20 h-20 bg-white rounded-full border-[6px] border-zinc-950 shadow-[0_0_0_2px_rgba(255,255,255,0.3)] flex items-center justify-center transition-transform active:scale-95">
              <div className="w-16 h-16 rounded-full border border-zinc-200" />
            </div>
          </button>
          
          <div className="w-12 h-12" />
        </div>
      </div>
    </div>
  );
};
