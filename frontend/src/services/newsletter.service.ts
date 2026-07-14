import { supabase } from '@/supabase/client';

export interface NewsletterSubscription {
  email: string;
  source?: string;
}

export interface NewsletterResult {
  success: boolean;
  message?: string;
}

export const newsletterService = {
  subscribe: async (input: NewsletterSubscription): Promise<NewsletterResult> => {
    if (!input.email.trim()) {
      return { success: false, message: 'Email is required.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return { success: false, message: 'Invalid email address.' };
    }

    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: input.email.trim().toLowerCase(),
        source: input.source?.trim() ?? 'website',
      });

    if (dbError) {
      // 23505 is the PostgreSQL error code for unique_violation
      if (dbError.code === '23505') {
        return { success: true, message: 'You are already subscribed.' };
      }
      console.error('[Newsletter] Database insert failed:', dbError);
      return { success: false, message: 'Unable to subscribe. Please try again.' };
    }

    console.log('[Newsletter] Subscribed successfully');
    return { success: true, message: 'Successfully subscribed to the newsletter.' };
  }
};
