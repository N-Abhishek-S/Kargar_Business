const pg = require('pg');
const client = new pg.Client({ connectionString: 'postgresql://postgres:kargarweb%402005@db.gufwdccyiqryisyzravk.supabase.co:5432/postgres' });
client.connect().then(async () => {
  try {
    await client.query("UPDATE auth.users SET confirmation_token = '' WHERE confirmation_token IS NULL");
    await client.query("UPDATE auth.users SET email_change = '' WHERE email_change IS NULL");
    await client.query("UPDATE auth.users SET email_change_token_new = '' WHERE email_change_token_new IS NULL");
    await client.query("UPDATE auth.users SET recovery_token = '' WHERE recovery_token IS NULL");
    await client.query("UPDATE auth.users SET email_change_token_current = '' WHERE email_change_token_current IS NULL");
    await client.query("UPDATE auth.users SET reauthentication_token = '' WHERE reauthentication_token IS NULL");
    await client.query("UPDATE auth.users SET phone_change = '' WHERE phone_change IS NULL");
    await client.query("UPDATE auth.users SET phone_change_token = '' WHERE phone_change_token IS NULL");
    
    console.log('Fixed NULL values in auth.users!');
  } catch(e) {
    console.error('ERROR:', e.message);
  }
  client.end();
});
