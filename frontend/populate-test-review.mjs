import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const dbUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseKey || !dbUrl) {
  console.error('Missing credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const pool = new pg.Pool({ connectionString: dbUrl });

async function uploadFile(bucket, filePath, destPath, contentType) {
  const fileData = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(destPath, fileData, {
      contentType,
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) throw error;
  
  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(destPath);
    
  return publicData.publicUrl;
}

async function run() {
  try {
    const ts = Date.now();
    console.log('1. Uploading Profile Photo...');
    const profileUrl = await uploadFile(
      'review-images', 
      'C:/Users/nagar/.gemini/antigravity-ide/brain/ac627d23-6ca1-4883-80bd-2e6601130f9c/profile_photo_1785239489198.png', 
      `profile-images/test/profile_${ts}.png`, 
      'image/png'
    );
    
    console.log('2. Uploading Company Logo...');
    const logoUrl = await uploadFile(
      'review-images', 
      'C:/Users/nagar/.gemini/antigravity-ide/brain/ac627d23-6ca1-4883-80bd-2e6601130f9c/company_logo_1785239506691.png', 
      `profile-images/test/logo_${ts}.png`, 
      'image/png'
    );

    console.log('3. Inserting Review Record via pg...');
    const insertReviewQuery = `
      INSERT INTO reviews (customer_name, company_name, email, rating, review_title, review_text, status, profile_image_url, company_logo_url, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6, 'approved', $7, $8, true)
      RETURNING id
    `;
    const reviewResult = await pool.query(insertReviewQuery, [
      'Test E2E User',
      'E2E Testing Corp',
      'test@example.com',
      5,
      'Full Media Test',
      'This is a test review populated by the script to verify the 9-phase media pipeline.',
      profileUrl,
      logoUrl
    ]);

    const reviewId = reviewResult.rows[0].id;
    console.log('Inserted review ID:', reviewId);

    console.log('4. Uploading 5 Gallery Images...');
    const galleryPaths = ['gallery_1.png', 'gallery_2.png', 'gallery_3.png', 'gallery_4.png', 'gallery_5.png'];
    for (let i = 0; i < galleryPaths.length; i++) {
      const gUrl = await uploadFile(
        'review-images',
        galleryPaths[i],
        `gallery-images/${reviewId}/${i}_${ts}.png`,
        'image/png'
      );
      
      await pool.query(
        'INSERT INTO review_media (review_id, media_type, media_url, content_type, file_size) VALUES ($1, $2, $3, $4, $5)',
        [reviewId, 'gallery', gUrl, 'image/png', fs.statSync(galleryPaths[i]).size]
      );
    }

    console.log('5. Uploading Video Testimonial...');
    const videoUrl = await uploadFile(
      'review-videos',
      'sample_video.mp4',
      `videos/${reviewId}/testimonial_${ts}.mp4`,
      'video/mp4'
    );
    
    await pool.query(
      'INSERT INTO review_media (review_id, media_type, media_url, content_type, file_size) VALUES ($1, $2, $3, $4, $5)',
      [reviewId, 'video', videoUrl, 'video/mp4', fs.statSync('sample_video.mp4').size]
    );

    console.log('SUCCESS! Review with all media created and approved.');
    console.log('Check the homepage to verify the rendering!');
  } catch (err) {
    console.error('Error populating review:', err);
  } finally {
    await pool.end();
  }
}

run();
