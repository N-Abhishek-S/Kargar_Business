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
      <div className="h-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-navy-900/40 group-hover:bg-navy-900/20 transition-colors z-10" />
        <img 
          src={image?.src ?? '/images/hero-bg.jpg'} 
          alt={image?.alt ?? category.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
        />
        
        {/* Top Badges */}
        <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
            {Icon && <Icon className="h-7 w-7" strokeWidth={2} />}
          </div>
          <div className="flex gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-orange-500 fill-orange-500" />
            ))}
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-linear-to-t from-navy-900 to-transparent z-20">
          <h3 className="text-3xl font-bold text-white mb-2">{category.title}</h3>
          <p className="text-white/80 font-medium">{totalServices} Integrated Services</p>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <p className="text-slate-600 leading-relaxed text-lg mb-8">
          {category.shortDescription}
        </p>

        <div className="grid grid-cols-2 gap-8 mb-8 flex-1">
          {/* Left: Services */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Most Requested
            </div>
            <ul className="space-y-3">
              {displayServices.map((service) => (
                <li key={service.id} className="flex items-start text-navy-900 font-medium">
                  <span className="mr-3 text-orange-500 font-bold mt-0.5">✓</span>
                  {service.title}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right: Industries & Stats */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Key Metrics
            </div>
            <ul className="space-y-3 mb-6">
              {category.statistics?.slice(0, 2).map((stat, i) => (
                <li key={i} className="flex items-center text-navy-900">
                  <span className="text-orange-500 font-bold text-lg mr-2">{stat.value}</span>
                  <span className="text-slate-600 text-sm">{stat.label}</span>
                </li>
              ))}
            </ul>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Top Industries
            </div>
            <ul className="space-y-2">
              {topIndustries.map((ind, i) => (
                <li key={i} className="flex items-start text-slate-600 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 mt-1.5 shrink-0" />
                  {ind}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA / Links */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <Link 
            to={`/services/${category.slug}`}
            className="flex-1 flex items-center justify-center p-3 bg-navy-900 hover:bg-navy-800 text-white font-bold transition-colors rounded-xl group/btn"
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
            className="flex-1 flex items-center justify-center p-3 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold transition-colors rounded-xl cursor-pointer"
          >
            <span>Request Proposal</span>
          </a>
        </div>
      </div>
    </div>
  );
});
