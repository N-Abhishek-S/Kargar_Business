const pg = require('pg');
const client = new pg.Client({ connectionString: 'postgresql://postgres:kargarweb%402005@db.gufwdccyiqryisyzravk.supabase.co:5432/postgres' });
client.connect().then(async () => {
  try {
    const res = await client.query("SELECT trigger_name, event_manipulation, event_object_schema, event_object_table, action_statement FROM information_schema.triggers WHERE event_object_schema = 'auth'");
    console.log('Triggers on Auth schema:', res.rows);
  } catch (err) {
    console.error('Error triggers:', err.message);
  }
  try {
    const res2 = await client.query("SELECT routine_schema, routine_name FROM information_schema.routines WHERE routine_name ILIKE '%custom_access_token%'");
    console.log('Routines:', res2.rows);
  } catch (err) {
    console.error('Error routines:', err.message);
  }
  client.end();
});
