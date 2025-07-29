import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function DebugPage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Server-Side Debug Info</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">All Cookies:</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs">
            {JSON.stringify(allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' })), null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="font-semibold">User:</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs">
            {JSON.stringify(user ? { id: user.id, email: user.email } : null, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="font-semibold">Session:</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs">
            {JSON.stringify(session ? { access_token: session.access_token.substring(0, 50) + '...', user: session.user.email } : null, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="font-semibold">Errors:</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs">
            User Error: {JSON.stringify(userError, null, 2)}
            Session Error: {JSON.stringify(sessionError, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}