import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Lock, PenLine, Send, Loader2, ImagePlus, X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { clsx } from 'clsx';
import { StarRating } from '@/components/ui/StarRating';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ReviewImageField } from './ReviewImageField';
import { VideoUploadCard } from './VideoUploadCard';
import { useServiceOptions, useSubmitReview } from '@/features/reviews/hooks';
import type { ReviewSubmissionPayload } from '@/types';
import { useUploadProgress, UploadProgressBar } from '@/features/reviews/video-recorder';

const duplicateWindowMs = 5 * 60 * 1000;

const imageFileSchema = z.object({
  fileName: z.string(),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().max(5 * 1024 * 1024, 'Image must be less than 5MB'),
  data: z.string(),
});

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

const videoFileSchema = z.custom<File>((val) => val instanceof File, 'Please upload a valid file')
  .refine((file) => file.size <= MAX_VIDEO_SIZE, 'Video must be less than 100MB')
  .refine((file) => {
    console.log('[Validation] Validating Blob/File:', {
      name: file.name,
      type: file.type,
      size: file.size,
      constructor: file.constructor.name,
    });
    const baseType = file.type.split(';')[0]?.trim();
    return baseType ? ACCEPTED_VIDEO_TYPES.includes(baseType) : false;
  }, 'Video must be MP4, MOV, or WebM');

