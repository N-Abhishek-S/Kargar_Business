const pg = require('pg');
const client = new pg.Client({ connectionString: 'postgresql://postgres:kargarweb%402005@db.gufwdccyiqryisyzravk.supabase.co:5432/postgres' });
client.connect().then(async () => {
  try {
    await client.query('SET ROLE supabase_auth_admin');
    console.log('Role set to supabase_auth_admin');
    const res = await client.query("SELECT * FROM auth.users WHERE email = 'kargaradmin@kargarfm.com'");
    console.log('User found:', !!res.rows[0]);
    
    // Simulate updating last_sign_in_at
    await client.query("UPDATE auth.users SET last_sign_in_at = now() WHERE id = $1", [res.rows[0].id]);
    console.log('Update succeeded');
  } catch(e) {
    console.error('ERROR as auth_admin:', e.message);
  }
  client.end();
});
