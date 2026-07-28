import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('--- v_active_reviews ---');
  const { data: viewData, error: viewError } = await supabase.from('v_active_reviews').select('*').limit(3);
  console.log(JSON.stringify(viewData, null, 2));

  console.log('\n--- reviews table ---');
  const { data: tableData, error: tableError } = await supabase.from('reviews').select('*').limit(3);
  console.log(JSON.stringify(tableData, null, 2));
  
  console.log('\n--- review_media ---');
  const { data: mediaData, error: mediaError } = await supabase.from('review_media').select('*').limit(3);
  console.log(JSON.stringify(mediaData, null, 2));
}

run();
