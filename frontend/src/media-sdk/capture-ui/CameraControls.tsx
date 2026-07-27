import React from "react";
import { RefreshCw, X } from "lucide-react";

export interface CameraControlsProps {
  onCapture: () => void;
  onSwitch: () => void;
  onClose: () => void;
  canSwitch: boolean;
  disabled?: boolean;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onCapture,
  onSwitch,
  onClose,
  canSwitch,
  disabled = false,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent">
      <button
        type="button"
        onClick={onClose}
        disabled={disabled}
        aria-label="Close camera"
        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors disabled:opacity-50"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={onCapture}
        disabled={disabled}
        aria-label="Take photo"
        className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center relative group disabled:opacity-50"
      >
        <span className="w-12 h-12 bg-white rounded-full group-hover:scale-95 transition-transform" />
      </button>

      <button
        type="button"
        onClick={onSwitch}
        disabled={disabled || !canSwitch}
        aria-label="Switch camera"
        className={`p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors ${
          !canSwitch ? "opacity-0 pointer-events-none" : ""
        } disabled:opacity-50`}
      >
        <RefreshCw className="w-6 h-6" />
      </button>
    </div>
  );
};
