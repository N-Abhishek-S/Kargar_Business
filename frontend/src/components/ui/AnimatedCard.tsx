import { type ReactNode } from 'react';
import { clsx } from 'clsx';

export interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /**
   * We will attach GSAP data attributes here for Phase 6.
   * For now, it provides hover styles.
   */
}

/**
 * Enterprise Animated Card Component
 * - Standardized card structure with built-in 3D hover effect (via CSS for performance)
 * - Pre-configured with data attributes for GSAP scroll reveal in Phase 6
 */
export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  return (
    <div
      data-gsap-reveal="fade-up" // Phase 6 hook will target this
      data-gsap-delay={delay}
      className={clsx(
        'group relative rounded-xl border border-gray-100 bg-white shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover overflow-hidden',
        className,
      )}
    >
      {children}
      
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-all duration-1000 group-hover:animate-shine" />
    </div>
  );
}
