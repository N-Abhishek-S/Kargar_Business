import { useInView } from 'react-intersection-observer';
import CountUpModule from 'react-countup';
import { clsx } from 'clsx';

// Handle ESM/CJS interop: react-countup may export { default: Component } or Component directly
const CountUp = typeof CountUpModule === 'function' ? CountUpModule : (CountUpModule as unknown as { default: typeof CountUpModule }).default;
import { type ReactNode } from 'react';

export interface CounterProps {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label?: string;
  icon?: ReactNode;
  className?: string;
}

/**
 * Enterprise Counter Component
 * - Triggers animation only when in view
 * - Accessible aria labels
 * - Optional icon, prefix, suffix, and label
 */
export function Counter({
  end,
  start = 0,
  duration = 2.5,
  delay = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  label,
  icon,
  className,
}: CounterProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={clsx('flex flex-col items-center text-center', className)}>
      {icon && <div className="mb-4 text-orange-500">{icon}</div>}
      <div
        className="text-4xl font-bold tracking-tight text-navy-900 md:text-5xl lg:text-6xl"
        aria-label={`${end}${suffix} ${label ?? ''}`}
      >
        {inView ? (
          <CountUp
            start={start}
            end={end}
            duration={duration}
            delay={delay}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            useEasing={true}
            separator=","
          />
        ) : (
          <span>
            {prefix}0{suffix}
          </span>
        )}
      </div>
      {label && (
        <p className="mt-2 text-sm font-medium uppercase tracking-wider text-gray-500">
          {label}
        </p>
      )}
    </div>
  );
}
