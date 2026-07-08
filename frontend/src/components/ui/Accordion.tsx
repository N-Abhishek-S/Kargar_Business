import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface AccordionItemProps {
  title: string;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  icon?: ReactNode;
}

export function AccordionItem({
  title,
  children,
  isOpen = false,
  onToggle,
  className,
  icon,
}: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(0);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  // Handle window resize to recalculate height if open
  useEffect(() => {
    const handleResize = () => {
      if (isOpen && contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); };
  }, [isOpen]);

  return (
    <div className={clsx('border-b border-gray-200 last:border-0', className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left font-medium text-navy-900 transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-sm"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          {icon && <span className="text-orange-500">{icon}</span>}
          {title}
        </span>
        <ChevronDown
          className={clsx(
            'h-5 w-5 shrink-0 text-gray-500 transition-transform duration-300',
            isOpen && 'rotate-180 text-orange-500',
          )}
          aria-hidden="true"
        />
      </button>
      <div
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
        style={{ height }}
      >
        <div ref={contentRef} className="pb-4 pt-1 text-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface AccordionProps {
  items: Omit<AccordionItemProps, 'isOpen' | 'onToggle'>[];
  allowMultiple?: boolean;
  className?: string;
}

/**
 * Enterprise Accordion Component
 * - Smooth height transitions
 * - Accessible disclosure pattern
 * - Supports single or multiple open items
 */
export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const handleToggle = (index: number) => {
    setOpenIndexes((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      if (allowMultiple) {
        return [...prev, index];
      }
      return [index];
    });
  };

  return (
    <div className={clsx('divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-4 shadow-sm', className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          {...item}
          isOpen={openIndexes.includes(index)}
          onToggle={() => { handleToggle(index); }}
        />
      ))}
    </div>
  );
}
