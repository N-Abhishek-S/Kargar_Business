import { supabase } from '@/supabase/client';
import type { Database } from '@/supabase/types';

export type ReviewRow = Database['public']['Tables']['reviews']['Row'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];

export type MediaType = 'profile_image' | 'company_logo' | 'video';

export interface ReviewMediaData {
  url: string | null;
  path: string | null;
  size?: number | null;
  contentType?: string | null;
}

/**
 * ReviewRepository
 * 
 * The exclusive layer for reading and writing review media data.
 * All UI components and services must use this repository for media operations.
 */
export const ReviewRepository = {
  /**
   * Generates public URLs from storage paths, if needed.
   * (Most of the time, the database already stores the public URL).
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Persists the storage path and public URL to the canonical media columns in the database.
   */
  async updateMedia(
    reviewId: string,
    mediaType: MediaType,
    mediaData: ReviewMediaData
  ): Promise<void> {
    const updates: ReviewUpdate = {};

    if (mediaType === 'profile_image') {
      updates.profile_image = mediaData.path;
      updates.profile_image_url = mediaData.url;
    } else if (mediaType === 'company_logo') {
      updates.company_logo = mediaData.path;
      updates.company_logo_url = mediaData.url;
    } else {
      updates.video_path = mediaData.path;
      updates.video_url = mediaData.url;
      updates.video_size = mediaData.size ?? null;
      updates.video_content_type = mediaData.contentType ?? null;
    }

    const { error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId);

    if (error) {
      throw error;
    }
  },

  /**
   * Deletes media references from the database and removes the file from storage.
   */
  async clearMedia(reviewId: string, mediaType: MediaType): Promise<void> {
    const paths = await this.getMediaPaths(reviewId);
    let bucket = '';
    let pathToRemove = '';

    if (mediaType === 'profile_image' && paths.profileImage) {
      bucket = 'review-images';
      pathToRemove = paths.profileImage;
    } else if (mediaType === 'company_logo' && paths.companyLogo) {
      bucket = 'review-images';
      pathToRemove = paths.companyLogo;
    } else if (mediaType === 'video' && paths.videoPath) {
      bucket = 'review-videos';
      pathToRemove = paths.videoPath;
    }

    if (bucket && pathToRemove) {
      await supabase.storage.from(bucket).remove([pathToRemove]).catch((err: unknown) => {
        console.warn(`Failed to remove ${mediaType} from storage`, err);
      });
    }

    return this.updateMedia(reviewId, mediaType, {
      url: null,
      path: null,
      size: null,
      contentType: null
    });
  },

  /**
   * Gets the current media paths for a review (useful before deleting).
   */
  async getMediaPaths(reviewId: string): Promise<{ profileImage: string | null, companyLogo: string | null, videoPath: string | null }> {
    const { data, error } = await supabase
      .from('reviews')
      .select('profile_image, company_logo, video_path')
      .eq('id', reviewId)
      .single();

    if (error) {
      throw error;
    }

    return {
      profileImage: data.profile_image,
      companyLogo: data.company_logo,
      videoPath: data.video_path
    };
  }
};
