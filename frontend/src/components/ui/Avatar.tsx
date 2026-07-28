import { useState, type ImgHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackInitials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Enterprise Avatar Component
 * - Supports image loading and error states
 * - Elegant gradient fallback for missing/errored images
 */
export function Avatar({ src, alt, fallbackInitials, size = 'md', className, ...props }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-24 h-24 text-xl',
  };

  const showImage = src && !hasError;

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full font-semibold',
        !showImage && 'bg-gradient-to-br from-navy-600 to-orange-500 text-white',
        sizeClasses[size],
        className
      )}
    >
      {showImage ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200" aria-hidden="true" />
          )}
          <img
            src={src}
            alt={alt ?? fallbackInitials}
            loading={props.loading ?? "eager"}
            decoding="async"
            className={clsx(
              'h-full w-full object-contain transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => { setIsLoaded(true); }}
            onError={(e) => {
              console.error('Avatar image failed to load:', src, e);
              setHasError(true);
            }}
            {...props}
          />
        </>
      ) : (
        <span>{fallbackInitials}</span>
      )}
    </div>
  );
}
