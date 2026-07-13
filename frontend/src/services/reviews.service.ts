import { supabase } from '@/supabase/client';
import { throwSupabaseError } from '@/lib/supabaseError';
import type {
  ClientLogo,
  PaginatedResponse,
  PublicReview,
  ReviewStats,
  ReviewSubmissionPayload,
  ServiceOption,
} from '@/types';
import type { Inserts, Tables, Views } from '@/supabase/types';

export interface ReviewListParams {
  page?: number;
  limit?: number;
  featured?: boolean;
  sortBy?: 'featured' | 'newest' | 'rating';
  fetchAll?: boolean;
  rating?: number | null;
  search?: string;
}

export interface ReviewSubmissionResponse {
  id: string;
  status: 'pending';
}


type ReviewSummaryRow = Views<'v_review_summary'>;
type ActiveReviewRow = Views<'v_active_reviews'>;
type ClientLogoRow = Tables<'client_logos'>;
type ServiceRow = Tables<'services'>;
type ReviewImageUploadPayload = NonNullable<ReviewSubmissionPayload['profileImage']>;

const reviewImageBucket = 'review-images';

function normalizeNullable(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed;
}

function mapActiveReview(row: ActiveReviewRow): PublicReview {
  return {
    id: row.id ?? '',
    customerName: row.customer_name ?? '',
    companyName: row.company_name ?? 'Kargar client',
    serviceName: row.service_name ?? 'Facility Management',
    location: row.location ?? '',
    rating: row.rating ?? 5,
    reviewTitle: row.review_title ?? '',
    reviewText: row.review_text ?? '',
    recommend: row.recommend ?? true,
    profileImage: row.profile_image_url ?? '',
    companyLogo: row.company_logo_url ?? '',
    verified: true,
    featured: row.is_featured ?? false,
    createdAt: row.created_at ?? '',
    approvedAt: row.approved_at ?? '',
    reply: row.admin_reply ? {
      text: row.admin_reply,
      repliedAt: row.admin_replied_at ?? '',
    } : null,
  };
}

function mapService(row: ServiceRow): ServiceOption {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
  };
}

function mapClientLogo(row: ClientLogoRow): ClientLogo {
  return {
    id: row.id,
    companyName: row.company_name,
    logoUrl: row.logo_url,
    altText: row.alt_text,
    website: row.website,
    industry: row.industry,
    priority: row.priority,
    featured: row.is_featured,
  };
}

function extensionForContentType(contentType: ReviewImageUploadPayload['contentType']): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/svg+xml') return 'svg';
  return 'jpg';
}

function dataUrlToBlob(dataUrl: string, contentType: string): Blob {
  const encoded = dataUrl.includes(',') ? dataUrl.split(',').at(-1) : dataUrl;
  if (!encoded) {
    throw new Error('Invalid image data');
  }

  const binary = window.atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: contentType });
}

async function uploadReviewImage(
  upload: ReviewImageUploadPayload,
  folder: 'profile-images' | 'company-logos',
): Promise<string> {
  const extension = extensionForContentType(upload.contentType);
  const dateFolder = new Date().toISOString().slice(0, 10);
  const path = `${folder}/${dateFolder}/${crypto.randomUUID()}.${extension}`;
  const body = dataUrlToBlob(upload.data, upload.contentType);

  const { error } = await supabase.storage.from(reviewImageBucket).upload(path, body, {
    contentType: upload.contentType,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    throwSupabaseError(error, 'Image upload failed');
  }

  const { data } = supabase.storage.from(reviewImageBucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function fetchPublicReviews(params: ReviewListParams = {}): Promise<PaginatedResponse<PublicReview>> {
  let query = supabase.from('v_active_reviews').select('*', { count: 'exact' });

  if (params.featured) {
    query = query.eq('is_featured', true);
  }

  if (params.rating) {
    query = query.eq('rating', params.rating);
  }

  if (params.search && params.search.trim() !== '') {
    const searchTerm = `%${params.search.trim()}%`;
    query = query.or(`company_name.ilike.${searchTerm},customer_name.ilike.${searchTerm},review_text.ilike.${searchTerm}`);
  }

  if (params.sortBy === 'rating') {
    query = query.order('rating', { ascending: false });
  } else if (params.sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
  }

  let page = 1;
  let limit = 1000; // default large limit if fetching all
  
  if (!params.fetchAll) {
    page = params.page ?? 1;
    limit = params.limit ?? 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
  } else {
    // Even when fetching all, Supabase has a default limit of 1000 rows.
    query = query.limit(1000);
  }

  const { data, error, count } = await query;
  if (error) {
    throwSupabaseError(error, 'Reviews could not be loaded');
  }

  const total = count ?? 0;
  return {
    items: data.map(mapActiveReview),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function fetchReviewStats(): Promise<ReviewStats> {
  const { data, error } = await supabase.from('v_review_summary').select('*').maybeSingle();
  throwSupabaseError(error, 'Review statistics could not be loaded');

  const summary: ReviewSummaryRow = data ?? {
    total_reviews: 0,
    average_rating: 0,
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0,
    would_recommend: 0,
    featured_count: 0,
  };

  return {
    averageRating: summary.average_rating ?? 0,
    totalReviews: summary.total_reviews ?? 0,
    recommendationRate:
      (summary.total_reviews ?? 0) > 0 ? Math.round(((summary.would_recommend ?? 0) / (summary.total_reviews ?? 1)) * 100) : 0,
  };
}

export async function submitPublicReview(payload: ReviewSubmissionPayload): Promise<ReviewSubmissionResponse> {
  if (payload.websiteTrap) {
    throw new Error('Review could not be submitted');
  }

  if (!payload.permissionToDisplay) {
    throw new Error('Permission to display the review is required');
  }

  const profileImageUrl = payload.profileImage
    ? await uploadReviewImage(payload.profileImage, 'profile-images')
    : null;
  const companyLogoUrl = payload.companyLogo
    ? await uploadReviewImage(payload.companyLogo, 'company-logos')
    : null;

  const record: Inserts<'reviews'> = {
    customer_name: payload.customerName.trim(),
    company_name: normalizeNullable(payload.companyName),
    email: payload.email.trim().toLowerCase(),
    phone: normalizeNullable(payload.phone),
    service_id: payload.serviceId,
    location: normalizeNullable(payload.location),
    rating: payload.rating,
    review_title: payload.reviewTitle.trim(),
    review_text: payload.reviewText.trim(),
    recommend: payload.recommend,
    profile_image_url: profileImageUrl,
    company_logo_url: companyLogoUrl,
    status: 'pending',
    is_featured: false,
    display_order: 0,
    browser_info: window.navigator.userAgent,
    metadata: {
      permissionToDisplay: payload.permissionToDisplay,
      source: 'website',
    },
  };

  const { error } = await supabase.from('reviews').insert(record);
  throwSupabaseError(error, 'Review submission failed');

  return {
    id: 'submitted',
    status: 'pending',
  };
}

export async function fetchServiceOptions(): Promise<ServiceOption[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  throwSupabaseError(error, 'Services could not be loaded');
  return data.map(mapService);
}

export async function fetchClientLogos(): Promise<ClientLogo[]> {
  const { data, error } = await supabase
    .from('client_logos')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('priority', { ascending: false })
    .order('display_order', { ascending: true })
    .order('company_name', { ascending: true });

  throwSupabaseError(error, 'Client logos could not be loaded');
  return data.map(mapClientLogo);
}
