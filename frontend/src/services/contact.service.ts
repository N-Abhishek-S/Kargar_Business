import { supabase } from '@/supabase/client';
import { throwSupabaseError } from '@/lib/supabaseError';
import type { Inserts } from '@/supabase/types';

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  service?: string;
  message: string;
}

function nullableText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed;
}

export async function submitContactMessage(input: ContactSubmission): Promise<string> {
  const subject = nullableText(input.subject) ?? `Service: ${nullableText(input.service) ?? 'General inquiry'}`;

  const payload: Inserts<'contact_messages'> = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: nullableText(input.phone),
    company: nullableText(input.company),
    subject,
    message: input.message.trim(),
    status: 'new',
    priority: 'medium',
    source: 'website',
  };

  const { data, error } = await supabase.from('contact_messages').insert(payload).select('id').single();
  throwSupabaseError(error, 'Contact form submission failed');
  if (!data) {
    throw new Error('Contact form submission failed');
  }

  return data.id;
}
