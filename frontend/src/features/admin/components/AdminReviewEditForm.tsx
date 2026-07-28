import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import type { AdminReview } from '@/types';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { MediaToolbar } from '@/features/reviews/components/media/MediaToolbar';
import { ReviewVideo } from '@/features/reviews/components/media/ReviewVideo';
import type { MediaType } from '@/services/reviews.service';

const adminReviewSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  companyName: z.string().optional(),
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10, 'Review is too short'),
  status: z.enum(['pending', 'approved', 'rejected', 'spam', 'archived']),
  featured: z.boolean(),
});

type AdminReviewFormValues = z.infer<typeof adminReviewSchema>;

export interface AdminReviewEditFormProps {
  review: AdminReview;
  onSave: (id: string, updates: Partial<AdminReview>) => Promise<void>;
  onUpdateMedia: (type: MediaType, file: File | null) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function AdminReviewEditForm({ review, onSave, onUpdateMedia, onCancel, isSaving }: AdminReviewEditFormProps) {
  const [updatingMedia, setUpdatingMedia] = useState<MediaType | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<AdminReviewFormValues>({
    resolver: zodResolver(adminReviewSchema),
    defaultValues: {
      customerName: review.customerName,
      companyName: review.companyName,
      rating: review.rating,
      reviewText: review.reviewText,
      status: review.status,
      featured: review.featured,
    },
  });

  const onSubmit = async (values: AdminReviewFormValues) => {
    await onSave(review.id, {
      customerName: values.customerName,
      companyName: values.companyName,
      rating: values.rating,
      reviewText: values.reviewText,
      status: values.status,
      featured: values.featured,
    });
  };

  const handleUpdateMedia = async (type: MediaType, file: File | null) => {
    setUpdatingMedia(type);
    try {
      await onUpdateMedia(type, file);
    } finally {
      setUpdatingMedia(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input 
          label="Customer Name" 
          {...register('customerName')} 
          error={errors.customerName?.message} 
        />
        <Input 
          label="Company Name" 
          {...register('companyName')} 
          error={errors.companyName?.message} 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-navy-900 mb-1.5 block">Rating (1-5)</label>
          <input 
            type="number" 
            min="1" max="5" 
            {...register('rating', { valueAsNumber: true })}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20"
          />
          {errors.rating && <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>}
        </div>
        
        <div>
          <label className="text-sm font-medium text-navy-900 mb-1.5 block">Status</label>
          <select 
            {...register('status')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="spam">Spam</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-navy-900 mb-1.5 block">Review Text</label>
        <textarea 
          {...register('reviewText')}
          rows={5}
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20"
        />
        {errors.reviewText && <p className="mt-1 text-sm text-red-500">{errors.reviewText.message}</p>}
      </div>
      
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-navy-900">
          <input type="checkbox" {...register('featured')} className="rounded text-orange-500 focus:ring-orange-500" />
          Featured on homepage
        </label>
      </div>

      <div className="border-t border-gray-200 pt-6 space-y-8">
        <div>
          <h3 className="text-lg font-medium text-navy-900 mb-4">Media Testimonials</h3>
          <p className="text-sm text-gray-500 mb-6">Updating media will immediately save the new file.</p>
        </div>

        {/* Profile Image */}
        <div className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
          <Avatar
            src={review.profileImage ?? undefined}
            alt="Profile"
            fallbackInitials={review.customerName.slice(0, 2).toUpperCase()}
            size="xl"
            className="shrink-0 border border-gray-200 bg-white"
          />
          <div className="grow">
            <h4 className="text-sm font-medium text-gray-700">Customer Photo</h4>
            <MediaToolbar
              hasMedia={!!review.profileImage}
              accept="image/*"
              isReplacing={updatingMedia === 'profile_image'}
              isDeleting={updatingMedia === 'profile_image'}
              onReplace={(file) => handleUpdateMedia('profile_image', file)}
              onDelete={() => handleUpdateMedia('profile_image', null)}
            />
          </div>
        </div>

        {/* Company Logo */}
        <div className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
          <Avatar
            src={review.companyLogo ?? undefined}
            alt="Company Logo"
            fallbackInitials={review.companyName.trim() ? review.companyName.slice(0, 2).toUpperCase() : 'CO'}
            size="xl"
            className="shrink-0 border border-gray-200 bg-white"
          />
          <div className="grow">
            <h4 className="text-sm font-medium text-gray-700">Company Logo</h4>
            <MediaToolbar
              hasMedia={!!review.companyLogo}
              accept="image/*"
              isReplacing={updatingMedia === 'company_logo'}
              isDeleting={updatingMedia === 'company_logo'}
              onReplace={(file) => handleUpdateMedia('company_logo', file)}
              onDelete={() => handleUpdateMedia('company_logo', null)}
            />
          </div>
        </div>

        {/* Video */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
           <h4 className="text-sm font-medium text-gray-700 mb-4">Video Testimonial</h4>
           {review.videoUrl && (
             <div className="max-w-md mb-4 bg-black rounded-lg border border-gray-200 overflow-hidden">
               <ReviewVideo src={review.videoUrl} className="max-h-64 mx-auto" />
             </div>
           )}
           <MediaToolbar
              hasMedia={!!review.videoUrl}
              accept="video/*"
              isReplacing={updatingMedia === 'video'}
              isDeleting={updatingMedia === 'video'}
              onReplace={(file) => handleUpdateMedia('video', file)}
              onDelete={() => handleUpdateMedia('video', null)}
              onDownload={() => review.videoUrl && window.open(review.videoUrl)}
            />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          disabled={isSaving || updatingMedia !== null}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving || updatingMedia !== null}
          className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-bold text-white bg-navy-900 rounded-md hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-900"
        >
          {isSaving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : (
            <><Save size={16} /> Save Changes</>
          )}
        </button>
      </div>
    </form>
  );
}
