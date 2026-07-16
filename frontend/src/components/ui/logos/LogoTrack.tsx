
import type { LogoTrackProps } from './types';
import { MARQUEE_DEFAULTS } from './constants';
import { LogoCard } from './LogoCard';
import { LogoImage } from './LogoImage';
import './styles/logo-marquee.css';

export function LogoTrack({ logos, direction = 'left', duration = MARQUEE_DEFAULTS.duration }: LogoTrackProps) {
  const trackClass = direction === 'left' ? 'logo-marquee-track' : 'logo-marquee-track-reverse';
  
  // Custom style to allow React to override the CSS variable for duration
  const style = {
    '--marquee-duration': `${duration}s`,
  } as React.CSSProperties;

  const renderLogos = (isClone: boolean) => (
    logos.map((logo) => {
      // Use stable unique keys. Clones get a -clone suffix.
      const key = isClone ? `${logo.id}-clone` : logo.id;
      return (
        <div key={key} className="flex-none w-[200px] md:w-[240px] lg:w-[280px]">
          <LogoCard href={logo.website} label={logo.companyName}>
            <LogoImage 
              src={logo.logoUrl} 
              alt={logo.altText || `${logo.companyName} Logo`}
              fallbackText={logo.companyName}
            />
          </LogoCard>
        </div>
      );
    })
  );

  return (
    <div className="logo-marquee-container" style={style}>
      {/* Original set */}
      <div className={trackClass}>
        {renderLogos(false)}
      </div>
      {/* Duplicated set for seamless infinite loop */}
      <div className={trackClass} aria-hidden="true">
        {renderLogos(true)}
      </div>
    </div>
  );
}
