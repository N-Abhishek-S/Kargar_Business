import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Trash2, Download } from 'lucide-react';
import type { AdminReview } from '@/types';
import { Input } from '@/components/ui/Input';
import { VideoUploadCard } from '@/features/reviews/components/VideoUploadCard';
const adminReviewSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  companyName: z.string().optional(),
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10, 'Review is too short'),
  videoFile: z.any().optional().nullable(), // File object for replacement
  status: z.enum(['pending', 'approved', 'rejected', 'spam', 'archived']),
  featured: z.boolean(),
});

type AdminReviewFormValues = z.infer<typeof adminReviewSchema>;

export interface AdminReviewEditFormProps {
  review: AdminReview;
  onSave: (id: string, updates: Partial<AdminReview> & { newVideoFile?: File | null, removeVideo?: boolean }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function AdminReviewEditForm({ review, onSave, onCancel, isSaving }: AdminReviewEditFormProps) {
  const [videoAction, setVideoAction] = useState<'keep' | 'remove' | 'replace'>('keep');
  
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<AdminReviewFormValues>({
    resolver: zodResolver(adminReviewSchema),
    defaultValues: {
      customerName: review.customerName,
      companyName: review.companyName,
      rating: review.rating,
      reviewText: review.reviewText,
      status: review.status,
      featured: review.featured,
      videoFile: null,
    },
  });

  const videoFile = useWatch({
    control,
    name: 'videoFile',
  }) as File | null;
  
  const onSubmit = async (values: AdminReviewFormValues) => {
    await onSave(review.id, {
      customerName: values.customerName,
      companyName: values.companyName,
      rating: values.rating,
      reviewText: values.reviewText,
      status: values.status,
      featured: values.featured,
      newVideoFile: videoAction === 'replace' ? (values.videoFile as File | null) : null,
      removeVideo: videoAction === 'remove',
    });
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

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-navy-900 mb-4">Video Testimonial</h3>
        
        {review.videoUrl && videoAction === 'keep' ? (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="rounded-md overflow-hidden bg-black mb-4">
              <video src={review.videoUrl} controls className="w-full max-h-64 object-contain" />
            </div>
            <div className="flex gap-3">
              <a 
                href={review.videoUrl} 
                download 
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <Download size={16} /> Download
              </a>
              <button 
                type="button"
                onClick={() => { setVideoAction('replace'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Replace
              </button>
              <button 
                type="button"
                onClick={() => { setVideoAction('remove'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors ml-auto"
              >
                <Trash2 size={16} /> Delete Video
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            {videoAction !== 'keep' && (
              <div className="mb-4 flex justify-end">
                <button 
                  type="button" 
                  onClick={() => {
                    setVideoAction('keep');
                    setValue('videoFile', null);
                  }}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                >
                  Cancel Video Changes
                </button>
              </div>
            )}
            
            {videoAction === 'remove' ? (
              <div className="text-sm text-red-600 font-medium p-4 bg-red-50 rounded text-center">
                The video will be permanently deleted when you save these changes.
              </div>
            ) : (
              <VideoUploadCard 
                label={review.videoUrl ? 'Upload Replacement Video' : 'Upload Video'}
                value={videoFile}
                onChange={(file) => { setValue('videoFile', file, { shouldValidate: true }); }}
                maxSizeMB={100}
                error={errors.videoFile?.message as string}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
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
