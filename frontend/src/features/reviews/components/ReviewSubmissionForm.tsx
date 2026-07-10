import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Lock, PenLine, Send } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { StarRating } from '@/components/ui/StarRating';
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'profileImage' | 'companyLogo') => {
    const file = e.target.files?.[0];
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
      setFileError('Image must be PNG, JPG, JPEG, or WEBP');
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
      
      const fileInputs = document.querySelectorAll('.kb-review-form input[type="file"]');
      fileInputs.forEach((input) => {
        (input as HTMLInputElement).value = '';
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Review submission failed';
      setFileError(message);
      toast.error(message);
    }
  };

  return (
    <form className="kb-review-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="kb-review-form__head">
        <span aria-hidden="true"><PenLine size={34} /></span>
        <div>
          <h3>Share Your Experience</h3>
          <p>Your review helps other businesses make confident decisions. We'd love to hear about your experience.</p>
        </div>
      </div>

      <input type="text" tabIndex={-1} autoComplete="off" className="kb-hp-field" {...register('websiteTrap')} />

      <div className="kb-review-form__grid">
        <label>
          Full Name <b>*</b>
          <input {...register('customerName')} autoComplete="name" placeholder="Enter your full name" />
          {errors.customerName ? <span>{errors.customerName.message}</span> : null}
        </label>
        <label>
          Company Name <b>*</b>
          <input {...register('companyName')} autoComplete="organization" placeholder="Enter company name" />
          {errors.companyName ? <span>{errors.companyName.message}</span> : null}
        </label>
        <label>
          Email <b>*</b>
          <input type="email" {...register('email')} autoComplete="email" placeholder="Enter your email" />
          {errors.email ? <span>{errors.email.message}</span> : null}
        </label>
        <label>
          Phone
          <input {...register('phone')} autoComplete="tel" placeholder="Enter your phone number" />
          {errors.phone ? <span>{errors.phone.message}</span> : null}
        </label>
        <label>
          Service Used <b>*</b>
          <select {...register('serviceId')} disabled={servicesLoading}>
            <option value="">Select service</option>
            {serviceOptions.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          {errors.serviceId ? <span>{errors.serviceId.message}</span> : null}
        </label>
        <label>
          Location <b>*</b>
          <input {...register('location')} autoComplete="address-level2" placeholder="Enter your location" />
          {errors.location ? <span>{errors.location.message}</span> : null}
        </label>
      </div>

      <fieldset className="kb-review-form__rating">
        <legend>Rating <b>*</b></legend>
        <StarRating
          rating={rating}
          readonly={false}
          size={26}
          onChange={(nextRating) => {
            setValue('rating', nextRating, { shouldValidate: true });
          }}
        />
        <small>(Select rating)</small>
        {errors.rating ? <span>{errors.rating.message}</span> : null}
      </fieldset>

      <label>
        Review Title <b>*</b>
        <input {...register('reviewTitle')} placeholder="Summarize your experience in one line" />
        {errors.reviewTitle ? <span>{errors.reviewTitle.message}</span> : null}
      </label>

      <label>
        Your Review <b>*</b>
        <textarea rows={5} maxLength={500} {...register('reviewText')} placeholder="Tell us about your experience..." />
        <small>{(reviewText || '').length}/500</small>
        {errors.reviewText ? <span>{errors.reviewText.message}</span> : null}
      </label>

      <div className="kb-review-form__grid">
        <label>
          Company Logo (Optional)
          <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => {
            handleImageUpload(e, 'companyLogo');
          }} />
          <small>Max 5MB (PNG, JPG, WEBP)</small>
          {errors.companyLogo ? <span>{errors.companyLogo.message}</span> : null}
        </label>
        <label>
          Project / Office Image (Optional)
          <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => {
            handleImageUpload(e, 'profileImage');
          }} />
          <small>Max 5MB (PNG, JPG, WEBP)</small>
          {errors.profileImage ? <span>{errors.profileImage.message}</span> : null}
        </label>
      </div>

      {fileError ? <div className="kb-review-form__error" role="alert">{fileError}</div> : null}
      {submitReview.isSuccess ? (
        <div className="kb-review-form__success" role="status">
          <CheckCircle2 size={18} /> Review submitted successfully.
        </div>
      ) : null}

      <button className="kb-btn kb-btn--primary" type="submit" disabled={isSubmitting || submitReview.isPending}>
        <Send size={19} /> {isSubmitting || submitReview.isPending ? 'Submitting...' : 'Submit Review'}
      </button>
      <small className="kb-review-form__privacy"><Lock size={15} /> Your information is safe and will not be shared publicly.</small>
    </form>
  );
}
