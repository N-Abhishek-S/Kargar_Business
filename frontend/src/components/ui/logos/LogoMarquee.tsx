import { useLogoDistribution } from './hooks/useLogoDistribution';
import { LogoTrack } from './LogoTrack';
import { LogoGrid } from './LogoGrid';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { MARQUEE_DEFAULTS } from './constants';
import type { LogoMarqueeProps } from './types';

export function LogoMarquee({ 
  logos, 
  maxVisibleLogos = MARQUEE_DEFAULTS.maxVisibleLogos,
  duration = MARQUEE_DEFAULTS.duration 
}: LogoMarqueeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { row1, row2, isMarqueeEligible } = useLogoDistribution(logos, maxVisibleLogos);

  if (logos.length === 0) {
    return (
      <div className="w-full min-h-[110px] flex items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-2xl">
        <span className="text-slate-500 font-medium text-center">Trusted client logos will appear here.</span>
      </div>
    );
  }

  // Fallback to static grid if reduced motion is preferred or if there aren't enough logos to justify a marquee.
  if (prefersReducedMotion || !isMarqueeEligible) {
    return <LogoGrid logos={logos.slice(0, maxVisibleLogos)} />;
  }

  return (
    <div className="w-full flex flex-col gap-4 md:gap-5 lg:gap-6 overflow-hidden py-4">
      {row1.length > 0 && (
        <LogoTrack logos={row1} direction="left" duration={duration} />
      )}
      {row2.length > 0 && (
        <LogoTrack logos={row2} direction="right" duration={duration * 1.15} />
      )}
    </div>
  );
}
