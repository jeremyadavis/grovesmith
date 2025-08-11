# Grovesmith

A financial literacy web application that teaches children responsible money management through structured allowance distribution across four educational categories.

## Mission

Help children develop healthy financial habits by learning to allocate their allowance across Give (charity), Spend (discretionary), Save (goals), and Invest (growth) categories through hands-on experience and guided learning.

## Key Features

✅ **Complete Allowance Management**
- Pooled distribution system with flexible timing
- Automatic balance tracking and transaction history
- Manager-controlled with educational transparency

✅ **Give Category (Implemented)**
- Up to 3 charitable causes per child
- Fund allocation system with donation completion
- Visual progress tracking and impact celebration

✅ **Gamification & Personalization**
- 7-trophy achievement system tied to real financial milestones
- 10 unique recipient themes for visual personalization
- Progress recognition without artificial point systems

🔄 **Coming Next: Save, Spend & Invest Categories**
- Save: Wishlist management with subcategories and goal tracking
- Spend: Privacy-focused spending reflection without surveillance
- Invest: Dividend simulation leading to real investment accounts

## Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Authentication, Row-Level Security)
- **Deployment:** Vercel + Supabase Cloud
- **Architecture:** Server-side rendering, server actions, real-time updates

> See [README.tech-stack.md](README.tech-stack.md) for detailed technical specifications

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

### Quick Start
```bash
# 1. Clone and install
git clone https://github.com/your-username/grovesmith.git
cd grovesmith
npm install

# 2. Environment setup
cp .env.local.example .env.local
# Add your Supabase URL and anon key to .env.local

# 3. Database setup
# Run supabase-setup.sql in your Supabase SQL Editor

# 4. Start development
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

## Project Documentation

### Product Requirements
- **[Product Overview](README.product-overview.md)** - Core philosophy and educational approach
- **[Distribution System](README.product-distribution.md)** - Allowance distribution features
- **[Give Category](README.product-give.md)** - Charitable giving implementation ✅
- **[Spend Category](README.product-spend.md)** - Privacy-focused spending tracking 🔄
- **[Save Category](README.product-save.md)** - Goal-oriented saving with wishlists 🔄
- **[Invest Category](README.product-invest.md)** - Investment simulation system 🔄
- **[Trophy System](README.product-trophies.md)** - Gamification and achievements ✅

### Technical Implementation
- **[Core Data Models](README.data-model-core.md)** - Users, recipients, categories
- **[Distribution Data](README.data-model-distribution.md)** - Transaction and balance systems
- **[Category Data Models](README.data-model-give.md)** - Domain-specific data structures
- **[Database Schema](README.database-schema.md)** - Complete schema design
- **[Tech Stack](README.tech-stack.md)** - Architecture and technology choices

## Current Status

**Phase 5 Complete: Give Category Features**
- ✅ Charitable causes with fund allocation
- ✅ Three-tier balance system (total, allocated, unallocated)  
- ✅ Donation completion with transaction recording
- ✅ Visual progress tracking and status indicators

**Next Development Priority:**
- Save category with wishlist management and subcategories
- Spend category with reflection tools and contribution tracking  
- Invest category with dividend simulation and milestone achievements

## Educational Philosophy

Grovesmith emphasizes **learning through experience** rather than chore-based rewards:

- **Manager-Controlled:** Parents maintain oversight while children learn through guided experience
- **Real Consequences:** Financial decisions have actual outcomes within a safe learning environment  
- **Balanced Approach:** Equal emphasis on giving, spending, saving, and investing
- **Privacy-Respectful:** No surveillance of individual purchases or personal choices
- **Achievement-Based:** Recognition tied to genuine financial milestones and positive behaviors

## Contributing

This is currently a personal project focused on family financial education. The codebase follows clean architecture principles with comprehensive documentation to support future development and potential open-source release.

---

*Teaching financial literacy, one allowance at a time.* 🌱💰