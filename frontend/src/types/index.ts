/**
 * Shared TypeScript types used across the application.
 * Feature-specific types live in their respective feature folders.
 */

/** Navigation item for navbar/footer */
export interface NavItem {
  label: string;
  href: string;
  sectionId?: string;
}

/** Social media link */
export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

/** Image configuration for the centralized image system */
export interface ImageConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl?: string;
  fallback?: string;
  sizes?: string;
  priority?: boolean;
}

/** Company statistics */
export interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon?: string;
}

/** Review/testimonial from the database */
export interface Review {
  id: string;
  name: string;
  designation: string;
  company: string;
  email: string;
  location: string | null;
  rating: number;
  review: string;
  photo_url: string | null;
  project_type: string | null;
  would_recommend: boolean;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  is_hidden: boolean;
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
}

/** Public review displayed on the homepage */
export interface PublicReview {
  id: string;
  customerName: string;
  companyName: string;
  serviceName: string;
  location: string | null;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  recommend: boolean;
  profileImage: string | null;
  companyLogo: string | null;
  verified: boolean;
  featured: boolean;
  createdAt: string;
  approvedAt: string | null;
  reply: {
    text: string;
    repliedAt: string;
  } | null;
}

/** Aggregate public review metrics */
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  recommendationRate: number;
}

/** Review image payload uploaded to Supabase Storage */
export interface ReviewImageUpload {
  fileName: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/svg+xml';
  size: number;
  data: string;
}

/** Review submission payload */
export interface ReviewSubmissionPayload {
  customerName: string;
  companyName?: string;
  email: string;
  phone?: string;
  serviceId: string;
  location?: string;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  recommend: boolean;
  permissionToDisplay: boolean;
  profileImage?: ReviewImageUpload;
  companyLogo?: ReviewImageUpload;
  websiteTrap?: string;
}

/** Public service option from the database */
export interface ServiceOption {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

/** Client logo from the database */
export interface ClientLogo {
  id: string;
  companyName: string;
  logoUrl: string;
  altText: string;
  website: string | null;
  industry: string | null;
  priority: number;
  featured: boolean;
}

/** Review record used by the admin moderation UI */
export interface AdminReview extends PublicReview {
  email: string | null;
  phone: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'spam' | 'archived';
  approved: boolean;
  displayOrder: number;
}

/** Admin dashboard summary */
export interface AdminDashboardSummary {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  averageRating: number;
  totalContacts: number;
  newContacts: number;
  totalSubscribers: number;
}

/** Contact form submission */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Newsletter subscriber */
export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

/** Site settings from the database */
export interface SiteSettings {
  hero: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  stats: {
    years: number;
    sites: number;
    employees: number;
    clients: number;
  };
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

/** Service item */
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'soft' | 'hard' | 'support';
  features: string[];
}

/** Industry item */
export interface Industry {
  id: string;
  title: string;
  description: string;
  icon: string;
}

/** FAQ item */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

/** Case study */
export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  industry: string;
  image: ImageConfig;
  stats: {
    label: string;
    before: string;
    after: string;
  }[];
}

/** Process step */
export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

/** Admin dashboard stats */
export interface DashboardStats {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  totalContacts: number;
  newContacts: number;
  totalSubscribers: number;
  recentReviews: Review[];
  recentContacts: ContactMessage[];
}

/** Pagination params */
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
