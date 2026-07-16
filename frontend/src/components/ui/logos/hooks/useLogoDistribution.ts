import { useMemo } from 'react';
import type { ClientLogo } from '@/types';
import { MARQUEE_DEFAULTS } from '../constants';

interface LogoDistributionResult {
  row1: ClientLogo[];
  row2: ClientLogo[];
  isMarqueeEligible: boolean;
}

export function useLogoDistribution(
  logos: ClientLogo[],
  maxVisibleLogos: number = MARQUEE_DEFAULTS.maxVisibleLogos
): LogoDistributionResult {
  return useMemo(() => {
    // 1. Cap dataset to prevent excessive DOM rendering
    const cappedLogos = logos.slice(0, maxVisibleLogos);
    
    // 2. Check if we have enough logos to justify a marquee
    const isMarqueeEligible = cappedLogos.length >= MARQUEE_DEFAULTS.minLogosForMarquee;

    // 3. Deterministic Alternating Distribution
    // Row 1 gets evens (0, 2, 4...), Row 2 gets odds (1, 3, 5...)
    const row1: ClientLogo[] = [];
    const row2: ClientLogo[] = [];

    cappedLogos.forEach((logo, index) => {
      if (index % 2 === 0) {
        row1.push(logo);
      } else {
        row2.push(logo);
      }
    });

    return { row1, row2, isMarqueeEligible };
  }, [logos, maxVisibleLogos]);
}
