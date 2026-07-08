import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Supabase client for server-side operations.
 * Uses the service_role key for full database access (bypasses RLS).
 * Only used server-side — never exposed to the frontend.
 */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
