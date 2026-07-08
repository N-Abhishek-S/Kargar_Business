import crypto from 'node:crypto';
import { supabase } from '../config/supabase.js';
import { logger } from '../config/logger.js';
import type { ReviewImageUploadInput, ReviewInput, ReviewListQuery } from '../schemas/review.schema.js';
import {
  addReviewMedia,
  createReview,
  findRecentDuplicate,
  getApprovedReviews,
  getReviewStats,
  type PublicReview,
  type ReviewStats,
} from '../repositories/review.repository.js';

interface RequestMeta {
  ipAddress: string;
  userAgent: string | null;
}

interface StoredUpload {
  bucket: 'customer-profile' | 'company-logos';
  path: string;
  publicUrl: string;
  mediaType: 'profile_image' | 'company_logo';
  contentType: string;
  fileSize: number;
}

export interface SubmittedReview {
  id: string;
  status: 'pending';
}

const profileImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const companyLogoTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeNullable(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function extensionForContentType(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/svg+xml') return 'svg';
  return 'jpg';
}

function decodeUpload(upload: ReviewImageUploadInput): Buffer {
  const base64 = upload.data.includes(',') ? upload.data.split(',').at(-1) : upload.data;
  if (!base64) {
    throw new Error('Invalid image data');
  }
  return Buffer.from(base64, 'base64');
}

async function storeUpload(
  upload: ReviewImageUploadInput,
  bucket: StoredUpload['bucket'],
  mediaType: StoredUpload['mediaType'],
): Promise<StoredUpload> {
  const allowedTypes = mediaType === 'profile_image' ? profileImageTypes : companyLogoTypes;
  if (!allowedTypes.has(upload.contentType)) {
    throw new Error('Unsupported image type');
  }

  const buffer = decodeUpload(upload);
  if (buffer.byteLength !== upload.size || buffer.byteLength > upload.size || buffer.byteLength > 5 * 1024 * 1024) {
    throw new Error('Invalid image size');
  }

  const extension = extensionForContentType(upload.contentType);
  const path = `${mediaType}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: upload.contentType,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    bucket,
    path,
    publicUrl: data.publicUrl,
    mediaType,
    contentType: upload.contentType,
    fileSize: buffer.byteLength,
  };
}

export async function listPublicReviews(options: ReviewListQuery) {
  return getApprovedReviews(options);
}

export async function getPublicReviewStats(): Promise<ReviewStats> {
  return getReviewStats();
}

export async function submitReview(input: ReviewInput, meta: RequestMeta): Promise<SubmittedReview> {
  if (input.websiteTrap) {
    logger.warn('Review spam trap triggered');
    throw new Error('Review could not be submitted');
  }

  const ipHash = hashValue(meta.ipAddress);
  const isDuplicate = await findRecentDuplicate(input.email, ipHash);
  if (isDuplicate) {
    throw new Error('A review was already submitted recently. Please try again later.');
  }

  const storedUploads: StoredUpload[] = [];
  if (input.profileImage) {
    storedUploads.push(await storeUpload(input.profileImage, 'customer-profile', 'profile_image'));
  }
  if (input.companyLogo) {
    storedUploads.push(await storeUpload(input.companyLogo, 'company-logos', 'company_logo'));
  }

  const profileImage = storedUploads.find((upload) => upload.mediaType === 'profile_image')?.publicUrl ?? null;
  const companyLogo = storedUploads.find((upload) => upload.mediaType === 'company_logo')?.publicUrl ?? null;

  const review: PublicReview = await createReview({
    customer_name: input.customerName,
    company_name: normalizeNullable(input.companyName),
    email: input.email,
    phone: normalizeNullable(input.phone),
    service_id: input.serviceId,
    location: normalizeNullable(input.location),
    rating: input.rating,
    review_title: input.reviewTitle,
    review_text: input.reviewText,
    recommend: input.recommend,
    profile_image: profileImage,
    company_logo: companyLogo,
    status: 'pending',
    approved: false,
    featured: false,
    display_order: 0,
    ip_hash: ipHash,
    browser_info: meta.userAgent,
  });

  await addReviewMedia(
    storedUploads.map((upload) => ({
      review_id: review.id,
      bucket: upload.bucket,
      path: upload.path,
      public_url: upload.publicUrl,
      media_type: upload.mediaType,
      content_type: upload.contentType,
      file_size: upload.fileSize,
    })),
  );

  return {
    id: review.id,
    status: 'pending',
  };
}
