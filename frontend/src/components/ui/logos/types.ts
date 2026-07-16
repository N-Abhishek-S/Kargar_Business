import type { ClientLogo } from '@/types';

export interface LogoMarqueeProps {
  logos: ClientLogo[];
  /** Maximum total logos to render across both rows */
  maxVisibleLogos?: number;
  /** Duration in seconds for a full cycle */
  duration?: number;
}

export interface LogoTrackProps {
  logos: ClientLogo[];
  direction?: 'left' | 'right';
  duration?: number;
}
