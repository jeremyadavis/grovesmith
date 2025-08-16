'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface DistributionData {
  recipientId: string;
  distributionDate: Date;
  giveAmount: number;
  spendAmount: number;
  saveAmount: number;
  investAmount: number;
  notes?: string;
}

export async function distributeAllowance(data: DistributionData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Validate that the recipient belongs to the manager
  const { data: recipient, error: recipientError } = await supabase
    .from('recipients')
    .select('id, name, manager_id')
    .eq('id', data.recipientId)
    .eq('manager_id', user.id)
    .eq('is_active', true)
    .single();

  if (recipientError || !recipient) {
    throw new Error('Recipient not found or access denied');
  }

  // Validate amounts
  const totalAmount =
    data.giveAmount + data.spendAmount + data.saveAmount + data.investAmount;
  if (totalAmount <= 0) {
    throw new Error('Distribution amount must be greater than zero');
  }

  if (
    data.giveAmount < 0 ||
    data.spendAmount < 0 ||
    data.saveAmount < 0 ||
    data.investAmount < 0
  ) {
    throw new Error('Individual category amounts cannot be negative');
  }

  // Create the distribution record
  const { data: distribution, error: distributionError } = await supabase
    .from('distributions')
    .insert({
      recipient_id: data.recipientId,
      manager_id: user.id,
      distribution_date: data.distributionDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD
      total_amount: totalAmount,
      give_amount: data.giveAmount,
      spend_amount: data.spendAmount,
      save_amount: data.saveAmount,
      invest_amount: data.investAmount,
      notes: data.notes,
    })
    .select()
    .single();

  if (distributionError) {
    console.error('Distribution creation error:', distributionError);
    throw new Error(
      `Failed to create distribution: ${distributionError.message}`
    );
  }

  // The database triggers will automatically:
  // 1. Update category balances
  // 2. Create transaction records

  // Revalidate the recipient page to show updated balances
  revalidatePath(`/recipients/${data.recipientId}`);
  revalidatePath('/dashboard');

  return distribution;
}

export async function getRecipientDistributions(recipientId: string) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: distributions, error } = await supabase
    .from('distributions')
    .select('*')
    .eq('recipient_id', recipientId)
    .eq('manager_id', user.id)
    .order('distribution_date', { ascending: false });

  if (error) {
    console.error('Error fetching distributions:', error);
    throw new Error('Failed to fetch distribution history');
  }

  return distributions;
}

export async function getRecipientTransactions(
  recipientId: string,
  limit = 50
) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(
      `
      *,
      distributions (
        distribution_date,
        notes
      )
    `
    )
    .eq('recipient_id', recipientId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transaction history');
  }

  return transactions;
}

// Helper function to calculate undistributed allowance
export async function calculateUndistributedAllowance(recipientId: string) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get recipient info
  const { data: recipient, error: recipientError } = await supabase
    .from('recipients')
    .select('allowance_amount, created_at')
    .eq('id', recipientId)
    .eq('manager_id', user.id)
    .single();

  if (recipientError || !recipient) {
    throw new Error('Recipient not found');
  }

  // Get total distributed amount
  const { data: distributionsSum, error: distributionError } = await supabase
    .from('distributions')
    .select('total_amount')
    .eq('recipient_id', recipientId)
    .eq('manager_id', user.id);

  if (distributionError) {
    console.error('Error calculating distributions:', distributionError);
    throw new Error('Failed to calculate undistributed amount');
  }

  const totalDistributed =
    distributionsSum?.reduce((sum, d) => sum + Number(d.total_amount), 0) || 0;

  // Calculate weeks since recipient was created (simplified calculation)
  const createdDate = new Date(recipient.created_at);
  const currentDate = new Date();
  const weeksSinceCreated = Math.floor(
    (currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );

  // Total allowance that should have been distributed
  const totalAllowanceOwed = weeksSinceCreated * recipient.allowance_amount;

  // Undistributed amount
  const undistributedAmount = Math.max(
    0,
    totalAllowanceOwed - totalDistributed
  );

  return {
    undistributedAmount,
    totalDistributed,
    totalAllowanceOwed,
    weeksSinceCreated,
    weeklyAllowance: recipient.allowance_amount,
  };
}
