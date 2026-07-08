import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ImagePlus, Lock, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { StarRating } from '@/components/ui/StarRating';
import { useServiceOptions, useSubmitReview } from '@/features/reviews/hooks';
import type { ReviewImageUpload, ReviewSubmissionPayload } from '@/types';

const duplicateWindowMs = 5 * 60 * 1000;
const profileMaxBytes = 3 * 1024 * 1024;
const logoMaxBytes = 5 * 1024 * 1024;
const profileTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
const logoTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] as const;

const reviewFormSchema = z.object({
  customerName: z.string().trim().min(2, 'Enter your full name').max(120),
  companyName: z.string().trim().max(160).optional(),
  email: z.string().trim().email('Enter a valid email address').max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\-\s\d]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  serviceId: z.string().uuid('Select a service'),
  location: z.string().trim().max(120).optional(),
  rating: z.number().int().min(1, 'Select a rating').max(5),
  reviewTitle: z.string().trim().min(4, 'Enter a review title').max(140),
  reviewText: z.string().trim().min(40, 'Review must be at least 40 characters').max(1500),
  recommend: z.enum(['yes', 'no']),
  permissionToDisplay: z.boolean().refine(Boolean, 'Permission is required'),
  websiteTrap: z.string().max(0).optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;
type UploadKind = 'profile' | 'logo';

function isAllowedContentType(
  value: string,
  allowedTypes: readonly string[],
): value is ReviewImageUpload['contentType'] {
  return allowedTypes.includes(value);
}

function getDuplicateTimestamp(): number {
  const value = window.localStorage.getItem('kargar_review_submitted_at');
  return value ? Number(value) : 0;
}

async function compressRasterImage(file: File, maxDimension: number): Promise<Blob> {
  if (file.type === 'image/svg+xml') return file;

  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    image.onload = () => {
      resolve();
    };
    image.onerror = () => {
      reject(new Error('Image could not be read'));
    };
    image.src = objectUrl;
  });

  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    URL.revokeObjectURL(objectUrl);
    return file;
  }

  context.drawImage(image, 0, 0, width, height);
  URL.revokeObjectURL(objectUrl);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, file.type, 0.84);
  });

  return blob && blob.size < file.size ? blob : file;
}

async function fileToUpload(file: File, kind: UploadKind): Promise<ReviewImageUpload> {
  const allowedTypes = kind === 'profile' ? profileTypes : logoTypes;
  const maxBytes = kind === 'profile' ? profileMaxBytes : logoMaxBytes;

  if (!isAllowedContentType(file.type, allowedTypes)) {
    throw new Error(kind === 'profile' ? 'Profile photo must be JPG, PNG, or WebP' : 'Logo must be JPG, PNG, WebP, or SVG');
  }
  if (file.size > maxBytes) {
    throw new Error(kind === 'profile' ? 'Profile photo must be under 3 MB' : 'Company logo must be under 5 MB');
  }

  const optimized = await compressRasterImage(file, kind === 'profile' ? 900 : 1400);
  if (optimized.size > maxBytes) {
    throw new Error(kind === 'profile' ? 'Profile photo is too large' : 'Company logo is too large');
  }

  const contentType = optimized.type || file.type;
  if (!isAllowedContentType(contentType, allowedTypes)) {
    throw new Error('Unsupported image type');
  }

  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Image could not be encoded'));
    };
    reader.onerror = () => {
      reject(new Error('Image could not be encoded'));
    };
    reader.readAsDataURL(optimized);
  });

  return {
    fileName: file.name,
    contentType,
    size: optimized.size,
    data,
  };
}

