# Grovesmith Database Schema Design

## Overview

This schema supports the core functionality of Grovesmith while maintaining flexibility for future enhancements. The design follows PostgreSQL best practices and leverages Supabase's built-in auth system.

---

## Tables

### 1. `managers`

Extends Supabase auth.users with additional profile information.

```sql
CREATE TABLE managers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Notes:**

- Links to Supabase's built-in auth system
- Stores minimal manager profile data
- RLS: Managers can only see/edit their own data

---

### 2. `recipients`

Children/learners managed by a manager.

```sql
CREATE TABLE recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  allowance_amount DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Notes:**

- Custom allowance amount per recipient (manager-controlled)
- `is_archived` for manager-controlled data retention
- Soft delete via `is_active` to preserve historical data
- RLS: Managers can only access their own recipients

---

### 3. `allowance_categories`

The four main categories (Give, Spend, Save, Invest) with current balances.

```sql
CREATE TABLE allowance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL CHECK (category_type IN ('give', 'spend', 'save', 'invest')),
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipient_id, category_type)
);
```

**Notes:**

- Enforces exactly one record per recipient per category
- Balance tracks current amount in each category
- Spend category balance represents total lifetime contributions (for reflection)

---

### 4. `save_subcategories`

Subcategories within the Save category (Clothes, Books, Toys, etc.).

```sql
CREATE TABLE save_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Notes:**

- Flexible subcategories per recipient
- Balance tracking per subcategory
- Soft delete to preserve wishlist history

---

### 5. `wishlist_items`

Items recipients are saving toward.

```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL CHECK (category_type IN ('give', 'save')),
  subcategory_id UUID REFERENCES save_subcategories(id), -- NULL for give items
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0.00,
  url TEXT, -- Optional link to item
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'removed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Notes:**

- Supports both Give causes and Save items
- Progress tracking with current vs target amounts
- Historical preservation via status field
- URL for linking to actual items

---

### 6. `investment_settings`

Configurable investment simulation parameters per recipient.

```sql
CREATE TABLE investment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  dividend_rate DECIMAL(5,4) DEFAULT 0.0500, -- 5% as 0.0500
  payout_threshold DECIMAL(10,2) DEFAULT 50.00,
  payout_frequency TEXT DEFAULT 'biweekly' CHECK (payout_frequency IN ('weekly', 'biweekly', 'monthly')),
  payout_schedule JSONB DEFAULT '{"days": [1, 15]}', -- Flexible scheduling based on frequency
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipient_id)
);
```

**Notes:**

- Configurable dividend rates and thresholds per recipient
- Flexible payout frequency (weekly, biweekly, monthly)
- JSONB schedule allows custom payout days based on frequency
- Examples: {"days": [1, 15]} for biweekly, {"days": [1]} for monthly

---

### 7. `dividend_payments`

Historical record of dividend payouts.

```sql
CREATE TABLE dividend_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  principal_amount DECIMAL(10,2) NOT NULL,
  dividend_rate DECIMAL(5,4) NOT NULL,
  dividend_amount DECIMAL(10,2) NOT NULL,
  payout_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Notes:**

- Complete history of dividend calculations
- Preserves rate and principal for each payment
- Enables investment education and tracking

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_recipients_manager_id ON recipients(manager_id);
CREATE INDEX idx_allowance_categories_recipient_id ON allowance_categories(recipient_id);
CREATE INDEX idx_wishlist_items_recipient_id ON wishlist_items(recipient_id);
CREATE INDEX idx_wishlist_items_status ON wishlist_items(status);
CREATE INDEX idx_dividend_payments_recipient_id ON dividend_payments(recipient_id);
CREATE INDEX idx_dividend_payments_payout_date ON dividend_payments(payout_date);
```

---

## Row Level Security (RLS) Policies

### Managers

```sql
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can view own profile" ON managers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Managers can update own profile" ON managers FOR UPDATE USING (auth.uid() = id);
```

### Recipients and Related Tables

```sql
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can manage own recipients" ON recipients
  FOR ALL USING (manager_id = auth.uid());

-- Similar policies for all recipient-related tables using recipient_id joins
```

---

## Key Design Decisions

1. **Flexible Categories**: Core categories are enforced but subcategories are dynamic
2. **Transaction Audit**: Complete history for educational reflection
3. **Configurable Rules**: Investment settings allow per-child customization
4. **Soft Deletes**: Preserve historical data for learning insights
5. **Future-Proof**: Schema supports planned features (charts, comparisons)
6. **Performance**: Proper indexing for common query patterns

---

## Schema Updates Based on Feedback

### Changes Made:

1. ✅ **Allowance Entry**: No "last allowance" storage needed - will calculate from recent transactions
2. ✅ **Spending Tracking**: Confirmed - Spend balance represents total contributions only
3. ✅ **Wishlist Limits**: Application-level enforcement (3 per Give, 3 per Save subcategory)
4. ✅ **Historical Data**: Added `is_archived` field for manager-controlled data retention
5. ✅ **Birthdate Removed**: Replaced with custom `allowance_amount` per recipient
6. ✅ **Investment Flexibility**: Added configurable payout frequency and JSONB scheduling

### Regarding Anonymized Fields:

Anonymized fields would support future public/shareable views by storing display versions of sensitive data (e.g., "Child A" instead of real names, obscured amounts). Since you're deferring public views, we'll skip these fields for now and can add them later if needed.

## Ready for Implementation

The schema is now updated based on your requirements and ready for database creation. The design supports:

- Custom allowance amounts per recipient
- Flexible investment payout schedules
- Manager-controlled archiving
- Application-level wishlist limits
- Complete transaction history for educational insights
