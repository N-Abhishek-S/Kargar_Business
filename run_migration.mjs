import pg from 'pg';
const { Client } = pg;

const client = new Client({
  user: 'postgres',
  password: 'kargarweb%402005',
  host: 'db.gufwdccyiqryisyzravk.supabase.co',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log("Connected to Supabase.");

  try {
    await client.query(`
      -- Drop existing policies if any
      DROP POLICY IF EXISTS "Anyone can insert review media for pending reviews" ON public.review_media;
      
      -- Grant insert to anon
      GRANT INSERT ON public.review_media TO anon;
      
      -- Allow anon users to insert media if the associated review is pending
      CREATE POLICY "Anyone can insert review media for pending reviews"
        ON public.review_media FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.reviews r
            WHERE r.id = review_media.review_id
              AND r.status = 'pending'
          )
        );
    `);
    console.log("Successfully created RLS policy and granted permissions.");
  } catch(e) {
    console.error("Error executing SQL:", e);
  } finally {
    await client.end();
  }
}

run();
