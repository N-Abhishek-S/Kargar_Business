/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { memo } from 'react';
import { Link } from 'react-router';
import { Container } from '@/components/ui/Container';
import { Button, buttonVariants } from '@/components/ui/Button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Breadcrumb } from './Breadcrumb';
import { useContactNavigation } from '../hooks/useContactNavigation';
import { useDocument } from '../../../shared/hooks/useDocument';
import { serviceImages } from '../config/images';
import type { ServiceBlockProps } from '../registry/BlockRenderer';
import type { Service } from '../domain/service.types';

export const HeroSection = memo(function HeroSection({ entity, block }: ServiceBlockProps) {
  const image = serviceImages[entity.imageKey] ?? serviceImages.hardServices;
  const { navigateToContact, buildContactUrl } = useContactNavigation();
  const { doc, isDownloading, handleDownload } = useDocument('brochure', {
    page: typeof window !== 'undefined' ? window.location.pathname : '',
    ctaPosition: 'hero',
    service: entity.title
  });
  
  const isService = 'categoryId' in entity;
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
  ];

  if (isService) {
    const service = entity as Service;
    breadcrumbs.push({ 
      label: service.categoryId === 'hard' ? 'Hard Services' : 'Soft Services', 
      href: `/services/${service.categoryId}-services` 
    });
    breadcrumbs.push({ label: service.title, href: '#' });
  } else {
    breadcrumbs.push({ label: entity.title, href: '#' });
  }

  const title = entity.marketing?.headline ?? entity.title;
  const subtitle = entity.marketing?.summary ?? ('shortDescription' in entity ? (entity as unknown as { shortDescription: string }).shortDescription : '');
  const ctaText = entity.marketing?.ctaText ?? 'Request Proposal';
  
  const serviceType = isService ? (entity as Service).serviceType : 'technical';
  const variant = block.variant || `hero${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}`;

  // Example variants (Technical vs Cleaning vs Security)
  const renderRightContent = () => {
    if (variant === 'heroCleaning') {
      return (
        <div className="hidden lg:flex flex-col gap-4 flex-1 items-end pt-12">
           <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl w-80">
            <h3 className="text-white font-bold text-2xl mb-2 flex items-center gap-2">
              <span className="text-green-400">✓</span> Eco-Friendly
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">Using sustainable, non-toxic cleaning agents for a safer workspace.</p>
          </div>
        </div>
      );
    }
    if (variant === 'heroSecurity') {
      return (
        <div className="hidden lg:flex flex-col gap-4 flex-1 items-end pt-12">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl w-80 text-center">
             <div className="mx-auto bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-blue-400/30">
                <span className="text-blue-400 text-2xl">🛡️</span>
             </div>
            <h3 className="text-white font-bold text-xl mb-1">24/7 Protection</h3>
            <p className="text-gray-300 text-sm">Rapid response security personnel.</p>
          </div>
        </div>
      );
    }
    
    // Default / Technical
    return (
      <div className="hidden lg:flex flex-col gap-4 flex-1 items-end pt-12">
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl w-72 transform rotate-2 hover:rotate-0 transition-transform">
          <h3 className="text-white font-bold text-2xl mb-1">99%</h3>
          <p className="text-gray-300 text-sm">SLA Compliance Rate</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl w-72 transform -rotate-1 hover:rotate-0 transition-transform -mr-8">
          <h3 className="text-white font-bold text-2xl mb-1">24/7</h3>
          <p className="text-gray-300 text-sm">Emergency Support</p>
        </div>
      </div>
    );
  };

  return (
    <section id={block.id} className="relative bg-navy-900 overflow-hidden py-16 md:py-24">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src={image?.src ?? ''}
          alt={image?.alt ?? title}
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-linear-to-r from-navy-900 via-navy-900/90 to-transparent" />
      </div>

      <Container size="xl" className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Side: Content */}
        <div className="flex-1 max-w-3xl">
          <div className="mb-6 opacity-80 mix-blend-screen text-white/80 [&_a]:text-white/80 [&_span]:text-white">
            <Breadcrumb items={breadcrumbs} />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-[800px]">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            <Link
              className={buttonVariants({ variant: 'primary', size: 'lg', className: 'shadow-lg hover:shadow-orange-500/20' })}
              to={buildContactUrl({
                source: 'hero',
                service: entity.slug,
                category: isService ? (entity as Service).categoryId : undefined,
                ctaPosition: 'hero',
              })}
              onClick={(e) => { navigateToContact({
                source: 'hero',
                service: entity.slug,
                category: isService ? (entity as Service).categoryId : undefined,
                ctaPosition: 'hero',
              }, e); }}
            >
              {ctaText}
            </Link>
            {doc.available && doc.downloadEnabled && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleDownload}
                disabled={isDownloading}
                className="text-white border-white/20 hover:bg-white/10"
              >
                {isDownloading ? 'Downloading...' : 'Download Brochure'}
              </Button>
            )}
          </div>
        </div>

        {/* Right Side Variant Rendering */}
        {renderRightContent()}
      </Container>
    </section>
  );
});
