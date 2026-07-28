import { supabase } from '@/supabase/client';
import { throwSupabaseError } from '@/lib/supabaseError';
import { ReviewRepository } from '../repositories/review.repository';
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
type ServiceRow = Tables<'services'>;
type ReviewImageUploadPayload = NonNullable<ReviewSubmissionPayload['profileImage']>;

const reviewImageBucket = 'review-images';
const reviewVideoBucket = 'review-videos';

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
    profileImagePath: (row as ActiveReviewRow & { profile_image?: string | null }).profile_image ?? null,
    companyLogo: row.company_logo_url ?? '',
    companyLogoPath: (row as ActiveReviewRow & { company_logo?: string | null }).company_logo ?? null,
    videoUrl: row.video_url ?? null,
    videoPath: (row as ActiveReviewRow & { video_path?: string | null }).video_path ?? null,
    videoSize: (row as ActiveReviewRow & { video_size?: number | null }).video_size ?? null,
    videoContentType: (row as ActiveReviewRow & { video_content_type?: string | null }).video_content_type ?? null,
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

interface ImageUploadResult {
  url: string;
  path: string;
}

async function uploadReviewImage(
  upload: ReviewImageUploadPayload,
  folder: 'profile-images' | 'company-logos',
): Promise<ImageUploadResult> {
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
  return { url: data.publicUrl, path };
}

/**
 * Best-effort cleanup of uploaded assets on submission failure.
 * Logs errors but never throws — rollback failures must not mask the original error.
 */
async function cleanupUploadedAssets(
  assets: { bucket: string; path: string }[],
): Promise<void> {
  for (const asset of assets) {
    try {
      await supabase.storage.from(asset.bucket).remove([asset.path]);
    } catch (e: unknown) {
      console.error(`Failed to cleanup orphaned asset ${asset.bucket}/${asset.path}`, e);
    }
  }
}

