import type { ImgHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export const BRAND_LOGO_SRC = '/images/brand/kargar-logo.png';

type BrandLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  imageClassName?: string;
};

export function BrandLogo({
  alt = 'Kargar - Window to a Cleaner World',
  className,
  imageClassName,
  loading = 'eager',
  decoding = 'async',
  ...props
}: BrandLogoProps) {
  return (
    <span className={clsx('inline-flex w-full shrink-0 items-center', className)}>
      <img
        src={BRAND_LOGO_SRC}
        alt={alt}
        width={793}
        height={274}
        loading={loading}
        decoding={decoding}
        className={clsx('block h-auto w-full object-contain', imageClassName)}
        {...props}
      />
    </span>
  );
}
