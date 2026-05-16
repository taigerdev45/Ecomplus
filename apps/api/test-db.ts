import { supabase } from './src/lib/supabase';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function checkPassword() {
  const email = 'siataiger7@gmail.com';
  const password = 'Admin123!';
  
  const { data: user, error } = await supabase
    .from('utilisateur')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    console.error('User not found');
    return;
  }

  console.log('User found, comparing password...');
  const isMatch = await bcrypt.compare(password, user.mot_de_passe);
  console.log('Password match:', isMatch);
  console.log('Hash in DB:', user.mot_de_passe);
}

checkPassword();
