/**
 * Client Logo Local Asset Map
 * ============================
 * Maps company names (normalized to lowercase) to local logo asset paths.
 * 
 * When a logo fails to load from its remote URL (Supabase storage), 
 * the LogoImage component falls back to this map before showing text.
 * 
 * To add a new logo:
 * 1. Place the image file in /public/images/client-logos/
 * 2. Add the mapping below (company name lowercase → file path)
 * 
 * The path should be relative to /public (Vite serves /public as root).
 */

const CLIENT_LOGO_MAP: Record<string, string> = {
  // Row 1 companies
  'powercon': '/images/client-logos/powercon.svg',
  'eicher': '/images/client-logos/eicher.svg',
  'decathlon': '/images/client-logos/decathlon.svg',
  'better eat': '/images/client-logos/better-eat.svg',
  'gera': '/images/client-logos/gera.svg',
  'mittal brothers': '/images/client-logos/mittal-brothers.svg',
  'lila punawala foundation': '/images/client-logos/lila-punawala-foundation.svg',
  'cantonment board dehuroad': '/images/client-logos/cantonment-board-dehuroad.svg',
  'jivika healthcare': '/images/client-logos/jivika-healthcare.svg',
  // Row 2 companies
  'majha ghar foundation': '/images/client-logos/majha-ghar-foundation.svg',
  'clover': '/images/client-logos/clover.svg',
  'impact': '/images/client-logos/impact.svg',
  'tata batteries': '/images/client-logos/tata-batteries.svg',
  'the jerai': '/images/client-logos/the-jerai.svg',
  'puraniks': '/images/client-logos/puraniks.svg',
  'the flour works': '/images/client-logos/the-flour-works.svg',
  'vtp realty': '/images/client-logos/vtp-realty.svg',
  'vascon': '/images/client-logos/vascon.svg',
  'kolte patil': '/images/client-logos/kolte-patil.svg',
};

/**
 * Resolve local logo path for a given company name.
 * Returns the local asset path if found, or undefined.
 */
export function getLocalLogoPath(companyName: string): string | undefined {
  const key = companyName.toLowerCase().trim();
  return CLIENT_LOGO_MAP[key];
}

/**
 * Check if a local logo exists for a company.
 */
export function hasLocalLogo(companyName: string): boolean {
  return getLocalLogoPath(companyName) !== undefined;
}
