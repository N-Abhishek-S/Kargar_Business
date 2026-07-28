import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('c:/Users/nagar/OneDrive/Desktop/KargarWeb/frontend/.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  console.log('Fetching active reviews to see if media maps correctly...');
  const { data, error } = await supabase.from('v_active_reviews').select('*').limit(5);
  
  if (error) {
    console.error('Error fetching v_active_reviews:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No reviews found.');
    return;
  }

  const reviewIds = data.map(r => r.id);
  console.log('Fetched review IDs:', reviewIds);
  
  const { data: mediaData, error: mediaError } = await supabase
    .from('review_media')
    .select('*')
    .in('review_id', reviewIds)
    .order('created_at', { ascending: true });
    
  if (mediaError) {
    console.error('Error fetching review_media:', mediaError);
    return;
  }
  
  console.log('Fetched media:', mediaData);
}

testFetch();
