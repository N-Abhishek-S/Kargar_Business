import { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { clsx } from 'clsx';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Enterprise Empty State Component
 * - Used when lists, tables, or sections have no data to display
 * - Supports custom icons and action buttons
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm text-gray-400">
        {icon ?? <Inbox className="h-8 w-8" aria-hidden="true" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-navy-900">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
