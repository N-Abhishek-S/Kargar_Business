import { supabase } from '../config/supabase.js';

export interface ClientLogo {
  id: string;
  companyName: string;
  logoUrl: string;
  altText: string;
  website: string | null;
  industry: string | null;
  priority: number;
  featured: boolean;
}

interface ClientLogoRow {
  id: string;
  company_name: string;
  logo_url: string;
  alt_text: string | null;
  website: string | null;
  industry: string | null;
  priority: number | null;
  featured: boolean | null;
}

export async function getActiveClientLogos(): Promise<ClientLogo[]> {
  const { data, error } = await supabase
    .from('client_logos')
    .select('id, company_name, logo_url, alt_text, website, industry, priority, featured')
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('priority', { ascending: false })
    .order('display_order', { ascending: true })
    .order('company_name', { ascending: true });

  if (error) throw error;

  return ((data ?? []) as ClientLogoRow[]).map((logo) => ({
    id: logo.id,
    companyName: logo.company_name,
    logoUrl: logo.logo_url,
    altText: logo.alt_text ?? `${logo.company_name} logo`,
    website: logo.website,
    industry: logo.industry,
    priority: logo.priority ?? 0,
    featured: logo.featured ?? false,
  }));
}
