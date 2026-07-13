const pg = require('pg');
const client = new pg.Client({ connectionString: 'postgresql://postgres:kargarweb%402005@db.gufwdccyiqryisyzravk.supabase.co:5432/postgres' });
client.connect().then(async () => {
  try {
    const res = await client.query("SELECT p.proname, u.usename as owner FROM pg_proc p JOIN pg_user u ON u.usesysid = p.proowner WHERE p.proname = 'is_admin';");
    console.log(res.rows);
  } catch(e) {
    console.error(e.message);
  }
  client.end();
});
