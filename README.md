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

✅ **Database Foundation**
- Complete schema for managers, recipients, categories, and transactions
- Row-level security policies
- Automatic triggers for category setup

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
│   ├── login/            # Authentication page
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard-specific components
│   └── ui/              # shadcn/ui components
├── lib/                 # Utility functions and configurations
│   ├── auth-actions.ts  # Server actions for authentication
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

### Phase 4: Allowance Distribution (Next)
- Manual allowance entry interface
- "Repeat last time" functionality
- Category balance management

### Phase 5: Category Features (Planned)
- Give category with charitable causes
- Save category with wishlist management
- Investment simulation with dividends
- Spend category tracking

## Contributing

This is currently a personal project. Please refer to the development plan in `docs/plan.md` for detailed implementation status and next steps.

## License

This project is private and not currently open for public contribution.

---

*Teaching financial literacy, one allowance at a time.* 🌱💰
