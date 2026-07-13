const pg = require('pg');
const client = new pg.Client({ connectionString: 'postgresql://postgres:kargarweb%402005@db.gufwdccyiqryisyzravk.supabase.co:5432/postgres' });
client.connect().then(async () => {
  try {
    const res = await client.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'users'");
    console.log(res.rows);
  } catch(e) {
    console.error('ERROR:', e.message);
  }
  client.end();
});
