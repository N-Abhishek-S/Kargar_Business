import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Fetching exact query...");
  const { data, error, count } = await supabase.from('v_active_reviews').select('*', { count: 'exact' })
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(0, 8);
  
  console.log("Data length:", data?.length);
  console.log("Count:", count);
  console.log("Error:", error);
  if (data && data.length > 0) {
    console.log("Sample:", data[0]);
  }
}

test();
