'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface CharitableCause {
  id: string;
  recipient_id: string;
  name: string;
  description: string | null;
  goal_amount: number;
  current_amount: number;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCauseData {
  recipientId: string;
  name: string;
  description?: string;
  goalAmount: number;
  dueDate?: string;
}

export interface CompleteDonationData {
  causeId: string;
  donationAmount: number;
}

export async function getCharitableCauses(recipientId: string): Promise<CharitableCause[]> {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Verify the recipient belongs to the manager
  const { data: recipient } = await supabase
    .from('recipients')
    .select('id')
    .eq('id', recipientId)
    .eq('manager_id', user.id)
    .single();

  if (!recipient) {
    throw new Error('Recipient not found or access denied');
  }

  const { data: causes, error } = await supabase
    .from('charitable_causes')
    .select('*')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching charitable causes:', error);
    throw new Error('Failed to fetch charitable causes');
  }

  return causes || [];
}

export async function createCharitableCause(data: CreateCauseData) {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Verify the recipient belongs to the manager
  const { data: recipient } = await supabase
    .from('recipients')
    .select('id')
    .eq('id', data.recipientId)
    .eq('manager_id', user.id)
    .single();

  if (!recipient) {
    throw new Error('Recipient not found or access denied');
  }

  // Check if recipient already has 3 active causes
  const { data: existingCauses, error: countError } = await supabase
    .from('charitable_causes')
    .select('id')
    .eq('recipient_id', data.recipientId)
    .eq('is_completed', false);

  if (countError) {
    throw new Error('Failed to check existing causes');
  }

  if (existingCauses && existingCauses.length >= 3) {
    throw new Error('Maximum of 3 active causes allowed per recipient');
  }

  // Create the new cause
  const { data: newCause, error } = await supabase
    .from('charitable_causes')
    .insert({
      recipient_id: data.recipientId,
      name: data.name,
      description: data.description || null,
      goal_amount: data.goalAmount,
      due_date: data.dueDate || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating charitable cause:', error);
    throw new Error(`Failed to create charitable cause: ${error.message}`);
  }

  // Revalidate the recipient page
  revalidatePath(`/recipients/${data.recipientId}`);

  return newCause;
}

export async function completeDonation(data: CompleteDonationData) {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get the cause and verify access
  const { data: cause, error: causeError } = await supabase
    .from('charitable_causes')
    .select(`
      *,
      recipients!inner (
        id,
        manager_id,
        allowance_categories (
          category_type,
          balance
        )
      )
    `)
    .eq('id', data.causeId)
    .eq('recipients.manager_id', user.id)
    .single();

  if (causeError || !cause) {
    throw new Error('Charitable cause not found or access denied');
  }

  if (cause.is_completed) {
    throw new Error('This cause has already been completed');
  }

  // Get the Give category balance
  const giveCategory = cause.recipients.allowance_categories.find(
    (cat: { category_type: string; balance: number }) => cat.category_type === 'give'
  );

  if (!giveCategory || giveCategory.balance < data.donationAmount) {
    throw new Error('Insufficient funds in Give category');
  }

  // Start a transaction to update both the cause and create a withdrawal transaction
  const { error: updateError } = await supabase.rpc('complete_charitable_donation', {
    p_cause_id: data.causeId,
    p_recipient_id: cause.recipient_id,
    p_donation_amount: data.donationAmount,
    p_cause_name: cause.name
  });

  if (updateError) {
    console.error('Error completing donation:', updateError);
    throw new Error(`Failed to complete donation: ${updateError.message}`);
  }

  // Revalidate the recipient page
  revalidatePath(`/recipients/${cause.recipient_id}`);

  return { success: true };
}

export async function deleteCharitableCause(causeId: string) {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get the cause and verify access
  const { data: cause, error: causeError } = await supabase
    .from('charitable_causes')
    .select(`
      id,
      recipient_id,
      recipients!inner (
        manager_id
      )
    `)
    .eq('id', causeId)
    .eq('recipients.manager_id', user.id)
    .single();

  if (causeError || !cause) {
    throw new Error('Charitable cause not found or access denied');
  }

  // Delete the cause
  const { error } = await supabase
    .from('charitable_causes')
    .delete()
    .eq('id', causeId);

  if (error) {
    console.error('Error deleting charitable cause:', error);
    throw new Error(`Failed to delete charitable cause: ${error.message}`);
  }

  // Revalidate the recipient page
  revalidatePath(`/recipients/${cause.recipient_id}`);

  return { success: true };
}

export async function getGiveCategoryBalance(recipientId: string) {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Verify the recipient belongs to the manager
  const { data: recipient } = await supabase
    .from('recipients')
    .select('id')
    .eq('id', recipientId)
    .eq('manager_id', user.id)
    .single();

  if (!recipient) {
    throw new Error('Recipient not found or access denied');
  }

  // Get current Give category balance (this is total unspent money)
  const { data: giveCategory, error: categoryError } = await supabase
    .from('allowance_categories')
    .select('balance')
    .eq('recipient_id', recipientId)
    .eq('category_type', 'give')
    .single();

  if (categoryError || !giveCategory) {
    throw new Error('Failed to fetch Give category balance');
  }

  // Get total amount allocated to active causes
  const { data: activeCauses, error: causesError } = await supabase
    .from('charitable_causes')
    .select('current_amount')
    .eq('recipient_id', recipientId)
    .eq('is_completed', false);

  if (causesError) {
    throw new Error('Failed to fetch active causes');
  }

  const totalAllocated = activeCauses?.reduce((sum, cause) => sum + Number(cause.current_amount), 0) || 0;
  const totalUnspent = Number(giveCategory.balance);
  const unallocated = totalUnspent - totalAllocated;

  return {
    totalUnspent,
    totalAllocated, 
    unallocated
  };
}

export async function allocateToCharity(causeId: string, amount: number) {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get the cause and verify access
  const { data: cause, error: causeError } = await supabase
    .from('charitable_causes')
    .select(`
      *,
      recipients!inner (
        id,
        manager_id
      )
    `)
    .eq('id', causeId)
    .eq('recipients.manager_id', user.id)
    .single();

  if (causeError || !cause) {
    throw new Error('Charitable cause not found or access denied');
  }

  // Check if allocation would exceed the goal
  if (cause.current_amount + amount > cause.goal_amount) {
    throw new Error('Allocation exceeds the goal amount');
  }

  // Check if there are sufficient unallocated funds
  const balanceInfo = await getGiveCategoryBalance(cause.recipient_id);
  if (amount > balanceInfo.unallocated) {
    throw new Error('Insufficient unallocated funds');
  }

  // Update the cause's current amount (allocated amount)
  const { error: updateError } = await supabase
    .from('charitable_causes')
    .update({
      current_amount: cause.current_amount + amount,
      updated_at: new Date().toISOString()
    })
    .eq('id', causeId);

  if (updateError) {
    console.error('Error allocating to charity:', updateError);
    throw new Error(`Failed to allocate funds: ${updateError.message}`);
  }

  // Revalidate the recipient page
  revalidatePath(`/recipients/${cause.recipient_id}`);

  return { success: true };
}