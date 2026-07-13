const pg = require('pg');
const client = new pg.Client({ connectionString: 'postgresql://postgres:kargarweb%402005@db.gufwdccyiqryisyzravk.supabase.co:5432/postgres' });
client.connect().then(async () => {
  const { rows } = await client.query("SELECT id FROM auth.users WHERE email = 'kargaradmin@kargarfm.com'");
  if (rows.length > 0) {
    const id = rows[0].id;
    await client.query("INSERT INTO public.admin_users (id, role, is_active) VALUES ($1, 'admin', true) ON CONFLICT DO NOTHING", [id]);
    console.log('Admin user added to public.admin_users');
  } else {
    console.log('User not found in auth.users');
  }
  client.end();
});
