import type { ClientLogo } from '@/types';
import { LogoCard } from './LogoCard';
import { LogoImage } from './LogoImage';

interface LogoGridProps {
  logos: ClientLogo[];
}

export function LogoGrid({ logos }: LogoGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 lg:gap-6 w-full min-w-0">
      {logos.map((logo) => (
        <LogoCard key={logo.id} href={logo.website} label={logo.companyName}>
          <LogoImage 
            src={logo.logoUrl} 
            alt={logo.altText || `${logo.companyName} Logo`}
            fallbackText={logo.companyName}
          />
        </LogoCard>
      ))}
    </div>
  );
}

export function LogoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 lg:gap-6 w-full min-w-0">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="w-full h-[80px] md:h-[95px] lg:h-[110px] rounded-xl md:rounded-2xl bg-slate-100 animate-pulse"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
