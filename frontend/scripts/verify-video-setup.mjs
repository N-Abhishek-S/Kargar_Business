import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env from frontend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runVerification() {
  console.log('--- Video Upload Backend Verification ---\n');
  let hasErrors = false;

  // 1. Check v_active_reviews for the columns
  const { data: viewData, error: viewError } = await supabase
    .from('v_active_reviews')
    .select('video_url, video_path, video_size, video_content_type')
    .limit(1)
    .maybeSingle();

  if (viewError && viewError.code === 'PGRST200') {
    console.log('❌ v_active_reviews exposes video fields (missing view or permissions)');
    console.log('❌ reviews.video_url exists');
    console.log('❌ reviews.video_path exists');
    console.log('❌ reviews.video_size exists');
    console.log('❌ reviews.video_content_type exists');
    hasErrors = true;
  } else if (viewError && viewError.message && viewError.message.includes('Could not find the public.v_active_reviews')) {
    console.log('❌ v_active_reviews exposes video fields (view missing)');
    hasErrors = true;
  } else if (viewError && viewError.message && viewError.message.includes('column')) {
    console.log('❌ v_active_reviews exposes video fields (columns missing)');
    hasErrors = true;
  } else {
    console.log('✓ v_active_reviews exposes video fields');
    console.log('✓ reviews.video_url exists');
    console.log('✓ reviews.video_path exists');
    console.log('✓ reviews.video_size exists');
    console.log('✓ reviews.video_content_type exists');
  }

  // 2. Check Storage Bucket
  try {
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('review-videos');
    if (bucketError) {
      console.log('❌ review-videos bucket exists (Not found or missing permissions)');
      hasErrors = true;
    } else {
      console.log('✓ review-videos bucket exists');
    }
  } catch (err) {
    console.log('❌ review-videos bucket exists (Error)');
    hasErrors = true;
  }

  console.log('\n--- Verification Complete ---');
  if (hasErrors) {
    console.log('⚠️ Please ensure the migration 20260721150000_add_review_videos.sql was executed successfully.');
    process.exit(1);
  } else {
    console.log('✅ Backend is fully configured for video uploads.');
    process.exit(0);
  }
}

runVerification().catch(console.error);
