'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/', 'layout');
  redirect('/login?message=Check your email to confirm your account');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function addRecipient(formData: FormData) {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const name = formData.get('name') as string;
  const allowanceAmount = parseFloat(formData.get('allowanceAmount') as string);

  if (!name?.trim()) {
    throw new Error('Name is required');
  }

  if (isNaN(allowanceAmount) || allowanceAmount < 0) {
    throw new Error('Valid allowance amount is required');
  }

  const { error } = await supabase
    .from('recipients')
    .insert({
      name: name.trim(),
      allowance_amount: allowanceAmount,
      manager_id: user.id,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
}
