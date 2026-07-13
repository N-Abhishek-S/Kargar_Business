const pg = require('pg');
const client = new pg.Client({ connectionString: 'postgresql://postgres:kargarweb%402005@db.gufwdccyiqryisyzravk.supabase.co:5432/postgres' });
client.connect().then(async () => {
  try {
    const res = await client.query("SELECT * FROM auth.users LIMIT 1");
    if (res.rows.length > 0) {
      console.log('User id:', res.rows[0].id);
      await client.query("UPDATE auth.users SET last_sign_in_at = now() WHERE id = $1", [res.rows[0].id]);
      console.log('Update auth.users succeeded!');
    }
  } catch(e) {
    console.error('ERROR updating auth.users:', e.message);
  }
  client.end();
});
