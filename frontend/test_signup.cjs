const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://gufwdccyiqryisyzravk.supabase.co', 'sb_publishable_tcBloyuRRkUF3raZrF018A_1O2S36RS');
async function testSignUp() {
  const { data, error } = await supabase.auth.signUp({
    email: 'kargaradmin2@kargarfm.com',
    password: 'Abhishek@2005'
  });
  console.log('SignUp Data:', data.user ? data.user.id : null);
  console.log('SignUp Error:', error);
}
testSignUp();
