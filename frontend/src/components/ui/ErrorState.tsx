import { type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  icon?: ReactNode;
}

/**
 * Enterprise Error State Component
 * - Used for failed API queries, error boundaries, or invalid states
 * - Provides a clear retry action
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while trying to process your request. Please try again.',
  onRetry,
  className,
  icon,
}: ErrorStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 p-8 text-center',
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        {icon ?? <AlertTriangle className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-red-900">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Try Again
        </Button>
      )}
    </div>
  );
}
