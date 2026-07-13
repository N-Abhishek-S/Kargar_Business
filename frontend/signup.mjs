import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Attempting to sign up new admin user via Supabase API...");
  const { data, error } = await supabase.auth.signUp({
    email: 'kargaradmin@kargarfm.com',
    password: 'Abhishek@2005',
  });
  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("Success! User created. Please check email to confirm (if email confirmation is enabled).");
    console.log("Data:", data);
  }
}
run();
