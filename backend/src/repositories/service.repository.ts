import { supabase } from '../config/supabase.js';

export interface ServiceOption {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface ServiceRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export async function getActiveServices(): Promise<ServiceOption[]> {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, slug, description')
    .eq('active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;

  return ((data ?? []) as ServiceRow[]).map((service) => ({
    id: service.id,
    name: service.name,
    slug: service.slug,
    description: service.description,
  }));
}
