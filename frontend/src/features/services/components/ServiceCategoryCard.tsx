import type { Category } from '../domain/service.types';
import { serviceIcons } from '../config/icons';
import { useServices } from '../hooks/useServices';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router';
import { serviceImages } from '../config/images';
import { memo } from 'react';
import { useContactNavigation } from '../hooks/useContactNavigation';
import { buildContactUrl } from '../utils/contactNavigation';

export interface ServiceCategoryCardProps {
  category: Category;
}

export const ServiceCategoryCard = memo(function ServiceCategoryCard({ 
  category 
}: ServiceCategoryCardProps) {
  const Icon = serviceIcons[category.iconKey];
  const { navigateToContact } = useContactNavigation();
  const { getServicesByCategory } = useServices();
  const includedServices = getServicesByCategory(category.id);
  const displayServices = includedServices.slice(0, 3);
  
  // Enterprise stats
  const totalServices = includedServices.length;
  const rating = 5;
  
  // Extract unique industries from the included services
  const industriesSet = new Set<string>();
  includedServices.forEach(s => {
    s.industries?.forEach(ind => {
      const indStr = typeof ind === 'string' ? ind : ind.title;
      industriesSet.add(indStr);
    });
  });
  const topIndustries = Array.from(industriesSet).slice(0, 3);
  
  const image = serviceImages[category.imageKey] ?? serviceImages.hardServices;

  return (
    <div className="group flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
      
      {/* Premium Image Header */}
      <div className="h-48 sm:h-56 relative overflow-hidden">
        <div className="absolute inset-0 bg-navy-900/40 group-hover:bg-navy-900/20 transition-colors z-10" />
        <img 
          src={image?.src ?? '/images/hero-bg.jpg'} 
          alt={image?.alt ?? category.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
        />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
            {Icon && <Icon className="h-5 w-5" strokeWidth={2} />}
          </div>
          <div className="flex gap-0.5 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            ))}
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pt-20 bg-linear-to-t from-navy-900 via-navy-900/80 to-transparent z-20">
          <h3 className="text-2xl font-bold text-white mb-1">{category.title}</h3>
          <p className="text-white/80 text-sm font-medium">{totalServices} Integrated Services</p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {category.shortDescription}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 flex-1">
          {/* Left: Services */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Most Requested
            </div>
            <ul className="space-y-2">
              {displayServices.map((service) => (
                <li key={service.id} className="flex items-start text-navy-900 text-sm font-medium">
                  <span className="mr-2 text-orange-500 font-bold mt-0.5">✓</span>
                  {service.title}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right: Industries & Stats */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Key Metrics
            </div>
            <ul className="space-y-2 mb-4">
              {category.statistics?.slice(0, 2).map((stat, i) => (
                <li key={i} className="flex items-center text-navy-900 text-sm">
                  <span className="text-orange-500 font-bold mr-2">{stat.value}</span>
                  <span className="text-slate-600">{stat.label}</span>
                </li>
              ))}
            </ul>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Top Industries
            </div>
            <ul className="space-y-1.5">
              {topIndustries.map((ind, i) => (
                <li key={i} className="flex items-center text-slate-600 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 shrink-0" />
                  {ind}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA / Links */}
        <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <Link 
            to={`/services/${category.slug}`}
            className="flex-1 flex items-center justify-center py-2.5 px-4 bg-navy-900 hover:bg-navy-800 text-white text-sm font-bold transition-colors rounded-xl group/btn"
          >
            <span>Explore {category.title}</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
          <a 
            href={buildContactUrl({ source: `category_card_${category.id}`, category: category.id })}
            onClick={(e) => {
              e.preventDefault();
              navigateToContact({ source: `category_card_${category.id}`, category: category.id });
            }}
            className="flex-1 flex items-center justify-center py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-600 text-sm font-bold transition-colors rounded-xl cursor-pointer"
          >
            <span>Request Proposal</span>
          </a>
        </div>
      </div>
    </div>
  );
});
