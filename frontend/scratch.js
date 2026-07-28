import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('reviews')
    .select('customer_name, profile_image, profile_image_url, company_logo, company_logo_url, video_path, video_url')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error('Error fetching reviews:', error);
    process.exit(1);
  }
  console.log('Latest reviews:', JSON.stringify(data, null, 2));
}

test();
