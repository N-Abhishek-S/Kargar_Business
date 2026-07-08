import { clsx } from 'clsx';
import { type HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
}

/**
 * Enterprise Skeleton Component
 * - Used to show loading placeholders that match content shape
 * - Uses CSS animation for the pulse effect
 */
export function Skeleton({ className, variant = 'rectangular', ...props }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200';
  
  const variants = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  return (
    <div
      className={clsx(baseStyles, variants[variant], className)}
      aria-hidden="true"
      {...props}
    />
  );
}
