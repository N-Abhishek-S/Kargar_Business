import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Lock, PenLine, Send, Loader2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { clsx } from 'clsx';
import { StarRating } from '@/components/ui/StarRating';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ImageUploadCard } from '@/components/ui/ImageUploadCard';
import { useServiceOptions, useSubmitReview } from '@/features/reviews/hooks';
import type { ReviewSubmissionPayload } from '@/types';

const duplicateWindowMs = 5 * 60 * 1000;

const imageFileSchema = z.object({
  fileName: z.string(),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  size: z.number().max(5 * 1024 * 1024, 'Image must be less than 5MB'),
  data: z.string(),
});

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
  const [fileError, setFileError] = useState<string | null>(null);

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
    },
  });

  const rating = useWatch({ control, name: 'rating' });
  const reviewText = useWatch({ control, name: 'reviewText' });
  const profileImage = useWatch({ control, name: 'profileImage' });
  const companyLogo = useWatch({ control, name: 'companyLogo' });

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
        contentType: file.type === 'image/jpg' ? 'image/jpeg' : (file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/svg+xml'),
        size: file.size,
        data: dataUrl
      }, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: ReviewFormValues) => {
    if (currentTimestamp() - getDuplicateTimestamp() < duplicateWindowMs) {
      toast.error('A review was already submitted recently.');
      return;
    }

    setFileError(null);
    try {
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
      };

      await submitReview.mutateAsync(payload);
      window.localStorage.setItem('kargar_review_submitted_at', String(currentTimestamp()));
      toast.success('Review submitted successfully! It will appear once approved by our team.', { duration: 5000 });
      reset();
    } catch (error) {
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
        <ImageUploadCard 
          label="Company Logo"
          error={errors.companyLogo?.message}
          value={companyLogo}
          onChange={(file) => { handleImageChange(file, 'companyLogo'); }}
        />
        <ImageUploadCard 
          label="Project / Office Image"
          error={errors.profileImage?.message}
          value={profileImage}
          onChange={(file) => { handleImageChange(file, 'profileImage'); }}
        />
      </div>

      {fileError && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-100 text-red-600 text-sm font-medium" role="alert">
          {fileError}
        </div>
      )}
      
      {submitReview.isSuccess && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2" role="status">
          <CheckCircle2 size={18} /> Review submitted successfully!
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-5 pt-6 border-t border-gray-100">
        <button 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0" 
          type="submit" 
          disabled={isSubmitting || submitReview.isPending}
        >
          {isSubmitting || submitReview.isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
          ) : (
            <><Send className="w-5 h-5" /> Submit Review</>
          )}
        </button>
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 w-full sm:w-auto">
          <Lock size={16} className="text-gray-400" />
          <span>Your information is securely stored and never shared publicly.</span>
        </div>
      </div>
    </form>
  );
}
