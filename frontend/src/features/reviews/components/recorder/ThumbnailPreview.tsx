/**
 * Thumbnail Preview — Shows auto-generated video thumbnail
 */

import type { ThumbnailPreviewProps } from '../../types/video-recorder.types';

export function ThumbnailPreview({ thumbnailUrl }: ThumbnailPreviewProps) {
  return (
    <div className="relative w-20 h-14 rounded-lg overflow-hidden ring-1 ring-white/10 flex-shrink-0 thumbnail-hover">
      <img
        src={thumbnailUrl}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.8">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </div>
    </div>
  );
}
