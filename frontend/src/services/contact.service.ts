/**
 * Contact service — handles the complete proposal submission flow.
 *
 * Flow:
 *   1. Validate input
 *   2. Save into Supabase (source of truth — never lose a lead)
 *   3. Send email via EmailJS (best-effort)
 *   4. Return result with contactId + emailSent status
 *
 * Business rule: The database row is ALWAYS saved.
 * Email failure never loses a customer inquiry.
 */
import { supabase } from '@/supabase/client';
import { sendProposalEmail } from '@/services/email.service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  service?: string;
  source?: string;
  campaign?: string;
  message: string;
}

export interface ContactResult {
  success: boolean;
  contactId?: string;
  emailSent: boolean;
  emailError?: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function submitContactMessage(input: ContactSubmission): Promise<ContactResult> {
  // ---- Validate ----
  if (!input.name.trim() || !input.email.trim() || !input.message.trim()) {
    throw new Error('Name, email, and message are required fields.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    throw new Error('Invalid email address format.');
  }

  const resolvedSubject = input.subject?.trim() ?? 'General Inquiry';

  // ---- 1. Save to Supabase (always) ----
  const { error: dbError } = await supabase
    .from('contact_messages')
    .insert({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() ?? null,
      company: input.company?.trim() ?? null,
      subject: resolvedSubject,
      message: input.message.trim(),
      status: 'new',
      priority: 'medium',
      source: input.source?.trim() ?? 'website',
    }); // Removed .select('id').single() because anon key cannot read rows for security

  if (dbError) {
    console.error('[Contact] Database insert failed:', dbError);
    throw new Error('Unable to submit your request. Please try again.');
  }

  console.log('[Contact] Saved to database successfully');

  // ---- 2. Send email via EmailJS (best-effort) ----
  const emailResult = await sendProposalEmail({
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim(),
    company: input.company?.trim(),
    subject: resolvedSubject,
    service: input.service,
    message: input.message.trim(),
  });

  if (!emailResult.success) {
    console.warn('[Contact] Email notification failed — database record preserved.');
    return {
      success: true,
      emailSent: false,
      emailError: 'Email notification is temporarily unavailable.',
    };
  }

  return {
    success: true,
    emailSent: true,
  };
}
