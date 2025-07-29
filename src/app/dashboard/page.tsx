import { getUser, createManagerProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { RecipientCard } from '@/components/dashboard/recipient-card';
import { AddRecipientCard } from '@/components/dashboard/add-recipient-card';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login-server');
  }
  
  // Create manager profile if it doesn't exist
  await createManagerProfile(user);

  const supabase = await createClient();
  const { data: recipients, error } = await supabase
    .from('recipients')
    .select('*')
    .eq('manager_id', user.id)
    .eq('is_active', true)
    .eq('is_archived', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching recipients:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">
            Manage your children&apos;s financial learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipients?.map((recipient) => (
            <RecipientCard key={recipient.id} recipient={recipient} />
          ))}
          <AddRecipientCard />
        </div>

        {recipients?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No recipients yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first child to begin their financial learning journey.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}