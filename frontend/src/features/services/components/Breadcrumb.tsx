import { memo } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = memo(function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm text-gray-500 py-4 overflow-x-auto whitespace-nowrap ${className ?? ''}`}>
      <Link to="/" className="hover:text-navy-900 transition-colors flex items-center gap-1">
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400 flex-shrink-0" />
            {isLast || !item.href ? (
              <span className="text-navy-900 font-medium" aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            ) : (
              <Link to={item.href} className="hover:text-navy-900 transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
});
