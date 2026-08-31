import { OFFICIAL_SOCIAL_LINKS, type SocialPlatform } from '@/config/socialLinks';

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.77a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
    </svg>
  );
}

function XIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function renderSocialIcon(id: SocialPlatform['id'], className?: string) {
  switch (id) {
    case 'instagram':
      return <InstagramIcon className={className} />;
    case 'facebook':
      return <FacebookIcon className={className} />;
    case 'linkedin':
      return <LinkedinIcon className={className} />;
    case 'x':
      return <XIcon className={className} />;
  }
}

function getPlatformHoverClasses(id: SocialPlatform['id']): string {
  switch (id) {
    case 'instagram':
      return 'hover:border-pink-500 hover:bg-gradient-to-tr hover:from-amber-500/15 hover:via-pink-500/15 hover:to-purple-500/15 hover:text-pink-400';
    case 'facebook':
      return 'hover:border-blue-500 hover:bg-blue-500/15 hover:text-blue-400';
    case 'linkedin':
      return 'hover:border-sky-500 hover:bg-sky-500/15 hover:text-sky-300';
    case 'x':
      return 'hover:border-gray-300 hover:bg-white/10 hover:text-white';
  }
}

export interface SocialLinksProps {
  showHeading?: boolean;
  heading?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function SocialLinks({
  showHeading = true,
  heading = 'FOLLOW US',
  className = '',
  align = 'center',
}: SocialLinksProps) {
  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[align];

  return (
    <nav aria-label="Social Media Links" className={`flex flex-col ${alignmentClasses} ${className}`}>
      {showHeading && (
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-200">{heading}</span>
          <div className="h-[1px] w-12 bg-navy-700" aria-hidden="true" />
        </div>
      )}
      <div className="flex items-start gap-4 sm:gap-5 flex-nowrap justify-center">
        {OFFICIAL_SOCIAL_LINKS.map((link) => {
          const hoverClasses = getPlatformHoverClasses(link.id);
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.ariaLabel}
              title={link.title}
              className="group flex flex-col items-center gap-1.5 focus:outline-none rounded-full shrink-0"
            >
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-navy-700/80 bg-navy-900/60 text-gray-300 flex items-center justify-center transition-all duration-200 shadow-sm group-hover:-translate-y-1 group-focus:ring-2 group-focus:ring-orange-500 group-focus:ring-offset-2 group-focus:ring-offset-navy-950 ${hoverClasses}`}
              >
                {renderSocialIcon(link.id, 'w-5 h-5')}
              </div>
              <span className="text-[11px] font-medium text-gray-300 group-hover:text-white transition-colors text-center whitespace-nowrap">
                {link.name}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
