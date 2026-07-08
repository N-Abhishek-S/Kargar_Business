import { type TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Enterprise Textarea Component
 * - Integrated label, error message, and helper text
 * - Auto-resize capable (with external logic if needed)
 * - Accessible IDs and aria attributes
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id: providedId, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const hasError = !!error;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium leading-none text-navy-900">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            id={id}
            ref={ref}
            rows={rows}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            className={clsx(
              'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
              hasError
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'border-gray-300 focus-visible:border-orange-500 focus-visible:ring-orange-500/20',
              hasError && 'pr-10',
              className,
            )}
            {...props}
          />
          {hasError && (
            <div className="pointer-events-none absolute right-3 top-3 text-red-500">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            </div>
          )}
        </div>
        {hasError ? (
          <p id={errorId} className="text-sm font-medium text-red-500">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-sm text-gray-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
