import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'primary' | 'white' | 'navy';
}

/**
 * Enterprise Spinner Component
 * - Accessible loading indicator
 * - Multiple sizes and color variants
 */
export function Spinner({ size = 'md', className, variant = 'primary' }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const variants = {
    primary: 'text-orange-500',
    white: 'text-white',
    navy: 'text-navy-900',
  };

  return (
    <div role="status" className={clsx('inline-flex', className)}>
      <Loader2
        className={clsx('animate-spin', sizes[size], variants[variant])}
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
