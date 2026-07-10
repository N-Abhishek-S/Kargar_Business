import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS for local development if needed, Vercel handles this mostly, but good to have
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  interface ContactRequestBody {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    subject?: string;
    service?: string;
    message?: string;
  }

  const body = req.body as ContactRequestBody | null | undefined;
  const { name, email, phone, company, subject, service, message } = body ?? {};

  // Basic Server-Side Validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required fields.' });
  }

  try {
    // 1. Save to Supabase
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() ?? null,
      company: company?.trim() ?? null,
      subject: subject?.trim() ?? `Service: ${service ?? 'General inquiry'}`,
      message: message.trim(),
      status: 'new',
      priority: 'medium',
      source: 'website',
    };

    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert(payload);

    if (dbError) {
      console.error('Supabase Error:', dbError);
      return res.status(500).json({ success: false, error: 'Failed to save contact message to database.' });
    }

    // 2. Send Email Notification to Company Inbox
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Kargar Website" <${process.env.SMTP_FROM}>`,
      to: 'info@kargar.co.in', // Official company inbox
      subject: `New Contact Form Submission: ${payload.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f172a;">New Contact Message / Proposal Request</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${payload.name}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${payload.email}">${payload.email}</a></td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${payload.phone ?? 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Company:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${payload.company ?? 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Service Required:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${service ?? 'N/A'}</td></tr>
          </table>
          <h3 style="margin-top: 24px; color: #0f172a;">Message:</h3>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
            ${payload.message.replace(/\n/g, '<br/>')}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Return success only if both succeeded
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send email notification.' });
  }
}
