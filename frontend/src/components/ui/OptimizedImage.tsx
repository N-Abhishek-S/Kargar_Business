import { memo, useState, useCallback } from 'react';
import type { ImageConfig } from '@/types';
import { FALLBACK_IMAGE, BLUR_PLACEHOLDER } from '@/config/images';
import { clsx } from 'clsx';

interface OptimizedImageProps extends Partial<ImageConfig> {
  /** Image source URL (required) */
  src: string;
  /** Descriptive alt text for accessibility (required) */
  alt: string;
  /** Additional CSS classes */
  className?: string;
  /** Container wrapper classes */
  containerClassName?: string;
  /** Whether to show blur-up loading effect */
  showBlur?: boolean;
  /** Object-fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Whether the image is decorative (sets alt="" and aria-hidden) */
  decorative?: boolean;
}

/**
 * Optimized image component with enterprise-level features:
 * - Lazy loading via native `loading="lazy"` (or eager for priority images)
 * - Blur-up placeholder animation during load
 * - Graceful fallback on load errors
 * - Responsive sizes via `sizes` attribute
 * - Accessibility: alt text or aria-hidden for decorative images
 * - CMS-ready: works with both local paths and remote URLs
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   alt="Modern office facility"
 *   width={1920}
 *   height={1080}
 *   priority
 * />
 * ```
 */
function OptimizedImageBase({
  src,
  alt,
  width,
  height,
  blurDataUrl = BLUR_PLACEHOLDER,
  fallback = FALLBACK_IMAGE,
  sizes,
  priority = false,
  className,
  containerClassName,
  showBlur = true,
  objectFit = 'cover',
  decorative = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const imgSrc = hasError ? fallback : src;

  return (
    <div
      className={clsx('relative overflow-hidden', containerClassName)}
      style={width && height ? { aspectRatio: `${width}/${height}` } : undefined}
    >
      {/* Blur placeholder */}
      {showBlur && !isLoaded && (
        <img
          src={blurDataUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg"
          style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
        />
      )}

      {/* Main image */}
      <img
        src={imgSrc}
        alt={decorative ? '' : alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        onLoad={handleLoad}
        onError={handleError}
        aria-hidden={decorative ? true : undefined}
        className={clsx(
          'transition-opacity',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        style={{
          objectFit,
          transitionDuration: '500ms',
        }}
      />
    </div>
  );
}

export const OptimizedImage = memo(OptimizedImageBase);
