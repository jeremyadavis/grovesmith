# Grovesmith – Technical Specification Document

This document outlines the technical specifications and architecture choices for building Grovesmith, complementing the Product Requirements Document above.

## Technology Stack Overview

| Layer                            | Selected Technology                         |
| -------------------------------- | ------------------------------------------- |
| **Frontend**                     | Next.js, React, TypeScript                  |
| **UI and Styling**               | Tailwind CSS, shadcn/ui                     |
| **Data Fetching & Client State** | React Query (TanStack Query)                |
| **Authentication & Database**    | Supabase Cloud (PostgreSQL, OAuth Auth)     |
| **Deployment & Hosting**         | Vercel (Frontend), Supabase Cloud (Backend) |

---

## Frontend Framework

### Framework

- Utilize Next.js (App Router) with TypeScript for type safety and efficient development.
- Leverage Next.js API routes for optional backend logic as needed.

---

## User Interface & Styling

- Tailwind CSS for rapid, consistent styling.
- shadcn/ui component library for cohesive, polished, reusable components.
- Fully responsive design optimized for mobile, tablet, and desktop.

---

## Data Management

- React Query for efficient client-side data fetching, caching, and state management.
- Supabase JS Client for direct interaction with Supabase/PostgreSQL database.

---

## Authentication

- Supabase Auth with OAuth providers exclusively (Google, GitHub).
- Avoid email/password authentication to simplify user management.
- Utilize Supabase's built-in Row-Level Security (RLS) for data protection.

---

## Database Schema (Supabase/PostgreSQL)

### Tables:

- **managers** (OAuth authenticated users)
- **recipients** (linked to manager accounts)
- **allowance_categories** (Give, Spend, Save, Invest)
- **allowance_transactions** (excluding Spend; tracks fund movement within categories)
- **wishlists** (recipient-specific wishlist items with progress tracking)
- **dividends** (records simulated dividend distributions)

### Schema Notes:

- Leverage PostgreSQL's JSONB fields for flexible wishlist data management.
- Optionally utilize PostgreSQL functions/triggers for automated tasks (e.g., dividend calculations).

---

## Security

- Default security via Supabase's built-in Row-Level Security (RLS).
- Minimal custom security logic initially; rely on Supabase standards.

---

## Deployment

- Frontend hosted on Vercel for seamless Next.js integration.
- Backend (database and authentication) managed via Supabase Cloud.
- Securely store environment variables in Vercel and Supabase configurations.

---

## Development Workflow

- Efficient local development with Next.js development server.
- Seamless integration with Supabase Cloud backend.

---

## Testing

- Initially defer automated testing until product-market fit validation.
- Future testing approach: Jest, React Testing Library, Cypress (for E2E).

---

## Next Steps

- Initialize the project using Next.js TypeScript starter with Tailwind.
- Configure Supabase project with OAuth authentication.
- Define initial database schema in Supabase.
- Begin integrating React Query and frontend components.
