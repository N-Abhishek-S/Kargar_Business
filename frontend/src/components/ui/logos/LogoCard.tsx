import type { ReactNode } from 'react';

interface LogoCardProps {
  children: ReactNode;
  href?: string | null;
  label?: string;
}

export function LogoCard({ children, href, label }: LogoCardProps) {
  // Height defined at breakpoints, with internal flex to center the logo.
  // Using a subtle gray background ensures white logos are visible without heavy processing.
  const baseClasses = "group flex items-center justify-center w-full h-[80px] md:h-[95px] lg:h-[110px] p-4 md:p-5 lg:p-6 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ease-out";
  const hoverClasses = "hover:-translate-y-1 hover:shadow-md hover:border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500";

  const content = (
    <div className="relative w-full h-full flex items-center justify-center min-w-0 min-h-0">
      {children}
    </div>
  );

  if (href) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${baseClasses} ${hoverClasses}`}
        aria-label={label ? `Visit ${label} website` : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={baseClasses} aria-label={label}>
      {content}
    </div>
  );
}
