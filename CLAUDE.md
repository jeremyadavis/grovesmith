# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Read Documentation First

**Before making any changes**, read the following files in the `/docs` directory to understand project goals and requirements:

1. **`docs/prd.md`** - Product Requirements Document outlining the full vision
2. **`docs/plan.md`** - Development phases and current implementation status  
3. **`docs/tech-specs.md`** - Approved technology stack and architecture decisions
4. **`docs/GAMIFICATION.md`** - Trophy system and profile personalization details
5. **`docs/DISTRIBUTION_SYSTEM.md`** - Core allowance distribution functionality

These documents contain the definitive project requirements, tech stack choices, and implementation details that must be followed.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (Next.js core-web-vitals + TypeScript)
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run clean` - Clean .next directory and restart dev server

### Environment Setup
- Requires Node.js 18+
- Copy environment variables to `.env.local` (see SETUP.md)
- Run `supabase-setup.sql` in Supabase project before first use

## Architecture Overview

### Tech Stack (per docs/tech-specs.md)
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components  
- **Database**: Supabase (PostgreSQL with RLS policies)
- **Authentication**: Supabase Auth with server-side rendering
- **State Management**: Server actions + revalidation (React Query planned but not implemented yet)
- **Deployment**: Vercel (Frontend), Supabase Cloud (Backend)

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── dashboard/       # Manager dashboard (/dashboard)
│   ├── recipients/[id]/ # Dynamic recipient profiles
│   ├── login/          # Authentication page
│   └── auth/callback/  # OAuth callback handler
├── components/
│   ├── auth/           # Authentication forms (server-side)
│   ├── dashboard/      # Dashboard components
│   ├── recipients/     # Recipient profile system
│   ├── layout/         # App-wide layout components
│   └── ui/             # shadcn/ui base components
├── lib/
│   ├── auth.ts         # Authentication utilities
│   ├── auth-actions.ts # Server actions for auth/recipients
│   ├── distribution-actions.ts # Server actions for allowance distributions
│   ├── profile-themes.ts # Recipient theme system (10 gradient themes)
│   └── supabase/       # Supabase client configurations
└── middleware.ts       # Route protection and session management
```

### Key Architecture Patterns

**Server-Side First**: This is a server-rendered application using Next.js server components and server actions. Avoid client-side state management unless necessary for interactivity.

**Authentication Flow**: 
- Middleware handles session validation and redirects
- `requireAuth()` in `lib/auth.ts` for protected pages
- Server actions validate user ownership before database operations

**Database Security**: All operations go through Row-Level Security policies. Server actions validate that users can only access their own data.

**Component Organization**:
- UI components follow shadcn/ui patterns in `components/ui/`
- Feature components are organized by domain (dashboard, recipients, auth)
- Server actions are separated by functionality in `lib/*-actions.ts`

### Data Flow
1. **Recipients**: Created via `addRecipient` server action, automatically creates 4 categories
2. **Distributions**: Use `distributeAllowance` to allocate weekly allowances across categories
3. **Balance Updates**: Database triggers automatically update category balances and create transaction records
4. **Theme System**: Recipients get deterministic themes based on ID using `getRecipientTheme()`

### Key Features Implemented
- ✅ Server-side authentication with protected routes
- ✅ Manager dashboard with recipient management
- ✅ Dynamic recipient profiles with personalized themes
- ✅ Allowance distribution system with pooled undistributed funds
- ✅ Trophy/achievement system with 7 trophy types
- ✅ Interactive distribution modal with date picker
- ✅ Real-time balance calculations and transaction history
- ✅ **Give Category Features**:
  - Up to 3 charitable causes per recipient
  - Fund allocation system (unallocated → allocated to specific causes)
  - Donation completion with transaction recording
  - Three-tier balance display (total unspent, allocated, unallocated)
  - Visual progress indicators and status badges
  - Full-width category header with transaction history in sidebar

### Development Notes
- Uses Turbopack for faster development builds
- ESLint configured with Next.js TypeScript rules
- Prettier with Tailwind CSS plugin for consistent formatting
- All database operations use server actions with proper error handling
- Middleware logs auth state in development for debugging

### Database Schema
Key tables: `managers`, `recipients`, `allowance_categories`, `distributions`, `transactions`, `charitable_causes`
- Recipients have 4 auto-created categories: Give, Spend, Save, Invest
- Distributions create transaction records via database triggers
- Charitable causes track allocated funds and completion status
- Row-Level Security ensures data isolation between managers

## Project Goals & Vision (per docs/prd.md)

**Core Mission**: Teach financial literacy to children through structured allowance distribution across 4 educational categories:

1. **Give** - Charitable giving and purposeful donations (max 3 causes, automatic payout at target amounts)
2. **Spend** - Untracked spending money for learning transactions and impulse control  
3. **Save** - Structured saving toward wishlist items with progress tracking and delayed gratification
4. **Invest** - Investment simulation with dividends ($0.05/$1, paid 1st/15th, $50 threshold for real investing)

**Key Principles**:
- Educational focus (not chore-based)
- Weekly allowance = age ÷ 2 in dollars (e.g., 10-year-old gets $5/week)
- Manager-controlled with view-only access for recipients
- Gamification through achievements and personalized themes

### Current Development Phase (per docs/plan.md)
Currently in **Phase 5 Complete: Give Category Features** - complete charitable giving system with fund allocation and donation tracking is implemented. Next phase focuses on remaining category features:

**✅ Completed**: Authentication, recipient management, distribution system, trophy gamification, themed profiles, Give category with charitable causes
**🔄 Next**: Save category wishlists, Spend tracking, Investment simulation