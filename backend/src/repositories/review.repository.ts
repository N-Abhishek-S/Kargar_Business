import { supabase } from '../config/supabase.js';
import type { ReviewListQuery } from '../schemas/review.schema.js';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'spam' | 'archived';

interface ServiceRelation {
  name: string | null;
  slug: string | null;
}

interface ReviewReplyRow {
  reply_text: string;
  replied_at: string;
  status: string;
}

interface ReviewRow {
  id: string;
  customer_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  service_id: string | null;
  location: string | null;
  rating: number;
  review_title: string | null;
  review_text: string | null;
  recommend: boolean | null;
  profile_image: string | null;
  company_logo: string | null;
  status: ReviewStatus;
  approved: boolean | null;
  featured: boolean | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  deleted_at: string | null;
  services?: ServiceRelation | ServiceRelation[] | null;
  review_replies?: ReviewReplyRow[] | null;
  name?: string | null;
  designation?: string | null;
  company?: string | null;
  review?: string | null;
  photo_url?: string | null;
  project_type?: string | null;
  would_recommend?: boolean | null;
  is_featured?: boolean | null;
  is_hidden?: boolean | null;
  admin_reply?: string | null;
}

export interface PublicReview {
  id: string;
  customerName: string;
  companyName: string;
  serviceName: string;
  location: string | null;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  recommend: boolean;
  profileImage: string | null;
  companyLogo: string | null;
  verified: boolean;
  featured: boolean;
  createdAt: string;
  approvedAt: string | null;
  reply: {
    text: string;
    repliedAt: string;
  } | null;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  recommendationRate: number;
}

export interface CreateReviewRecord {
  customer_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  service_id: string;
  location: string | null;
  rating: number;
  review_title: string;
  review_text: string;
  recommend: boolean;
  profile_image: string | null;
  company_logo: string | null;
  status: 'pending';
  approved: false;
  featured: false;
  display_order: number;
  ip_hash: string;
  browser_info: string | null;
}

interface ReviewMediaRecord {
  review_id: string;
  bucket: string;
  path: string;
  public_url: string;
  media_type: 'profile_image' | 'company_logo' | 'review_image';
  content_type: string;
  file_size: number;
}

const publicReviewSelect = `
  id,
  customer_name,
  company_name,
  email,
  phone,
  service_id,
  location,
  rating,
  review_title,
  review_text,
  recommend,
  profile_image,
  company_logo,
  status,
  approved,
  featured,
  display_order,
  created_at,
  updated_at,
  approved_at,
  deleted_at,
  name,
  designation,
  company,
  review,
  photo_url,
  project_type,
  would_recommend,
  is_featured,
  is_hidden,
  admin_reply,
  services(name, slug),
  review_replies(reply_text, replied_at, status)
`;

function getServiceName(row: ReviewRow): string {
  const relation = Array.isArray(row.services) ? row.services[0] : row.services;
  return relation?.name ?? row.project_type ?? 'Facility Management';
}

function toPublicReview(row: ReviewRow): PublicReview {
  const publishedReply = row.review_replies?.find((reply) => reply.status === 'published') ?? null;

  return {
    id: row.id,
    customerName: row.customer_name ?? row.name ?? 'Verified customer',
    companyName: row.company_name ?? row.company ?? 'Kargar client',
    serviceName: getServiceName(row),
    location: row.location,
    rating: row.rating,
    reviewTitle: row.review_title ?? row.project_type ?? 'Client experience',
    reviewText: row.review_text ?? row.review ?? '',
    recommend: row.recommend ?? row.would_recommend ?? true,
    profileImage: row.profile_image ?? row.photo_url ?? null,
    companyLogo: row.company_logo,
    verified: row.status === 'approved' && row.approved === true,
    featured: row.featured ?? row.is_featured ?? false,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
    reply: publishedReply
      ? {
          text: publishedReply.reply_text,
          repliedAt: publishedReply.replied_at,
        }
      : null,
  };
}

function cleanSearch(value: string | undefined): string | null {
  const cleaned = value?.replace(/[^a-zA-Z0-9\s&.-]/g, '').trim();
  return cleaned && cleaned.length > 1 ? cleaned : null;
}

