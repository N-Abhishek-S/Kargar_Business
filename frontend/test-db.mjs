import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function run() {
  console.log('--- checking raw reviews table for ANY video_url ---');
  const { data: rawReviews, error: rawError } = await supabase.from('reviews')
    .select('id, profile_image_url, company_logo_url, video_url, profile_image, company_logo, video_path')
    .not('video_url', 'is', null)
    .limit(5);
  if (rawError) console.error(rawError);
  console.log(JSON.stringify(rawReviews, null, 2));

  console.log('--- checking v_active_reviews ---');
  const { data: viewReviews, error: viewError } = await supabase.from('v_active_reviews')
    .select('id, profile_image_url, company_logo_url, video_url')
    .order('created_at', { ascending: false })
    .limit(5);
  if (viewError) console.error(viewError);
  console.log(JSON.stringify(viewReviews, null, 2));

  console.log('\n--- recent review_media ---');
  const { data: mediaData, error: mediaError } = await supabase.from('review_media').select('*');
  if (mediaError) console.error(mediaError);
  console.log(JSON.stringify(mediaData, null, 2));
}

run();
