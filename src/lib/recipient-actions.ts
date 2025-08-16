'use server';

import { createClient } from './supabase/server';
import { getUser } from './auth';
import { revalidatePath } from 'next/cache';

interface UpdateRecipientProfileParams {
  recipientId: string;
  name: string;
  allowanceAmount: number;
  avatarUrl?: string | null;
}

export async function updateRecipientProfile({
  recipientId,
  name,
  allowanceAmount,
  avatarUrl,
}: UpdateRecipientProfileParams) {
  const user = await getUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  const supabase = await createClient();

  // Validate input
  if (!recipientId || !name.trim()) {
    throw new Error('Recipient ID and name are required');
  }

  if (allowanceAmount <= 0) {
    throw new Error('Allowance amount must be greater than 0');
  }

  // First verify the recipient belongs to the authenticated manager
  const { data: recipient, error: fetchError } = await supabase
    .from('recipients')
    .select('id, manager_id')
    .eq('id', recipientId)
    .eq('manager_id', user.id)
    .eq('is_active', true)
    .single();

  if (fetchError || !recipient) {
    throw new Error('Recipient not found or access denied');
  }

  // Update the recipient profile
  const { data, error } = await supabase
    .from('recipients')
    .update({
      name: name.trim(),
      allowance_amount: allowanceAmount,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recipientId)
    .eq('manager_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating recipient:', error);
    throw new Error('Failed to update recipient profile');
  }

  // Revalidate relevant pages to show updated data
  revalidatePath(`/recipients/${recipientId}`);
  revalidatePath('/dashboard');

  return data;
}

export async function resetRecipientAccount(recipientId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  const supabase = await createClient();

  // Validate input
  if (!recipientId) {
    throw new Error('Recipient ID is required');
  }

  // First verify the recipient belongs to the authenticated manager
  const { data: recipient, error: fetchError } = await supabase
    .from('recipients')
    .select('id, name, manager_id')
    .eq('id', recipientId)
    .eq('manager_id', user.id)
    .eq('is_active', true)
    .single();

  if (fetchError || !recipient) {
    throw new Error('Recipient not found or access denied');
  }

  // Reset all category balances to 0
  const { error: resetBalancesError } = await supabase
    .from('allowance_categories')
    .update({
      balance: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('recipient_id', recipientId);

  if (resetBalancesError) {
    console.error('Error resetting category balances:', resetBalancesError);
    throw new Error('Failed to reset category balances');
  }

  // Reset all charitable causes to 0 allocated amount
  const { error: resetCausesError } = await supabase
    .from('charitable_causes')
    .update({
      current_amount: 0,
      is_completed: false,
      completed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('recipient_id', recipientId);

  if (resetCausesError) {
    console.error('Error resetting charitable causes:', resetCausesError);
    throw new Error('Failed to reset charitable causes');
  }

  // Delete all transactions first (some may not be linked to distributions)
  const { error: deleteTransactionsError } = await supabase
    .from('transactions')
    .delete()
    .eq('recipient_id', recipientId);

  if (deleteTransactionsError) {
    console.error(
      'Error clearing transaction history:',
      deleteTransactionsError
    );
    throw new Error(
      `Failed to clear transaction history: ${deleteTransactionsError.message}`
    );
  }

  // Delete all distributions
  const { error: deleteDistributionsError } = await supabase
    .from('distributions')
    .delete()
    .eq('recipient_id', recipientId);

  if (deleteDistributionsError) {
    console.error('Error clearing distributions:', deleteDistributionsError);
    throw new Error(
      `Failed to clear distributions: ${deleteDistributionsError.message}`
    );
  }

  // Revalidate relevant pages to show updated data
  revalidatePath(`/recipients/${recipientId}`);
  revalidatePath('/dashboard');

  // Also revalidate the specific recipient page with all layouts
  revalidatePath(`/recipients/${recipientId}`, 'layout');
  revalidatePath(`/recipients/${recipientId}`, 'page');

  return {
    success: true,
    message: `${recipient.name}'s account has been reset`,
  };
}