export async function uploadReviewVideo(file: File): Promise<{ url: string; path: string; size: number; contentType: string }> {
  const extension = file.name.split('.').pop() ?? 'mp4';
  const dateFolder = new Date().toISOString().slice(0, 10);
  const path = `${dateFolder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(reviewVideoBucket).upload(path, file, {
    contentType: file.type || 'video/mp4',
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    const errorObj = error as unknown as { message?: string, statusCode?: string | number };
    const errorMsg = errorObj.message ?? '';
    if (errorMsg.toLowerCase().includes('bucket not found') || errorMsg.toLowerCase().includes('not found') || errorObj.statusCode === '404' || errorObj.statusCode === 404 || errorObj.statusCode === 400) {
      throw new Error('Video uploads are not configured. Please contact the administrator.');
    }
    throwSupabaseError(error, 'Video upload failed');
  }

  const { data } = supabase.storage.from(reviewVideoBucket).getPublicUrl(path);
  return { 
    url: data.publicUrl, 
    path, 
    size: file.size, 
    contentType: file.type || 'video/mp4' 
  };
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

  // Track all uploaded assets for transactional rollback
  const uploadedAssets: { bucket: string; path: string }[] = [];

  try {
    // 1. Upload profile image
    let profileImageUrl: string | null = null;
    let profileImagePath: string | null = null;
    if (payload.profileImage) {
      const result = await uploadReviewImage(payload.profileImage, 'profile-images');
      profileImageUrl = result.url;
      profileImagePath = result.path;
      uploadedAssets.push({ bucket: reviewImageBucket, path: result.path });
    }

    // 2. Upload company logo
    let companyLogoUrl: string | null = null;
    let companyLogoPath: string | null = null;
    if (payload.companyLogo) {
      const result = await uploadReviewImage(payload.companyLogo, 'company-logos');
      companyLogoUrl = result.url;
      companyLogoPath = result.path;
      uploadedAssets.push({ bucket: reviewImageBucket, path: result.path });
    }

    // 3. Video data (already uploaded by useUploadProgress, or fallback upload)
    const videoData = payload.videoData ?? null;
    if (videoData?.path) {
      uploadedAssets.push({ bucket: reviewVideoBucket, path: videoData.path });
    }

    // 4. Build the database record
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
      profile_image: profileImagePath,
      company_logo_url: companyLogoUrl,
      company_logo: companyLogoPath,
      video_url: videoData?.url ?? null,
      video_path: videoData?.path ?? null,
      video_size: videoData?.size ?? null,
      video_content_type: videoData?.contentType ?? null,
      status: 'pending',
      is_featured: false,
      display_order: 0,
      browser_info: window.navigator.userAgent,
      metadata: {
        permissionToDisplay: payload.permissionToDisplay,
        submissionId: payload.submissionId,
        source: 'website',
      },
    };

    // 5. Insert into database
    const { error } = await supabase.from('reviews').insert(record);

    if (error) {
      throwSupabaseError(error, 'Review submission failed');
    }

    return {
      id: 'submitted',
      status: 'pending',
    };
  } catch (error) {
    // Rollback: clean up ALL uploaded assets on any failure
    await cleanupUploadedAssets(uploadedAssets);
    throw error;
  }
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

interface LogoManifestItem {
  name: string;
  file: string;
  type: string;
  source: string;
}

export async function fetchClientLogos(): Promise<ClientLogo[]> {
  try {
    const res = await fetch('/logos/logo-manifest.json');
    if (!res.ok) throw new Error('Failed to fetch logo manifest');
    const manifest = (await res.json()) as LogoManifestItem[];
    
    return manifest.map((item: LogoManifestItem, index: number) => ({
      id: `logo-${index}`,
      companyName: item.name,
      logoUrl: item.file,
      industry: item.type,
      altText: `${item.name} logo`,
      website: null,
      featured: false,
      priority: 0,
    }));
  } catch (error) {
    console.error('Error fetching client logos:', error);
    return [];
  }
}

export type MediaType = 'profile_image' | 'company_logo' | 'video';

export interface UpdateReviewMediaPayload {
  reviewId: string;
  mediaType: MediaType;
  fileData?: string | File | null; // dataURL for images, File for video, null for delete
  contentType?: string; // used for images
  oldPath?: string | null;
}

export async function updateReviewMedia(payload: UpdateReviewMediaPayload): Promise<void> {
  let newUrl: string | null = null;
  let newPath: string | null = null;
  let newSize: number | null = null;
  let newContentType: string | null = null;
  let uploadedBucket: string | null = null;
  let uploadedPath: string | null = null;

  try {
    // 1. Upload new asset if provided
    if (payload.fileData) {
      if (payload.mediaType === 'video' && payload.fileData instanceof File) {
        const result = await uploadReviewVideo(payload.fileData);
        newUrl = result.url;
        newPath = result.path;
        newSize = result.size;
        newContentType = result.contentType;
        uploadedBucket = reviewVideoBucket;
        uploadedPath = result.path;
      } else if (payload.fileData instanceof File && payload.contentType) {
        const folder = payload.mediaType === 'profile_image' ? 'profile-images' : 'company-logos';
        // Convert File to Base64
        const buffer = await payload.fileData.arrayBuffer();
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        const dataUrl = `data:${payload.contentType};base64,${base64}`;
        
        const result = await uploadReviewImage({ 
          fileName: payload.fileData.name,
          size: payload.fileData.size,
          data: dataUrl, 
          contentType: payload.contentType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/svg+xml'
        }, folder);
        newUrl = result.url;
        newPath = result.path;
        uploadedBucket = reviewImageBucket;
        uploadedPath = result.path;
      } else {
        throw new Error('Invalid file data for media update');
      }
    }

    // 2. Update Database via Repository
    try {
      await ReviewRepository.updateMedia(payload.reviewId, payload.mediaType, {
        url: newUrl,
        path: newPath,
        size: newSize,
        contentType: newContentType
      });
    } catch (dbError) {
      throwSupabaseError(dbError as { message: string; code?: string }, 'Failed to update review media record in database');
    }

    // 3. Delete Old Asset (Best Effort)
    if (payload.oldPath) {
      const oldBucket = payload.mediaType === 'video' ? reviewVideoBucket : reviewImageBucket;
      await cleanupUploadedAssets([{ bucket: oldBucket, path: payload.oldPath }]);
    }
  } catch (error) {
    // Rollback: if database update failed, delete the newly uploaded asset
    if (uploadedBucket && uploadedPath) {
      await cleanupUploadedAssets([{ bucket: uploadedBucket, path: uploadedPath }]);
    }
    throw error;
  }
}
