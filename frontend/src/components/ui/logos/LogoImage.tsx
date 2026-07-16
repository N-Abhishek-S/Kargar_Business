import { useState } from 'react';

interface LogoImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export function LogoImage({ src, alt, className = '', fallbackText }: LogoImageProps) {
  const [error, setError] = useState(false);
  const companyName = fallbackText ?? alt;

  if (!error && src) {
    const isWhiteLogo = src.includes('kumar');
    const filterClass = isWhiteLogo ? 'invert' : '';
    
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => { setError(true); }}
        className={`w-full h-full object-contain transition-all duration-300 ${filterClass} ${className}`}
      />
    );
  }

  // Text fallback (if image fails to load or no src provided)
  return (
    <span className="text-sm font-semibold text-slate-500 text-center uppercase tracking-wide leading-tight px-2 select-none">
      {companyName}
    </span>
  );
}
