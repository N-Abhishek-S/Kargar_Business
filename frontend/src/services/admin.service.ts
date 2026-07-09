import type { User } from '@supabase/supabase-js';
import { supabase } from '@/supabase/client';
import { throwSupabaseError } from '@/lib/supabaseError';
import type { AdminDashboardSummary, AdminReview, ContactMessage, PaginatedResponse } from '@/types';
import type { Tables, Updates } from '@/supabase/types';

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminSession {
  userId: string;
  email: string;
  role: 'admin' | 'super_admin';
}

export interface AdminReviewUpdatePayload {
  status?: AdminReview['status'];
  featured?: boolean;
  displayOrder?: number;
  adminReply?: string;
}

type ReviewRow = Tables<'reviews'>;
type ServiceRow = Tables<'services'>;
type ContactRow = Tables<'contact_messages'>;

function getAdminRole(user: User): AdminSession['role'] | null {
  const metadata = user.app_metadata as Record<string, unknown>;
  const role = metadata.role;
  return role === 'admin' || role === 'super_admin' ? role : null;
}

function mapAdminSession(user: User): AdminSession {
  const role = getAdminRole(user);
  if (!role) {
    throw new Error('This account is not authorized for the admin portal');
  }

  return {
    userId: user.id,
    email: user.email ?? '',
    role,
  };
}

function mapAdminReview(row: ReviewRow, serviceNames: Map<string, string>): AdminReview {
  return {
    id: row.id,
    customerName: row.customer_name,
    companyName: row.company_name ?? 'Kargar client',
    serviceName: row.service_id ? serviceNames.get(row.service_id) ?? 'Facility Management' : 'Facility Management',
    location: row.location,
    rating: row.rating,
    reviewTitle: row.review_title,
    reviewText: row.review_text,
    recommend: row.recommend,
    profileImage: row.profile_image_url,
    companyLogo: row.company_logo_url,
    verified: row.status === 'approved',
    featured: row.is_featured,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
    reply: null,
    email: row.email,
    phone: row.phone,
    status: row.status,
    approved: row.status === 'approved',
    displayOrder: row.display_order,
  };
}

function mapContact(row: ContactRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    subject: row.subject,
    message: row.message,
    status: row.status,
    priority: row.priority,
    assigned_to: row.assigned_to,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function fetchServiceNameMap(rows: ReviewRow[]): Promise<Map<string, string>> {
  const serviceIds = [...new Set(rows.map((row) => row.service_id).filter((value): value is string => Boolean(value)))];
  if (serviceIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase.from('services').select('id, name').in('id', serviceIds);
  throwSupabaseError(error, 'Service names could not be loaded');

  return new Map((data ?? []).map((service: Pick<ServiceRow, 'id' | 'name'>) => [service.id, service.name]));
}

export async function loginAdmin(payload: AdminLoginPayload): Promise<AdminSession> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  });

  throwSupabaseError(error, 'Invalid admin credentials');

  if (!data.user) {
    throw new Error('Invalid admin credentials');
  }

  try {
    return mapAdminSession(data.user);
  } catch (error) {
    await supabase.auth.signOut();
    throw error;
  }
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const { data, error } = await supabase.auth.getSession();
  throwSupabaseError(error, 'Admin session could not be loaded');

  if (!data.session?.user) {
    return null;
  }

  return mapAdminSession(data.session.user);
}

export async function logoutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  throwSupabaseError(error, 'Could not sign out');
}

export async function fetchAdminDashboard(): Promise<AdminDashboardSummary> {
  const { data, error } = await supabase.from('v_admin_dashboard').select('*').single();
  throwSupabaseError(error, 'Dashboard data could not be loaded');
  if (!data) {
    throw new Error('Dashboard data could not be loaded');
  }

  return {
    totalReviews: data.total_reviews,
    pendingReviews: data.pending_reviews,
    approvedReviews: data.approved_reviews,
    averageRating: data.average_rating,
    totalContacts: data.total_contacts,
    newContacts: data.new_contacts,
    totalSubscribers: data.active_subscribers,
  };
}

export async function fetchAdminReviews(): Promise<PaginatedResponse<AdminReview>> {
  const page = 1;
  const limit = 100;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to);

  throwSupabaseError(error, 'Reviews could not be loaded');

  const rows = data ?? [];
  const serviceNames = await fetchServiceNameMap(rows);
  const total = count ?? rows.length;

  return {
    items: rows.map((row) => mapAdminReview(row, serviceNames)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateAdminReview(id: string, payload: AdminReviewUpdatePayload): Promise<void> {
  const updates: Updates<'reviews'> = {};

  if (payload.status) {
    updates.status = payload.status;
  }
  if (payload.featured !== undefined) {
    updates.is_featured = payload.featured;
  }
  if (payload.displayOrder !== undefined) {
    updates.display_order = payload.displayOrder;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from('reviews').update(updates).eq('id', id);
    throwSupabaseError(error, 'Review could not be updated');
  }

  const adminReply = payload.adminReply?.trim();
  if (adminReply) {
    const { error } = await supabase.from('review_replies').insert({
      review_id: id,
      reply_text: adminReply,
      status: 'published',
    });
    throwSupabaseError(error, 'Admin reply could not be saved');
  }
}

export async function deleteAdminReview(id: string): Promise<void> {
  const updates: Updates<'reviews'> = {
    status: 'archived',
    is_featured: false,
    deleted_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('reviews').update(updates).eq('id', id);
  throwSupabaseError(error, 'Review could not be archived');
}

export async function fetchAdminContacts(): Promise<PaginatedResponse<ContactMessage>> {
  const page = 1;
  const limit = 100;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  throwSupabaseError(error, 'Contact inquiries could not be loaded');

  const rows = data ?? [];
  const total = count ?? rows.length;

  return {
    items: rows.map(mapContact),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateContactStatus(id: string, status: ContactMessage['status']): Promise<void> {
  const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
  throwSupabaseError(error, 'Contact status could not be updated');
}
