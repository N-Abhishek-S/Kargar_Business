import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:kargarweb%402005@db.gufwdccyiqryisyzravk.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to database...");

    await client.query("DELETE FROM auth.users WHERE email = 'kargaradmin@kargarfm.com'");
    
    const res = await client.query(
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'kargaradmin@kargarfm.com',
        crypt('Abhishek@2005', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"],"role":"admin"}',
        '{}',
        false
      ) RETURNING id;
    );
    
    const userId = res.rows[0].id;
    await client.query(
      INSERT INTO auth.identities (
        provider_id,
        user_id,
        identity_data,
        provider,
        created_at,
        updated_at,
        id
      ) VALUES (
        ,
        ,
        ,
        'email',
        current_timestamp,
        current_timestamp,
        gen_random_uuid()
      );
    , [userId, JSON.stringify({ sub: userId, email: 'kargaradmin@kargarfm.com' })]);

    console.log("Successfully created admin user");
    
    // Create a non-admin user
    const res2 = await client.query(
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'nonadmin@kargarfm.com',
        crypt('Password123!', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}',
        '{}',
        false
      ) RETURNING id;
    );
    
    const userId2 = res2.rows[0].id;
    await client.query(
      INSERT INTO auth.identities (
        provider_id,
        user_id,
        identity_data,
        provider,
        created_at,
        updated_at,
        id
      ) VALUES (
        ,
        ,
        ,
        'email',
        current_timestamp,
        current_timestamp,
        gen_random_uuid()
      );
    , [userId2, JSON.stringify({ sub: userId2, email: 'nonadmin@kargarfm.com' })]);

    console.log("Successfully created non-admin user");

  } catch(e) {
    console.error("Error executing query:", e);
  } finally {
    await client.end();
  }
}
run();
