/**
 * Email service — sends emails via EmailJS (frontend-only, no backend required).
 *
 * Responsibilities:
 * - Initialize EmailJS with the public key from centralized config
 * - Export a single function: sendProposalEmail()
 * - No UI, no toast, no DOM logic
 */
import emailjs from '@emailjs/browser';
import { config } from '@/config';

// ---------------------------------------------------------------------------
// Initialization (lazy — runs once on first send)
// ---------------------------------------------------------------------------

let initialized = false;

function ensureInitialized(): void {
  if (initialized) return;
  if (!config.emailjs.publicKey) {
    console.warn('[EmailJS] Public key is missing — emails will not be sent.');
    return;
  }
  emailjs.init(config.emailjs.publicKey);
  initialized = true;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProposalEmailInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  service?: string;
  message: string;
}

export interface EmailResult {
  success: boolean;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendProposalEmail(input: ProposalEmailInput): Promise<EmailResult> {
  ensureInitialized();

  const { serviceId, templateId, publicKey } = config.emailjs;

  if (!serviceId || !templateId || !publicKey) {
    console.error('[EmailJS] Missing configuration — serviceId, templateId, or publicKey is empty.');
    return { success: false };
  }

  const now = new Date();

  // Variables must match the {{variable_name}} syntax in your EmailJS template
  const templateParams = {
    name: input.name,
    message: input.message,
    time: now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams);
    console.log('[EmailJS] Email sent:', response.status, response.text);
    return { success: response.status === 200 };
  } catch (error) {
    console.error('[EmailJS] Send failed:', error);
    return { success: false };
  }
}
