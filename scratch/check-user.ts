
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const email = 'siataiger7@gmail.com';
  const password = 'Admin123!';

  console.log(`Checking user: ${email}`);

  const { data: user, error } = await supabase
    .from('utilisateur')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user:', error.message);
    return;
  }

  if (!user) {
    console.log('User not found in table "utilisateur"');
    return;
  }

  console.log('User found:', {
    id: user.id,
    email: user.email,
    role: user.role,
    has_password: !!user.mot_de_passe
  });

  const isMatch = await bcrypt.compare(password, user.mot_de_passe);
  console.log('Password match:', isMatch);

  // Check if user is in auth.users (Supabase Auth)
  // This requires service role key which we have
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error listing auth users:', authError.message);
  } else {
    const authUser = authUsers.users.find(u => u.email === email);
    if (authUser) {
      console.log('User also found in Supabase Auth:', authUser.id);
    } else {
      console.log('User NOT found in Supabase Auth (this is expected if using custom auth)');
    }
  }
}

checkUser();
