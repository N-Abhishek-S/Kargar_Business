import { supabase } from '@/supabase/client';
import { throwSupabaseError } from '@/lib/supabaseError';
import type { Inserts } from '@/supabase/types';

interface NewsletterError {
  code?: string;
  message: string;
}

export async function subscribeToNewsletter(email: string): Promise<void> {
  const payload: Inserts<'newsletter_subscribers'> = {
    email: email.trim().toLowerCase(),
    is_active: true,
    source: 'website',
    unsubscribed_at: null,
  };

  const { error } = await supabase.from('newsletter_subscribers').insert(payload);
  const newsletterError = error as NewsletterError | null;

  if (newsletterError?.code === '23505') {
    return;
  }

  throwSupabaseError(newsletterError, 'Newsletter subscription failed');
}
