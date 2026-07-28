import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Inserting a fake review...");
  const { data: review, error: reviewError } = await supabase.from('reviews').insert({
    customer_name: 'Test User',
    email: 'test@example.com',
    rating: 5,
    review_title: 'Test Title',
    review_text: 'This is a test review text that is long enough.',
    status: 'pending'
  }).select('id').single();

  if (reviewError) {
    console.error("Failed to insert review:", reviewError);
    return;
  }

  console.log("Inserted review with ID:", review.id);

  console.log("Attempting to insert review media...");
  const { error: mediaError } = await supabase.from('review_media').insert([{
    review_id: review.id,
    bucket: 'review-images',
    path: 'test/path.jpg',
    public_url: 'http://example.com/path.jpg',
    media_type: 'review_image',
    content_type: 'image/jpeg',
    file_size: 1024
  }]);

  if (mediaError) {
    console.error("Failed to insert media:", mediaError);
  } else {
    console.log("Media inserted successfully!");
  }
}

test();
