import { useMemo, type SyntheticEvent } from 'react';
import { useInView } from 'react-intersection-observer';

import { A11y, Autoplay, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { RefreshCw, UsersRound } from 'lucide-react';
import { useClientLogos } from '@/features/reviews/hooks';
import type { ClientLogo } from '@/types';

function ClientLogoSkeleton() {
  return <span className="kb-client-logo-skeleton" aria-hidden="true" />;
}

function classifyLogoShape(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  const ratio = image.naturalWidth / image.naturalHeight;
  const card = image.closest<HTMLElement>('.kb-client-logo-card');

  if (!Number.isFinite(ratio) || !card) return;

  if (ratio >= 3.2) {
    card.dataset.logoShape = 'ultrawide';
  } else if (ratio >= 1.55) {
    card.dataset.logoShape = 'wide';
  } else if (ratio <= 0.72) {
    card.dataset.logoShape = 'tall';
  } else if (ratio <= 1.15) {
    card.dataset.logoShape = 'square';
  } else {
    card.dataset.logoShape = 'balanced';
  }
}

interface ClientLogoCardProps {
  logo: ClientLogo;
  priority?: boolean;
}

function ClientLogoCard({ logo, priority = false }: ClientLogoCardProps) {
  const image = (
    <img
      src={logo.logoUrl}
      alt={logo.altText}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      width={260}
      height={130}
      className="grayscale hover:grayscale-0 transition-all duration-300 ease-in-out w-full h-full object-contain"
      onLoad={classifyLogoShape}
    />
  );

  if (logo.website) {
    return (
      <a
        className="kb-client-logo-card"
        href={logo.website}
        target="_blank"
        rel="noreferrer"
        data-logo-shape="balanced"
        aria-label={`Visit ${logo.companyName} website`}
      >
        <span className="kb-client-logo-card__inner">{image}</span>
      </a>
    );
  }

  return (
    <div
      className="kb-client-logo-card"
      data-logo-shape="balanced"
      aria-label={logo.companyName}
    >
      <span className="kb-client-logo-card__inner">{image}</span>
    </div>
  );
}



function ClientCarousel({ logos }: { logos: ClientLogo[] }) {
  return (
    <Swiper
      modules={[A11y, Autoplay, Keyboard]}
      slidesPerView={1.18}
      centeredSlides={false}
      spaceBetween={18}
      loop={true}
      grabCursor
      keyboard={{ enabled: true }}
      speed={3000}
      autoplay={{
        delay: 0,
        disableOnInteraction: false,
      }}
      lazyPreloadPrevNext={2}
      breakpoints={{
        520: { slidesPerView: 2, spaceBetween: 20 },
        780: { slidesPerView: 3, spaceBetween: 24 },
        1120: { slidesPerView: 4, spaceBetween: 28 },
        1380: { slidesPerView: 5, spaceBetween: 30 },
      }}
      className="kb-client-logo-swiper !ease-linear"
      style={{ '--swiper-wrapper-transition-timing-function': 'linear' } as React.CSSProperties}
      aria-label="Trusted client logos"
    >
      {logos.map((logo, index) => (
        <SwiperSlide key={logo.id}>
          <ClientLogoCard logo={logo} priority={index < 5} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function TrustedClientsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });
  const logosQuery = useClientLogos({ enabled: inView });
  const logos = useMemo(() => logosQuery.data ?? [], [logosQuery.data]);

  return (
    <section className="kb-client-carousel" aria-labelledby="trusted-clients-heading" ref={ref}>
      <div className="kb-container kb-client-carousel__head">
        <div>
          <p><UsersRound size={18} aria-hidden="true" /> Trusted By</p>
          <h2 id="trusted-clients-heading">500+ Businesses</h2>
          <span>Trusted across real estate, healthcare, education, manufacturing, and corporate workplaces.</span>
        </div>
      </div>

      <div className="kb-client-carousel__frame">
        {logosQuery.isLoading || !inView ? (
          <div className="kb-client-carousel__skeletons">
            {Array.from({ length: 6 }, (_, index) => (
              <ClientLogoSkeleton key={index} />
            ))}
          </div>
        ) : logosQuery.isError ? (
          <div className="kb-client-carousel__state" role="alert">
            <span>Client logos could not be loaded.</span>
            <button type="button" onClick={() => { void logosQuery.refetch(); }}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : logos.length === 0 ? (
          <div className="kb-client-carousel__state">
            <span>Client logos will appear here after they are added in Supabase.</span>
          </div>
        ) : (
          <>
            <div className="kb-client-carousel__viewport">
              <ClientCarousel logos={logos} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
