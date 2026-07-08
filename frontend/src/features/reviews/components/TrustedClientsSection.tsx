import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type SwiperCore from 'swiper';
import { A11y, Autoplay, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useClientLogos } from '@/features/reviews/hooks';

function ClientLogoSkeleton() {
  return <span className="kb-client-logo-skeleton" aria-hidden="true" />;
}

export function TrustedClientsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });
  const logosQuery = useClientLogos({ enabled: inView });
  const [swiper, setSwiper] = useState<SwiperCore | null>(null);
  const logos = logosQuery.data ?? [];

  return (
    <section className="kb-client-carousel" aria-labelledby="trusted-clients-heading" ref={ref}>
      <div className="kb-container kb-client-carousel__head">
        <div>
          <p>Trusted By</p>
          <h2 id="trusted-clients-heading">500+ Businesses</h2>
        </div>
        <div className="kb-client-carousel__controls">
          <button type="button" aria-label="Previous client logo" onClick={() => swiper?.slidePrev()}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" aria-label="Next client logo" onClick={() => swiper?.slideNext()}>
            <ChevronRight size={20} />
          </button>
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
          <Swiper
            modules={[A11y, Autoplay, Keyboard]}
            onSwiper={setSwiper}
            slidesPerView={2}
            spaceBetween={18}
            loop={logos.length > 4}
            grabCursor
            keyboard={{ enabled: true }}
            autoplay={{
              delay: 2200,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              520: { slidesPerView: 3 },
              760: { slidesPerView: 4 },
              1080: { slidesPerView: 6 },
              1440: { slidesPerView: 7 },
            }}
            className="kb-client-logo-swiper"
          >
            {logos.map((logo) => {
              const image = (
                <img
                  src={logo.logoUrl}
                  alt={logo.altText}
                  loading="lazy"
                  decoding="async"
                  width={150}
                  height={60}
                />
              );

              return (
                <SwiperSlide key={logo.id}>
                  <div className="kb-client-logo-tile">
                    {logo.website ? (
                      <a href={logo.website} target="_blank" rel="noreferrer" aria-label={`${logo.companyName} website`}>
                        {image}
                      </a>
                    ) : (
                      image
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </section>
  );
}
