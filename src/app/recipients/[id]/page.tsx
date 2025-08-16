import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { RecipientProfileClient } from '@/components/recipients/recipient-profile-client';

interface RecipientPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipientPage({ params }: RecipientPageProps) {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const supabase = await createClient();

  // Fetch all recipients for navigation
  const { data: allRecipients, error: allRecipientsError } = await supabase
    .from('recipients')
    .select('id, name')
    .eq('manager_id', user.id)
    .eq('is_active', true)
    .order('name');

  if (allRecipientsError) {
    console.error('Error fetching recipients:', allRecipientsError);
  }

  // Fetch current recipient with categories
  const { data: recipient, error } = await supabase
    .from('recipients')
    .select(
      `
      id,
      name,
      allowance_amount,
      avatar_url,
      allowance_categories (
        category_type,
        balance
      )
    `
    )
    .eq('id', id)
    .eq('manager_id', user.id)
    .eq('is_active', true)
    .single();

  if (error || !recipient) {
    notFound();
  }

  // Transform categories data
  const categories = {
    give: 0,
    spend: 0,
    save: 0,
    invest: 0,
  };

  if (recipient.allowance_categories) {
    recipient.allowance_categories.forEach(
      (cat: { category_type: string; balance: number }) => {
        categories[cat.category_type as keyof typeof categories] = cat.balance;
      }
    );
  }

  const recipientWithCategories = {
    ...recipient,
    categories,
  };

  // Get manager name from user metadata or email
  const managerName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'Manager';

  return (
    <RecipientProfileClient
      recipient={recipientWithCategories}
      allRecipients={allRecipients || []}
      managerName={managerName}
      managerEmail={user.email}
    />
  );
}
