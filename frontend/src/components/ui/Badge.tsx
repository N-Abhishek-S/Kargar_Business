import { clsx, type ClassValue } from 'clsx';
import { type HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'info';
}

/**
 * Enterprise Badge Component
 * - Used for status indicators, tags, or small labels
 * - Multiple semantic variants
 */
export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-navy-950 focus:ring-offset-2';
  
  const variants: Record<NonNullable<BadgeProps['variant']>, ClassValue> = {
    default: 'bg-navy-100 text-navy-800 hover:bg-navy-200',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-info-100 text-info-800',
    outline: 'border border-gray-200 text-gray-800',
  };

  return (
    <div className={clsx(baseStyles, variants[variant], className)} {...props} />
  );
}