export async function getApprovedReviews(options: ReviewListQuery) {
  const from = (options.page - 1) * options.limit;
  const to = from + options.limit - 1;

  let query = supabase
    .from('reviews')
    .select(publicReviewSelect, { count: 'exact' })
    .eq('status', 'approved')
    .eq('approved', true)
    .eq('is_hidden', false)
    .is('deleted_at', null);

  if (options.featured) {
    query = query.eq('featured', true);
  }

  const search = cleanSearch(options.search);
  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,company_name.ilike.%${search}%,review_title.ilike.%${search}%`,
    );
  }

  if (options.sortBy === 'rating') {
    query = query.order('rating', { ascending: false });
  } else if (options.sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query
      .order('featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return {
    items: ((data ?? []) as ReviewRow[]).map(toPublicReview),
    total: count ?? 0,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil((count ?? 0) / options.limit),
  };
}

export async function getReviewStats(): Promise<ReviewStats> {
  const { data, error, count } = await supabase
    .from('reviews')
    .select('rating, recommend', { count: 'exact' })
    .eq('status', 'approved')
    .eq('approved', true)
    .eq('is_hidden', false)
    .is('deleted_at', null);

  if (error) throw error;

  const rows = (data ?? []) as Array<{ rating: number; recommend: boolean | null }>;
  const totalReviews = count ?? rows.length;
  const ratingSum = rows.reduce((sum, review) => sum + review.rating, 0);
  const recommended = rows.filter((review) => review.recommend !== false).length;

  return {
    averageRating: totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 0,
    totalReviews,
    recommendationRate: totalReviews > 0 ? Math.round((recommended / totalReviews) * 100) : 0,
  };
}

export async function findRecentDuplicate(email: string, ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

  const { count: emailCount, error: emailError } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', since)
    .is('deleted_at', null);

  if (emailError) throw emailError;
  if ((emailCount ?? 0) > 0) return true;

  const { count: ipCount, error: ipError } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since)
    .is('deleted_at', null);

  if (ipError) throw ipError;
  return (ipCount ?? 0) > 0;
}

export async function createReview(record: CreateReviewRecord): Promise<PublicReview> {
  const { data, error } = await supabase
    .from('reviews')
    .insert(record)
    .select(publicReviewSelect)
    .single();

  if (error) throw error;
  return toPublicReview(data as ReviewRow);
}

export async function addReviewMedia(records: ReviewMediaRecord[]): Promise<void> {
  if (records.length === 0) return;

  const { error } = await supabase.from('review_media').insert(records);
  if (error) throw error;
}

export async function getAdminReviews(options: ReviewListQuery) {
  const from = (options.page - 1) * options.limit;
  const to = from + options.limit - 1;

  const { data, error, count } = await supabase
    .from('reviews')
    .select(publicReviewSelect, { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    items: ((data ?? []) as ReviewRow[]).map((row) => ({
      ...toPublicReview(row),
      email: row.email,
      phone: row.phone,
      status: row.status,
      approved: row.approved ?? false,
      displayOrder: row.display_order ?? 0,
      legacy: {
        name: row.name,
        designation: row.designation,
        company: row.company,
        review: row.review,
        isFeatured: row.is_featured,
        isHidden: row.is_hidden,
        adminReply: row.admin_reply,
      },
    })),
    total: count ?? 0,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil((count ?? 0) / options.limit),
  };
}

export async function updateReviewStatus(
  id: string,
  updates: {
    status?: ReviewStatus;
    featured?: boolean;
    displayOrder?: number;
    adminReply?: string | null;
  },
): Promise<void> {
  const payload: Record<string, string | number | boolean | null> = {};

  if (updates.status) {
    payload.status = updates.status;
    payload.approved = updates.status === 'approved';
    payload.is_hidden = updates.status === 'archived';
  }
  if (updates.featured !== undefined) {
    payload.featured = updates.featured;
    payload.is_featured = updates.featured;
  }
  if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
  if (updates.adminReply !== undefined) payload.admin_reply = updates.adminReply;

  const { error } = await supabase.from('reviews').update(payload).eq('id', id);
  if (error) throw error;
}

export async function softDeleteReview(id: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({
      status: 'archived',
      approved: false,
      is_hidden: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}
