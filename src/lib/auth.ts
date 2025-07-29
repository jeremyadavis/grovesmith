import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Auth error:', error);
    return null;
  }
  
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    console.log('No user found, redirecting to login');
    redirect('/login');
  }
  return user;
}

export async function createManagerProfile(user: { id: string; email?: string; user_metadata?: { full_name?: string } }) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('managers')
    .upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating manager profile:', error);
    return null;
  }

  return data;
}