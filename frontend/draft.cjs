const fetch = require('node-fetch');

async function login() {
  const url = 'https://gufwdccyiqryisyzravk.supabase.co/auth/v1/token?grant_type=password';
  // We need an API key. 
  // Wait, I can just use the supabase client to see if it prints more details!
}
login();
