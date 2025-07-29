import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session to ensure latest auth state
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  console.log('Middleware:', {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    error: error?.message,
    authCookies: request.cookies.getAll().filter(c => c.name.includes('supabase')).map(c => c.name)
  });

  // Auth redirects
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth/callback') && !request.nextUrl.pathname.startsWith('/debug')) {
    console.log('Middleware: Redirecting to login - no user');
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (request.nextUrl.pathname.startsWith('/login'))) {
    console.log('Middleware: Redirecting to dashboard - user logged in');
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - debug (debug page)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|debug|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};