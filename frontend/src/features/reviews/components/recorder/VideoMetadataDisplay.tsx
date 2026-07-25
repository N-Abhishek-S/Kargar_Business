/**
 * Video Metadata Display — Duration, resolution, size chips
 */

import { Clock, Monitor, HardDrive } from 'lucide-react';
import type { VideoMetadataDisplayProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';
import { formatRecordingTime, formatFileSize } from '../../utils/video-recorder.utils';

export function VideoMetadataDisplay({ metadata }: VideoMetadataDisplayProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {metadata.duration > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-xs text-gray-300">
          <Clock size={12} className="text-gray-500" />
          <span>{formatRecordingTime(metadata.duration)}</span>
        </div>
      )}
      {metadata.width > 0 && metadata.height > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-xs text-gray-300">
          <Monitor size={12} className="text-gray-500" />
          <span>{metadata.width}×{metadata.height}</span>
        </div>
      )}
      {metadata.size > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-xs text-gray-300">
          <HardDrive size={12} className="text-gray-500" />
          <span>{formatFileSize(metadata.size)}</span>
        </div>
      )}
    </div>
  );
}
