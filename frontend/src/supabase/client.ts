import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index';
import type { Database } from './types';

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);