const reviewFormSchema = z.object({
  customerName: z.string().trim().min(2, 'Enter your full name').max(120),
  companyName: z.string().trim().min(2, 'Enter your company name').max(160),
  email: z.string().trim().max(160).pipe(z.email('Enter a valid email address')),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\-\s\d]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  serviceId: z.string().min(1, 'Select a service'),
  location: z.string().trim().min(2, 'Enter your location').max(120),
  rating: z.number().int().min(1, 'Select a rating').max(5),
  reviewTitle: z.string().trim().min(4, 'Enter a review title').max(140),
  reviewText: z.string().trim().min(40, 'Review must be at least 40 characters').max(500),
  recommend: z.enum(['yes', 'no']),
  permissionToDisplay: z.boolean().refine(Boolean, 'Permission is required'),
  websiteTrap: z.string().max(0).optional(),
  profileImage: imageFileSchema.optional().nullable(),
  companyLogo: imageFileSchema.optional().nullable(),
  galleryImages: z.array(imageFileSchema).max(5, 'Maximum 5 gallery images allowed').optional(),
  videoFile: videoFileSchema.optional().nullable(), // File object
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

function getDuplicateTimestamp(): number {
  const value = window.localStorage.getItem('kargar_review_submitted_at');
  return value ? Number(value) : 0;
}

function currentTimestamp(): number {
  return Date.now();
}

export function ReviewSubmissionForm() {
  const { data: services, isLoading: servicesLoading } = useServiceOptions();
  const submitReview = useSubmitReview();
  const { upload, cancelUpload, progress, isUploading, isRetrying, error: uploadError } = useUploadProgress();
  const [fileError, setFileError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());

  const serviceOptions = useMemo(() => services ?? [], [services]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      customerName: '',
      companyName: '',
      email: '',
      phone: '',
      serviceId: '',
      location: '',
      rating: 5,
      reviewTitle: '',
      reviewText: '',
      recommend: 'yes',
      permissionToDisplay: true,
      websiteTrap: '',
      profileImage: null,
      companyLogo: null,
      galleryImages: [],
      videoFile: null,
    },
  });

  const rating = useWatch({ control, name: 'rating' });
  const reviewText = useWatch({ control, name: 'reviewText' });
  const profileImage = useWatch({ control, name: 'profileImage' });
  const companyLogo = useWatch({ control, name: 'companyLogo' });
  const galleryImages = useWatch({ control, name: 'galleryImages' }) ?? [];
  const videoFile = useWatch({ control, name: 'videoFile' });

  const handleImageChange = (file: File | null, fieldName: 'profileImage' | 'companyLogo') => {
    if (!file) {
      setValue(fieldName, null, { shouldValidate: true });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Image must be less than 5MB');
      return;
    }
    
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!acceptedTypes.includes(file.type)) {
      setFileError('Image must be PNG, JPG, or WEBP');
      return;
    }
    
    setFileError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setValue(fieldName, {
        fileName: file.name,
        contentType: file.type === 'image/jpg' ? 'image/jpeg' : (file.type as 'image/jpeg' | 'image/png' | 'image/webp'),
        size: file.size,
        data: dataUrl
      }, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    
    if (galleryImages.length + files.length > 5) {
      setFileError('Maximum 5 gallery images allowed');
      return;
    }

    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type));
    if (validFiles.length !== files.length) {
      setFileError('Some files were rejected. Must be <5MB and JPG/PNG/WEBP.');
    }

    const promises = validFiles.map(file => {
      return new Promise<z.infer<typeof imageFileSchema>>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            fileName: file.name,
            contentType: file.type === 'image/jpg' ? 'image/jpeg' : (file.type as 'image/jpeg' | 'image/png' | 'image/webp'),
            size: file.size,
            data: event.target?.result as string,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(results => {
      setValue('galleryImages', [...galleryImages, ...results], { shouldValidate: true });
    }).catch(console.error);
    
    e.target.value = '';
  };

  const removeGalleryImage = (index: number) => {
    const newImages = [...galleryImages];
    newImages.splice(index, 1);
    setValue('galleryImages', newImages, { shouldValidate: true });
  };

  const handleVideoChange = (file: File | null) => {
    setValue('videoFile', file, { shouldValidate: true });
  };

  const onSubmit = async (values: ReviewFormValues) => {
    if (currentTimestamp() - getDuplicateTimestamp() < duplicateWindowMs) {
      toast.error('A review was already submitted recently.');
      return;
    }

    submitReview.reset();
    setFileError(null);
    try {
      let videoData;
      if (values.videoFile) {
        videoData = await upload(values.videoFile);
      }

      const payload: ReviewSubmissionPayload = {
        customerName: values.customerName,
        companyName: values.companyName,
        email: values.email,
        phone: values.phone,
        serviceId: values.serviceId,
        location: values.location,
        rating: values.rating,
        reviewTitle: values.reviewTitle,
        reviewText: values.reviewText,
        recommend: values.recommend === 'yes',
        permissionToDisplay: values.permissionToDisplay,
        websiteTrap: values.websiteTrap,
        profileImage: values.profileImage ?? undefined,
        companyLogo: values.companyLogo ?? undefined,
        galleryImages: values.galleryImages,
        videoData,
        submissionId,
      };

      await submitReview.mutateAsync(payload);
      // Regenerate submissionId so the next submission gets a fresh idempotency key
      setSubmissionId(crypto.randomUUID());
      window.localStorage.setItem('kargar_review_submitted_at', String(currentTimestamp()));
      toast.success('Review submitted successfully! It will appear once approved by our team.', { duration: 5000 });
      reset();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Upload cancelled by user, don't show an error toast
        return;
      }
      const message = error instanceof Error ? error.message : 'Review submission failed';
      setFileError(message);
      toast.error(message);
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-8 pb-6 border-b border-gray-100">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-50 text-orange-500 shrink-0">
          <PenLine size={28} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-navy-900 tracking-tight mb-1">Share Your Experience</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your review helps other businesses make confident decisions. We'd love to hear about your experience.
          </p>
        </div>
      </div>

      <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" {...register('websiteTrap')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
        <Input 
          label="Full Name" 
          required 
          error={errors.customerName?.message} 
          placeholder="Enter your full name"
          autoComplete="name"
          {...register('customerName')} 
        />
        <Input 
          label="Company Name" 
          required 
          error={errors.companyName?.message} 
          placeholder="Enter company name"
          autoComplete="organization"
          {...register('companyName')} 
        />
        <Input 
          label="Email" 
          type="email" 
          required 
          error={errors.email?.message} 
          placeholder="Enter your email"
          autoComplete="email"
          {...register('email')} 
        />
        <Input 
          label="Phone" 
          error={errors.phone?.message} 
          placeholder="Enter your phone number (optional)"
          autoComplete="tel"
          {...register('phone')} 
        />
        <Select 
          label="Service Used" 
          required 
          error={errors.serviceId?.message} 
          disabled={servicesLoading}
          options={serviceOptions.map(s => ({ label: s.name, value: s.id }))}
          placeholder="Select service"
          {...register('serviceId')}
        />
        <Input 
          label="Location" 
          required 
          error={errors.location?.message} 
          placeholder="Enter your location"
          autoComplete="address-level2"
          {...register('location')} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
        <div className="flex w-full flex-col gap-1.5">
          <label className="text-sm font-medium leading-none text-navy-900">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center h-10 mt-1">
            <StarRating
              rating={rating}
              readonly={false}
              size={32}
              onChange={(nextRating) => {
                setValue('rating', nextRating, { shouldValidate: true });
              }}
            />
          </div>
          {errors.rating && <p className="text-sm font-medium text-red-500">{errors.rating.message}</p>}
        </div>
        
        <Input 
          label="Review Title" 
          required 
          error={errors.reviewTitle?.message} 
          placeholder="Summarize your experience in one line"
          {...register('reviewTitle')} 
        />
      </div>

      <div className="mb-8">
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex justify-between items-baseline mb-1">
            <label className="text-sm font-medium leading-none text-navy-900">
              Your Review <span className="text-red-500">*</span>
            </label>
            <span className={clsx("text-xs font-medium transition-colors", (reviewText || '').length > 480 ? "text-orange-500" : "text-gray-400")}>
              {(reviewText || '').length}/500
            </span>
          </div>
          <textarea 
            rows={4} 
            maxLength={500} 
            className={clsx(
              'flex w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 resize-none placeholder:text-gray-400', 
              errors.reviewText ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 focus-visible:border-orange-500 focus-visible:ring-orange-500/20'
            )}
            {...register('reviewText')} 
            placeholder="Tell us about your experience in detail..." 
            aria-invalid={!!errors.reviewText}
          />
          {errors.reviewText && <p className="text-sm font-medium text-red-500">{errors.reviewText.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
        <ReviewImageField 
          label="Company Logo"
          error={errors.companyLogo?.message}
          value={companyLogo}
          onChange={(file) => { handleImageChange(file, 'companyLogo'); }}
        />
        <ReviewImageField 
          label="Project / Office Image"
          error={errors.profileImage?.message}
          value={profileImage}
          onChange={(file) => { handleImageChange(file, 'profileImage'); }}
        />
      </div>

      <div className="mb-8 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
        <label className="text-sm font-medium leading-none text-navy-900 block mb-1">
          Gallery Images <span className="text-gray-400 font-normal ml-1">(Optional, up to 5)</span>
        </label>
        <p className="text-xs text-gray-500 mb-4">Share photos of the project, service outcome, or your facility.</p>
        
        {galleryImages.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200 bg-white group">
                <img src={img.data} alt={`Gallery preview ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { removeGalleryImage(idx); }}
                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {galleryImages.length < 5 && (
          <div className="relative flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 bg-white transition-all cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/jpeg, image/png, image/webp, image/jpg"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleGalleryChange}
              title="Upload gallery images"
            />
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
              <ImagePlus size={20} />
            </div>
            <p className="text-sm font-medium text-navy-900">Click or drag images to upload</p>
            <p className="text-xs text-gray-500 mt-1">Up to {5 - galleryImages.length} more images (Max 5MB each)</p>
          </div>
        )}
      </div>

      <div className="mb-8 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
        <VideoUploadCard 
          label="Video Testimonial"
          error={errors.videoFile?.message}
          value={videoFile}
          onChange={handleVideoChange}
          maxSizeMB={100}
        />
      </div>

      {fileError && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-100 text-red-600 text-sm font-medium" role="alert">
          {fileError}
        </div>
      )}
      
      {submitReview.isSuccess && !fileError && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2" role="status">
          <CheckCircle2 size={18} /> Review submitted successfully!
        </div>
      )}

      <div className="bg-orange-50/50 -mx-6 md:-mx-8 px-6 md:px-8 py-6 mb-8 mt-4 rounded-xl border border-orange-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Lock size={120} />
        </div>
        
        <h4 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-orange-500" />
          Data & Privacy
        </h4>
        
        <div className="space-y-4 relative z-10">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-white bg-white/50 hover:bg-white transition-colors cursor-pointer group">
            <div className="mt-0.5 shrink-0">
              <input 
                type="checkbox" 
                {...register('permissionToDisplay')}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500/20"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-navy-900 mb-0.5">I grant permission to use this review</p>
              <p className="text-xs text-gray-500">I allow Kargar Construction to use my review and media for marketing purposes on their website and social media.</p>
              {errors.permissionToDisplay && (
                <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                  ⚠ {errors.permissionToDisplay.message}
                </p>
              )}
            </div>
          </label>
        </div>
      </div>

      {isUploading && progress && (
        <div className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
          <UploadProgressBar 
            progress={progress} 
            isRetrying={isRetrying} 
            onCancel={cancelUpload} 
          />
          {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isUploading ? 'Uploading Video...' : 'Submitting Review...'}
            </>
          ) : (
            <>
              Submit Review
              <Send size={18} className="ml-1" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
