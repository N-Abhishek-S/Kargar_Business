import { useState, useRef } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX } from 'lucide-react';
import { clsx } from 'clsx';

export interface ReviewVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

export function ReviewVideo({ src, poster, className, autoPlay = false }: ReviewVideoProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      } else {
        videoRef.current.requestFullscreen().catch(console.error);
      }
    }
  };

  return (
    <div 
      className={clsx("relative group overflow-hidden rounded-xl bg-black", className)}
      onMouseEnter={() => { setIsHovered(true); }}
      onMouseLeave={() => { setIsHovered(false); }}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={isMuted}
        playsInline
        loop
        className="w-full h-full object-contain cursor-pointer"
        onPlay={() => { setIsPlaying(true); }}
        onPause={() => { setIsPlaying(false); }}
      />
      
      {/* Overlay Controls */}
      <div className={clsx(
        "absolute inset-0 bg-black/40 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none",
        (isHovered || !isPlaying) ? "opacity-100" : "opacity-0"
      )}>
        {/* Center Play Button if paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              type="button"
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:bg-white/30 transition-colors"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pointer-events-auto">
          <button 
            type="button" 
            onClick={togglePlay}
            className="text-white hover:text-orange-400 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={toggleMute}
              className="text-white hover:text-orange-400 transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button 
              type="button" 
              onClick={toggleFullScreen}
              className="text-white hover:text-orange-400 transition-colors"
              aria-label="Full Screen"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
