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
  customerName?: string;
  companyName?: string;
  rating?: number;
  reviewText?: string;
  videoUrl?: string | null;
  videoPath?: string | null;
  videoSize?: number | null;
  videoContentType?: string | null;
}

type ReviewRow = Tables<'reviews'>;
type ServiceRow = Tables<'services'>;
type ContactRow = Tables<'contact_messages'>;

async function mapAdminSession(user: User): Promise<AdminSession> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error('This account is not authorized for the admin portal');
  }

  if (!data.is_active) {
    throw new Error('This admin account has been deactivated');
  }

  return {
    userId: user.id,
    email: user.email ?? '',
    role: data.role as 'admin' | 'super_admin',
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
    videoUrl: row.video_url,
    videoPath: row.video_path,
    videoSize: row.video_size,
    videoContentType: row.video_content_type,
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

  return new Map(data.map((service: Pick<ServiceRow, 'id' | 'name'>) => [service.id, service.name]));
}

export async function loginAdmin(payload: AdminLoginPayload): Promise<AdminSession> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  });

  throwSupabaseError(error, 'Invalid admin credentials');



  try {
    return await mapAdminSession(data.user);
  } catch (error) {
    await supabase.auth.signOut();
    throw error;
  }
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.user) {
    return null;
  }

  try {
    return await mapAdminSession(data.session.user);
  } catch {
    return null;
  }
}

export async function logoutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  throwSupabaseError(error, 'Could not sign out');
}

export async function fetchAdminDashboard(): Promise<AdminDashboardSummary> {
  const { data, error } = await supabase.from('v_admin_dashboard').select('*').single();
  throwSupabaseError(error, 'Dashboard data could not be loaded');

  const getNum = (val: number | null | undefined): number => val ?? 0;

  return {
    totalReviews: getNum(data.total_reviews),
    pendingReviews: getNum(data.pending_reviews),
    approvedReviews: getNum(data.approved_reviews),
    averageRating: getNum(data.average_rating),
    totalContacts: getNum(data.total_contacts),
    newContacts: getNum(data.new_contacts),
    totalSubscribers: getNum(data.active_subscribers),
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

  const rows = data;
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

  if (payload.status) updates.status = payload.status;
  if (payload.featured !== undefined) updates.is_featured = payload.featured;
  if (payload.displayOrder !== undefined) updates.display_order = payload.displayOrder;
  if (payload.customerName !== undefined) updates.customer_name = payload.customerName;
  if (payload.companyName !== undefined) updates.company_name = payload.companyName;
  if (payload.rating !== undefined) updates.rating = payload.rating;
  if (payload.reviewText !== undefined) updates.review_text = payload.reviewText;
  
  // Video updates
  if (payload.videoUrl !== undefined) updates.video_url = payload.videoUrl;
  if (payload.videoPath !== undefined) updates.video_path = payload.videoPath;
  if (payload.videoSize !== undefined) updates.video_size = payload.videoSize;
  if (payload.videoContentType !== undefined) updates.video_content_type = payload.videoContentType;

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
  // First fetch the review to check if it has a video
  const { data: review } = await supabase.from('reviews').select('video_path').eq('id', id).single();
  
  if (review?.video_path) {
    await supabase.storage.from('review-videos').remove([review.video_path]).catch(() => {});
  }

  const updates: Updates<'reviews'> = {
    status: 'archived',
    is_featured: false,
    deleted_at: new Date().toISOString(),
    video_url: null,
    video_path: null,
    video_size: null,
    video_content_type: null,
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

  const rows = data;
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
