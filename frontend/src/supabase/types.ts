export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'spam' | 'archived';
export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'closed';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
        Relationships: [];
      };
      client_logos: {
        Row: {
          id: string;
          company_name: string;
          logo_url: string;
          alt_text: string;
          website: string | null;
          industry: string | null;
          priority: number;
          is_featured: boolean;
          display_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          company_name: string;
          logo_url: string;
          alt_text: string;
          website?: string | null;
          industry?: string | null;
          priority?: number;
          is_featured?: boolean;
          display_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['client_logos']['Insert']>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          customer_name: string;
          company_name: string | null;
          email: string;
          phone: string | null;
          service_id: string | null;
          location: string | null;
          rating: number;
          review_title: string;
          review_text: string;
          recommend: boolean;
          profile_image_url: string | null;
          company_logo_url: string | null;
          status: ReviewStatus;
          is_featured: boolean;
          display_order: number;
          approved_at: string | null;
          browser_info: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          customer_name: string;
          company_name?: string | null;
          email: string;
          phone?: string | null;
          service_id?: string | null;
          location?: string | null;
          rating: number;
          review_title: string;
          review_text: string;
          recommend?: boolean;
          profile_image_url?: string | null;
          company_logo_url?: string | null;
          status?: ReviewStatus;
          is_featured?: boolean;
          display_order?: number;
          browser_info?: string | null;
          metadata?: Json;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']> & {
          approved_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          subject: string;
          message: string;
          status: ContactStatus;
          priority: PriorityLevel;
          assigned_to: string | null;
          notes: string | null;
          source: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          subject: string;
          message: string;
          status?: ContactStatus;
          priority?: PriorityLevel;
          assigned_to?: string | null;
          notes?: string | null;
          source?: string;
          metadata?: Json;
        };
        Update: Partial<Database['public']['Tables']['contact_messages']['Insert']>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          is_active: boolean;
          source: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          is_active?: boolean;
          source?: string;
          unsubscribed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Insert']>;
        Relationships: [];
      };
      review_replies: {
        Row: {
          id: string;
          review_id: string;
          reply_text: string;
          status: string;
          replied_by: string | null;
          replied_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          reply_text: string;
          status?: string;
          replied_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['review_replies']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      v_active_reviews: {
        Row: {
          id: string;
          customer_name: string;
          company_name: string | null;
          rating: number;
          review_title: string;
          review_text: string;
          recommend: boolean;
          profile_image_url: string | null;
          company_logo_url: string | null;
          is_featured: boolean;
          display_order: number;
          location: string | null;
          approved_at: string | null;
          created_at: string;
          service_name: string | null;
          service_slug: string | null;
          like_count: number;
          admin_reply: string | null;
          admin_replied_at: string | null;
        };
        Relationships: [];
      };
      v_review_summary: {
        Row: {
          total_reviews: number;
          average_rating: number;
          five_star: number;
          four_star: number;
          three_star: number;
          two_star: number;
          one_star: number;
          would_recommend: number;
          featured_count: number;
        };
        Relationships: [];
      };
      v_admin_dashboard: {
        Row: {
          total_reviews: number;
          pending_reviews: number;
          approved_reviews: number;
          average_rating: number;
          total_contacts: number;
          new_contacts: number;
          total_quotes: number;
          new_quotes: number;
          active_subscribers: number;
          active_client_logos: number;
          open_reports: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      review_status: ReviewStatus;
      contact_status: ContactStatus;
      priority_level: PriorityLevel;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row'];