export function ReviewSubmissionForm() {
  const { data: services, isLoading: servicesLoading } = useServiceOptions();
  const submitReview = useSubmitReview();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const serviceOptions = useMemo(() => services ?? [], [services]);
  const duplicateBlocked = Date.now() - getDuplicateTimestamp() < duplicateWindowMs;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
    },
  });

  const rating = watch('rating');
  const reviewText = watch('reviewText');

  const handleFileChange = (kind: UploadKind, fileList: FileList | null) => {
    setFileError(null);
    const file = fileList?.item(0) ?? null;
    if (!file) {
      if (kind === 'profile') setProfileImage(null);
      else setCompanyLogo(null);
      return;
    }

    const allowedTypes = kind === 'profile' ? profileTypes : logoTypes;
    const maxBytes = kind === 'profile' ? profileMaxBytes : logoMaxBytes;

    if (!isAllowedContentType(file.type, allowedTypes)) {
      setFileError(kind === 'profile' ? 'Profile photo must be JPG, PNG, or WebP' : 'Logo must be JPG, PNG, WebP, or SVG');
      return;
    }
    if (file.size > maxBytes) {
      setFileError(kind === 'profile' ? 'Profile photo must be under 3 MB' : 'Company logo must be under 5 MB');
      return;
    }

    if (kind === 'profile') setProfileImage(file);
    else setCompanyLogo(file);
  };

  const onSubmit = async (values: ReviewFormValues) => {
    if (duplicateBlocked) {
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
      };

      if (profileImage) payload.profileImage = await fileToUpload(profileImage, 'profile');
      if (companyLogo) payload.companyLogo = await fileToUpload(companyLogo, 'logo');

      await submitReview.mutateAsync(payload);
      window.localStorage.setItem('kargar_review_submitted_at', String(Date.now()));
      toast.success('Review submitted for approval.');
      reset();
      setProfileImage(null);
      setCompanyLogo(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Review submission failed';
      setFileError(message);
      toast.error(message);
    }
  };

  return (
    <form className="kb-review-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <h3>Share Your Experience</h3>
        <p>Your review is sent to the Kargar team for verification before it appears publicly.</p>
      </div>

      <input type="text" tabIndex={-1} autoComplete="off" className="kb-hp-field" {...register('websiteTrap')} />

      <div className="kb-review-form__grid">
        <label>
          Full Name <b>*</b>
          <input {...register('customerName')} autoComplete="name" />
          {errors.customerName ? <span>{errors.customerName.message}</span> : null}
        </label>
        <label>
          Company Name
          <input {...register('companyName')} autoComplete="organization" />
          {errors.companyName ? <span>{errors.companyName.message}</span> : null}
        </label>
        <label>
          Email <b>*</b>
          <input type="email" {...register('email')} autoComplete="email" />
          {errors.email ? <span>{errors.email.message}</span> : null}
        </label>
        <label>
          Phone
          <input {...register('phone')} autoComplete="tel" />
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
          Location
          <input {...register('location')} autoComplete="address-level2" />
          {errors.location ? <span>{errors.location.message}</span> : null}
        </label>
      </div>

      <fieldset className="kb-review-form__rating">
        <legend>Rating <b>*</b></legend>
        <StarRating rating={rating} readonly={false} size={26} onChange={(nextRating) => setValue('rating', nextRating, { shouldValidate: true })} />
        {errors.rating ? <span>{errors.rating.message}</span> : null}
      </fieldset>

      <label>
        Review Title <b>*</b>
        <input {...register('reviewTitle')} />
        {errors.reviewTitle ? <span>{errors.reviewTitle.message}</span> : null}
      </label>

      <label>
        Review Description <b>*</b>
        <textarea rows={5} maxLength={1500} {...register('reviewText')} />
        <small>{reviewText.length}/1500</small>
        {errors.reviewText ? <span>{errors.reviewText.message}</span> : null}
      </label>

      <fieldset className="kb-review-form__choice">
        <legend>Would Recommend?</legend>
        <label><input type="radio" value="yes" {...register('recommend')} /> Yes</label>
        <label><input type="radio" value="no" {...register('recommend')} /> No</label>
      </fieldset>

      <div className="kb-review-form__uploads">
        <label>
          <ImagePlus size={18} />
          Upload Company Logo
          <input type="file" accept={logoTypes.join(',')} onChange={(event) => handleFileChange('logo', event.currentTarget.files)} />
          {companyLogo ? <small>{companyLogo.name}</small> : null}
        </label>
        <label>
          <ImagePlus size={18} />
          Upload Profile Photo
          <input type="file" accept={profileTypes.join(',')} onChange={(event) => handleFileChange('profile', event.currentTarget.files)} />
          {profileImage ? <small>{profileImage.name}</small> : null}
        </label>
      </div>

      <label className="kb-review-form__permission">
        <input type="checkbox" {...register('permissionToDisplay')} />
        <span>Permission to display review</span>
      </label>
      {errors.permissionToDisplay ? <span className="kb-review-form__error">{errors.permissionToDisplay.message}</span> : null}

      {fileError ? <div className="kb-review-form__error" role="alert">{fileError}</div> : null}
      {submitReview.isSuccess ? (
        <div className="kb-review-form__success" role="status">
          <CheckCircle2 size={18} /> Review received. It will appear after approval.
        </div>
      ) : null}

      <button className="kb-btn kb-btn--primary" type="submit" disabled={isSubmitting || submitReview.isPending || duplicateBlocked}>
        {isSubmitting || submitReview.isPending ? 'Submitting...' : 'Submit Review'} <Send size={18} />
      </button>
      <small className="kb-review-form__privacy"><Lock size={15} /> Your contact details remain private.</small>
    </form>
  );
}
