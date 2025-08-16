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
    error,
  } = await supabase.auth.getUser();

  // Skip processing for development files and static assets
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/.well-known') ||
    request.nextUrl.pathname.includes('_buildManifest') ||
    request.nextUrl.pathname.includes('app-build-manifest')
  ) {
    return response;
  }

  // Only log for actual page requests in development
  if (
    process.env.NODE_ENV === 'development' &&
    !request.nextUrl.pathname.startsWith('/_next')
  ) {
    console.log('Middleware:', {
      path: request.nextUrl.pathname,
      hasUser: !!user,
      error: error?.message,
    });
  }

  // Auth redirects
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth/callback') &&
    !request.nextUrl.pathname.startsWith('/debug')
  ) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && request.nextUrl.pathname.startsWith('/login')) {
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
