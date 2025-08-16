'use client';

import { signOut } from '@/lib/auth-actions';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-green-700">Grovesmith</h1>
        </div>

        <nav className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </Button>
        </nav>
      </div>
    </header>
  );
}
