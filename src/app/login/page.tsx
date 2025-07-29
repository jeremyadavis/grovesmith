import { ServerLoginForm } from '@/components/auth/server-login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <ServerLoginForm />
    </div>
  );
}