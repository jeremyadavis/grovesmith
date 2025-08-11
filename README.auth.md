# Grovesmith Authentication & Authorization

## Overview

Grovesmith uses Supabase Auth for authentication with a server-side first approach. The system implements manager-controlled access where only authenticated managers (parents/guardians) can access financial data, while recipients (children) have view-only access to their own progress.

## Authentication Architecture

### Supabase Auth Integration
- **Provider:** Supabase Cloud Authentication
- **Methods:** Email/password authentication (OAuth providers ready for future implementation)
- **Session Management:** Server-side sessions with HTTP-only cookies
- **Database Integration:** Direct foreign key relationship to `auth.users` table

### Server-Side Authentication Flow

```typescript
// Core auth functions (src/lib/auth.ts)
export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error ? null : user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}
```

### Authentication Components

#### Server Client (`src/lib/supabase/server.ts`)
- Server-side Supabase client with cookie management
- Used in Server Components and Server Actions
- Handles session refresh and validation

#### Client-Side Client (`src/lib/supabase/client.ts`)
- Basic client for client-side operations
- Minimal usage following server-first approach

#### Middleware Protection (`src/middleware.ts`)
- Validates sessions on all protected routes
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login`
- Skips processing for static assets and development files

```typescript
// Route protection patterns
if (!user && !request.nextUrl.pathname.startsWith('/login')) {
  return NextResponse.redirect(new URL('/login', request.url));
}

if (user && request.nextUrl.pathname.startsWith('/login')) {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

## Authorization Model

### Role-Based Access Control

**Manager (Primary User):**
- Full control over all financial operations
- Can create, view, and manage recipients
- Can distribute allowances and approve transactions
- Access to all recipient data under their management

**Recipient (Secondary User):**
- View-only access to their own progress
- Cannot initiate financial transactions
- Cannot access other recipients' data
- *Note: Recipient authentication not yet implemented - currently manager-only system*

### Row-Level Security (RLS)

Database-level access control ensures data isolation between different families:

```sql
-- Managers can only access their own profile
CREATE POLICY "Managers can access own profile" ON managers
  FOR ALL USING (auth.uid() = id);

-- Recipients are filtered by manager ownership
CREATE POLICY "Managers can access own recipients" ON recipients  
  FOR ALL USING (manager_id = auth.uid());

-- All child tables inherit manager-based filtering
CREATE POLICY "Manager recipients access" ON account_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipients r 
      WHERE r.id = recipient_id 
      AND r.manager_id = auth.uid()
    )
  );
```

### Authorization in Server Actions

All server actions include authentication checks:

```typescript
export async function addRecipient(formData: FormData) {
  const supabase = await createClient();
  
  // Authentication check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Business logic with user.id as manager_id
  const { error } = await supabase
    .from('recipients')
    .insert({
      name: name.trim(),
      allowance_amount: allowanceAmount,
      manager_id: user.id, // Ensures data ownership
    });
}
```

## Security Features

### Session Security
- **HTTP-Only Cookies:** Prevents XSS attacks on session tokens
- **Server-Side Validation:** All authentication checks happen server-side
- **Automatic Refresh:** Middleware ensures sessions stay current
- **Secure Transmission:** HTTPS encryption for all authentication flows

### CSRF Protection
- **Next.js Built-in:** Automatic CSRF protection for Server Actions
- **Server Actions Only:** All mutations go through protected server actions
- **No Client-Side Auth:** Minimal client-side authentication surface

### Data Privacy & Family Isolation
- **Complete Separation:** Each family operates as isolated tenant
- **No Cross-Family Access:** RLS policies prevent data leakage
- **Minimal Data Collection:** Only essential data for educational functionality
- **Child Data Protection:** No social features or external data sharing

## Authentication Flow

### Sign Up Process
1. User submits email/password via `/login` page
2. Server action calls `supabase.auth.signUp()`
3. Email confirmation required (Supabase handles)
4. Upon confirmation, user redirected to dashboard
5. Manager profile automatically created via `createManagerProfile()`

### Sign In Process  
1. User submits credentials via `/login` page
2. Server action calls `supabase.auth.signInWithPassword()`
3. Session established with HTTP-only cookies
4. User redirected to `/dashboard`
5. Middleware validates session on subsequent requests

### Sign Out Process
1. Server action calls `supabase.auth.signOut()`
2. Session cookies cleared
3. User redirected to `/login`
4. Protected routes require re-authentication

### OAuth Callback (Future)
- OAuth callback handler at `/auth/callback/route.ts`
- Ready for Google/GitHub provider integration
- Handles code exchange for session tokens

## Route Protection

### Protected Routes
- `/dashboard` - Manager dashboard
- `/recipients/[id]` - Individual recipient profiles  
- All routes except `/login`, `/auth/callback`, and static assets

### Public Routes
- `/login` - Authentication page
- `/auth/callback` - OAuth callback handler
- Static assets and Next.js internals

### Middleware Configuration
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|debug|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

## Profile Management

### Manager Profile Creation
```typescript
export async function createManagerProfile(user: {
  id: string;
  email?: string; 
  user_metadata?: { full_name?: string }
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('managers')
    .upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
    })
    .select()
    .single();

  return error ? null : data;
}
```

### Profile Data Model
```sql
CREATE TABLE managers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## Development & Testing

### Local Development
- Uses Supabase local development setup
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Automatic session refresh in development mode
- Debug logging in middleware for development

### Production Security
- Secure environment variable management
- Automatic HTTPS enforcement
- Database connection pooling via Supabase
- Rate limiting and DDoS protection via Supabase

## Future Enhancements

### Planned Authentication Features
- **OAuth Providers:** Google and GitHub integration
- **Recipient Authentication:** View-only access for children
- **Multi-Factor Authentication:** Enhanced security for financial data
- **Session Management:** Advanced session controls and timeout settings

### Advanced Authorization
- **Granular Permissions:** Fine-grained access control within families
- **Audit Logging:** Complete authentication and authorization audit trail
- **API Keys:** Programmatic access for future integrations
- **Enterprise Features:** Multi-tenant support for schools/organizations

## Error Handling

### Authentication Errors
- Server-side error logging with user-friendly messages
- Automatic redirect to login on authentication failures
- Graceful handling of network and service errors
- Clear error messages without exposing security details

### Session Handling
- Automatic session refresh via middleware
- Graceful degradation for expired sessions
- Consistent user experience across authentication states
- Proper cleanup of client-side state on sign out

This authentication system provides a secure, scalable foundation for family financial education while maintaining simplicity and user experience.