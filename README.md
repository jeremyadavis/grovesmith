# Grovesmith

A financial literacy web application designed to teach children responsible money management through structured allowance distribution across educational categories.

## Overview

Grovesmith helps parents manage their children's allowances by distributing money across four educational categories:
- **Give** - Teaching charitable giving and purposeful donations
- **Spend** - Providing spending money for learning financial transactions
- **Save** - Building saving habits toward specific goals
- **Invest** - Teaching investment principles through dividend simulation

## Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Backend:** Supabase (PostgreSQL, Authentication)
- **Deployment:** Vercel (Frontend), Supabase Cloud (Backend)

## Current Features

✅ **Authentication System**
- Manager-only email authentication
- Server-side rendering with proper session handling
- Protected routes with middleware

✅ **Dashboard & Recipients**
- Manager dashboard with recipient overview
- Add recipients with custom allowance amounts
- Automatic category creation for new recipients

✅ **Recipient Profile System**
- Individual recipient profile pages with personalized themes
- Circular navigation between recipients with pagination dots
- 10 unique gradient themes assigned deterministically per child
- Trophy achievement system with 7 different trophy types

✅ **Distribution System**
- Manual allowance distribution with pooled undistributed funds
- Interactive distribution modal with category allocation controls
- Date picker for backdating distributions to specific dates
- Real-time calculation of undistributed allowance amounts
- Multiple distributions per session with running balance updates

✅ **Gamification Features**
- Dynamic trophy awards based on category balances
- Achievement system (First Saver, Generous Giver, Smart Investor, etc.)
- Visual trophy display with earned/unearned states
- Profile personalization with themed headers

✅ **Database Foundation**
- Complete schema for managers, recipients, categories, and transactions
- Distribution and transaction tracking with full audit trail
- Row-level security policies and automatic triggers
- Real-time balance updates via database functions

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/grovesmith.git
cd grovesmith
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
```
Add your Supabase project URL and anon key to `.env.local`

4. Set up the database
- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Run the commands from `supabase-setup.sql`

5. Start the development server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── dashboard/         # Main dashboard page
│   ├── recipients/[id]/   # Dynamic recipient profile pages
│   ├── login/            # Authentication page
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard-specific components
│   ├── layout/          # App-wide layout components
│   ├── recipients/      # Recipient profile components
│   │   ├── distribute-funds-modal.tsx
│   │   ├── recipient-profile-header.tsx
│   │   ├── trophy-system.tsx
│   │   └── tabs/        # Category tab components
│   └── ui/              # shadcn/ui components (calendar, popover, etc.)
├── lib/                 # Utility functions and configurations
│   ├── auth-actions.ts  # Server actions for authentication
│   ├── distribution-actions.ts # Server actions for distributions
│   ├── profile-themes.ts # Theme system for personalization
│   ├── auth.ts         # Authentication utilities
│   └── supabase/       # Supabase client configurations
└── middleware.ts       # Route protection middleware
```

## Development Roadmap

### Phase 1: Foundation ✅
- Next.js setup with TypeScript and Tailwind
- Supabase integration with authentication
- Database schema design

### Phase 2: Authentication & Navigation ✅
- Server-side authentication with proper cookie handling
- Protected routes and middleware
- Basic dashboard layout

### Phase 3: Recipient Management ✅
- Manager dashboard with recipient cards
- Add/edit recipients functionality
- Automatic category initialization

### Phase 4: Allowance Distribution ✅
- Manual allowance distribution with pooled funds
- Interactive distribution modal with real-time validation
- Date picker for historical distributions
- Automatic balance updates and transaction logging

### Phase 5: Category Features (Next)
- Give category with charitable causes and giving goals
- Save category with wishlist management and progress tracking
- Investment simulation with dividend payments and thresholds
- Spend category with transaction history and reflection tools

### Phase 6: Advanced Features (Planned)
- Auto-distribution with saved percentage preferences
- Manager settings and recipient configuration
- Historical reporting and analytics
- Mobile-responsive optimizations

## Contributing

This is currently a personal project. Please refer to the development plan in `docs/plan.md` for detailed implementation status and next steps.

## License

This project is private and not currently open for public contribution.

---

*Teaching financial literacy, one allowance at a time.* 🌱💰
