import { useState } from 'react';
import { getLocalLogoPath } from './logoAssets';

interface LogoImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export function LogoImage({ src, alt, className = '', fallbackText }: LogoImageProps) {
  const [error, setError] = useState(false);
  const [localFallbackFailed, setLocalFallbackFailed] = useState(false);

  const companyName = fallbackText ?? alt;
  const localPath = getLocalLogoPath(companyName);

  // Stage 1: Try the remote URL from Supabase
  if (!error && src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => { setError(true); }}
        className={`w-full h-full object-contain transition-all duration-300 ${className}`}
      />
    );
  }

  // Stage 2: Try local fallback asset if available
  if (localPath && !localFallbackFailed) {
    return (
      <img
        src={localPath}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => { setLocalFallbackFailed(true); }}
        className={`w-full h-full object-contain transition-all duration-300 ${className}`}
      />
    );
  }

  // Stage 3: Text fallback (last resort)
  return (
    <span className="text-sm font-semibold text-slate-500 text-center uppercase tracking-wide leading-tight px-2 select-none">
      {companyName}
    </span>
  );
}

