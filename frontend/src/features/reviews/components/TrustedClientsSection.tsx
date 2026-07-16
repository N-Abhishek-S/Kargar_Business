import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { RefreshCw, UsersRound } from 'lucide-react';
import { useClientLogos } from '@/features/reviews/hooks';
import { LogoGrid, LogoGridSkeleton, LogoMarquee } from '@/components/ui/logos';
import { usePrefersReducedMotion } from '@/components/ui/logos/hooks/usePrefersReducedMotion';

export function TrustedClientsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });
  const logosQuery = useClientLogos({ enabled: inView });
  const prefersReducedMotion = usePrefersReducedMotion();

  const { validLogos } = useMemo(() => {
    if (!logosQuery.data) return { validLogos: [] };

    const seenIds = new Set<string>();

    const filtered = logosQuery.data
      .map(logo => ({
        ...logo,
        companyName: logo.companyName.trim(),
        logoUrl: logo.logoUrl.trim(),
      }))
      .filter(logo => {
        // Validation rules per enterprise spec
        if (!logo.companyName) return false;
        if (!logo.logoUrl) return false;

        // Reject invalid URL schemes
        const lowerUrl = logo.logoUrl.toLowerCase();
        if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
          return false;
        }

        // Duplicate ID handling
        if (seenIds.has(logo.id)) {
          if (import.meta.env.DEV) {
            console.warn(`[Client Logos] Duplicate ID detected and filtered: ${logo.id}`);
          }
          return false;
        }
        
        seenIds.add(logo.id);
        return true;
      });
      
    return { validLogos: filtered };
  }, [logosQuery.data]);

  return (
    <section className="py-16 md:py-24 bg-white" aria-labelledby="trusted-clients-heading" ref={ref}>
      <div className="w-full max-w-[1320px] mx-auto px-6">
        <div className="text-center mb-10 md:mb-14">
          <p className="flex items-center justify-center gap-2 text-sm font-black text-orange-500 uppercase tracking-wide mb-3">
            <UsersRound size={18} aria-hidden="true" /> Trusted By
          </p>
          <h2 id="trusted-clients-heading" className="text-4xl md:text-5xl lg:text-[54px] font-black text-[#061736] mb-4 tracking-tight leading-none">
            500+ Businesses
          </h2>
          <p className="text-[#1d2d4d] max-w-2xl mx-auto text-[17px] leading-[1.8]">
            Trusted across real estate, healthcare, education, manufacturing, and corporate workplaces.
          </p>
        </div>

        <div className="w-full">
          {logosQuery.isLoading || !inView ? (
            <LogoGridSkeleton count={12} />
          ) : logosQuery.isError ? (
            <div className="w-full min-h-[110px] flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center" role="alert">
              <span className="text-slate-600 font-medium mb-3">Client logos could not be loaded.</span>
              <button 
                type="button" 
                onClick={() => { void logosQuery.refetch(); }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 text-sm font-semibold transition-colors"
              >
                <RefreshCw size={16} /> Retry
              </button>
            </div>
          ) : validLogos.length === 0 ? (
            <div className="w-full min-h-[110px] flex items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-slate-500 font-medium text-center">No client logos available.</span>
            </div>
          ) : prefersReducedMotion || validLogos.length < 5 ? (
            <LogoGrid logos={validLogos} />
          ) : (
            <LogoMarquee logos={validLogos} />
          )}
        </div>
      </div>
    </section>
  );
}
