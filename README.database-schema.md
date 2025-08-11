# Grovesmith Database Schema & Design

## Overview

The Grovesmith database schema is designed to support comprehensive financial education functionality while maintaining data integrity, performance, and scalability. Built on PostgreSQL with Supabase's authentication system, the schema leverages Row-Level Security (RLS) for multi-tenant data isolation and database triggers for automated financial calculations.

## Design Principles

### Core Architectural Decisions
- **PostgreSQL Foundation:** Robust relational database with ACID compliance and advanced features
- **Row-Level Security:** Database-level access control ensuring complete family data isolation
- **Automatic Triggers:** Database functions handle complex balance calculations and transaction creation
- **Audit Trail Design:** Complete historical record of all financial activities for educational analysis
- **Soft Delete Strategy:** Preserve historical data while allowing logical deletion for privacy

### Educational Data Requirements
- **Financial Transparency:** All money movements tracked and auditable
- **Learning History:** Preserve decision patterns and outcomes for reflection and learning
- **Privacy Protection:** Complete separation between family accounts with no cross-tenant data access
- **Real-time Accuracy:** Balance calculations and transaction creation handled atomically

## Core Tables

### Authentication & User Management

#### `managers` Table
Extends Supabase's built-in authentication with profile information:

```sql
CREATE TABLE managers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- **Direct Auth Integration:** Links to Supabase auth.users table
- **Automatic Cleanup:** Cascade delete removes all related data when user account is deleted
- **Profile Extension:** Additional fields beyond basic authentication data
- **Audit Timestamps:** Track account creation and modifications

#### `recipients` Table
Children and learners managed by each manager:

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

**Key Features:**
- **Custom Allowance:** Per-recipient allowance amounts (not age-based calculation)
- **Soft Delete Options:** Both `is_active` and `is_archived` for flexible data management
- **Profile Customization:** Avatar support for personalized profiles
- **Historical Preservation:** Archive recipients rather than hard delete to preserve transaction history

### Financial Category Management

#### `allowance_categories` Table
Core financial categories with current balances:

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

**Key Features:**
- **Enforced Categories:** Database constraint ensures only the four core categories exist
- **Unique Constraint:** Exactly one record per recipient per category
- **Balance Tracking:** Real-time balance maintained through database triggers
- **Automatic Creation:** Trigger creates all four categories when recipient is added

### Distribution & Transaction System

#### `distributions` Table
Master records of allowance distributions:

```sql
CREATE TABLE distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  distribution_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  give_amount DECIMAL(10,2) DEFAULT 0.00,
  spend_amount DECIMAL(10,2) DEFAULT 0.00,
  save_amount DECIMAL(10,2) DEFAULT 0.00,
  invest_amount DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- **Complete Distribution Record:** Tracks total amount and per-category allocation
- **Date Flexibility:** Support for backdated distributions  
- **Audit Trail:** Links to both manager and recipient for complete accountability
- **Automatic Processing:** Database triggers create individual transactions and update balances

#### `transactions` Table
Detailed audit trail of all financial movements:

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  distribution_id UUID REFERENCES distributions(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL CHECK (category_type IN ('give', 'spend', 'save', 'invest')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('distribution', 'withdrawal', 'dividend', 'allocation')),
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- **Complete Audit Trail:** Every financial movement tracked individually
- **Balance Snapshots:** `balance_after` field provides historical balance information
- **Transaction Types:** Flexible system supporting distributions, withdrawals, dividends, and internal allocations
- **Educational Value:** Complete transaction history enables learning and reflection

### Give Category Features

#### `charitable_causes` Table ( Implemented)
Charitable causes for the Give category:

```sql
CREATE TABLE charitable_causes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0.00,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- **Goal Tracking:** Target amount with progress tracking through `current_amount`
- **Completion Status:** Track completed charitable gifts with timestamp
- **Optional Deadlines:** Due dates for time-sensitive charitable opportunities
- **Application-Level Limits:** Maximum 3 active causes per recipient (enforced in application logic)

## Future Schema Extensions

### Save Category Features (Planned)

#### `save_subcategories` Table
Organizational subcategories within Save:

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

#### `wishlist_items` Table
Items recipients are saving toward:

```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES save_subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0.00,
  url TEXT,
  priority_order INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'removed')),
  completed_at TIMESTAMPTZ,
  removed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Investment Category Features (Planned)

#### `investment_settings` Table
Configurable investment parameters:

```sql
CREATE TABLE investment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  dividend_rate DECIMAL(5,4) DEFAULT 0.0500,
  payout_threshold DECIMAL(10,2) DEFAULT 50.00,
  payout_frequency TEXT DEFAULT 'biweekly' CHECK (payout_frequency IN ('weekly', 'biweekly', 'monthly')),
  payout_schedule JSONB DEFAULT '{"days": [1, 15]}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipient_id)
);
```

#### `dividend_payments` Table
Historical record of dividend calculations:

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

## Database Functions & Triggers

### Automatic Category Creation
```sql
-- Trigger function to create all four categories for new recipients
CREATE OR REPLACE FUNCTION create_recipient_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO allowance_categories (recipient_id, category_type, balance)
  VALUES 
    (NEW.id, 'give', 0.00),
    (NEW.id, 'spend', 0.00),
    (NEW.id, 'save', 0.00),
    (NEW.id, 'invest', 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_categories_trigger
  AFTER INSERT ON recipients
  FOR EACH ROW EXECUTE FUNCTION create_recipient_categories();
```

### Distribution Processing
```sql
-- Function to process distribution and update balances
CREATE OR REPLACE FUNCTION process_distribution()
RETURNS TRIGGER AS $$
BEGIN
  -- Update category balances
  UPDATE allowance_categories SET
    balance = balance + CASE 
      WHEN category_type = 'give' THEN NEW.give_amount
      WHEN category_type = 'spend' THEN NEW.spend_amount  
      WHEN category_type = 'save' THEN NEW.save_amount
      WHEN category_type = 'invest' THEN NEW.invest_amount
      ELSE 0
    END,
    updated_at = NOW()
  WHERE recipient_id = NEW.recipient_id;

  -- Create individual transaction records
  INSERT INTO transactions (recipient_id, distribution_id, category_type, transaction_type, amount, balance_after, transaction_date)
  SELECT 
    NEW.recipient_id,
    NEW.id,
    ac.category_type,
    'distribution',
    CASE 
      WHEN ac.category_type = 'give' THEN NEW.give_amount
      WHEN ac.category_type = 'spend' THEN NEW.spend_amount
      WHEN ac.category_type = 'save' THEN NEW.save_amount
      WHEN ac.category_type = 'invest' THEN NEW.invest_amount
    END,
    ac.balance,
    NEW.distribution_date
  FROM allowance_categories ac
  WHERE ac.recipient_id = NEW.recipient_id
  AND CASE 
    WHEN ac.category_type = 'give' THEN NEW.give_amount
    WHEN ac.category_type = 'spend' THEN NEW.spend_amount
    WHEN ac.category_type = 'save' THEN NEW.save_amount
    WHEN ac.category_type = 'invest' THEN NEW.invest_amount
  END > 0;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Row-Level Security Policies

### Complete Data Isolation
```sql
-- Enable RLS on all tables
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charitable_causes ENABLE ROW LEVEL SECURITY;

-- Manager access policies
CREATE POLICY "Managers can view own profile" ON managers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Managers can update own profile" ON managers
  FOR UPDATE USING (auth.uid() = id);

-- Recipient access policies  
CREATE POLICY "Managers can manage own recipients" ON recipients
  FOR ALL USING (manager_id = auth.uid());

-- Category and transaction policies
CREATE POLICY "Access through recipient ownership" ON allowance_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipients r 
      WHERE r.id = allowance_categories.recipient_id 
      AND r.manager_id = auth.uid()
    )
  );
```

## Performance Optimizations

### Strategic Indexing
```sql
-- Core relationship indexes
CREATE INDEX idx_recipients_manager_id ON recipients(manager_id);
CREATE INDEX idx_allowance_categories_recipient_id ON allowance_categories(recipient_id);
CREATE INDEX idx_distributions_recipient_id ON distributions(recipient_id);
CREATE INDEX idx_distributions_manager_id ON distributions(manager_id);
CREATE INDEX idx_transactions_recipient_id ON transactions(recipient_id);
CREATE INDEX idx_transactions_category_type ON transactions(category_type);
CREATE INDEX idx_charitable_causes_recipient_id ON charitable_causes(recipient_id);

-- Date-based queries
CREATE INDEX idx_distributions_date ON distributions(distribution_date);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
```

### Query Optimization Patterns
- **JOINs Over Subqueries:** Efficient relationship traversal
- **Composite Indexes:** Multi-column indexes for common filter combinations
- **Partial Indexes:** Indexes on filtered subsets (e.g., active recipients only)
- **Connection Pooling:** Supabase handles optimal connection management

## Data Migration & Versioning

### Schema Evolution Strategy
- **Backward Compatible Changes:** Additive changes that don't break existing functionality
- **Database Migrations:** Version-controlled schema changes with rollback capability
- **Data Preservation:** All migrations preserve existing data and relationships
- **Testing Protocol:** All migrations tested on staging environment before production

### Migration Examples
```sql
-- Adding new column (backward compatible)
ALTER TABLE recipients ADD COLUMN avatar_url TEXT;

-- Adding new table with proper relationships
CREATE TABLE new_feature_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  -- ... other columns
);
```

## Backup & Recovery

### Data Protection Strategy
- **Automated Backups:** Supabase provides automatic daily backups
- **Point-in-Time Recovery:** Ability to restore to any moment in the last 7 days
- **Cross-Region Replication:** Geographic redundancy for disaster recovery
- **Testing Protocol:** Regular backup restoration tests to verify data integrity

### Business Continuity
- **Financial Data Priority:** Extra protection for financial transaction data
- **Audit Trail Preservation:** Complete transaction history maintained indefinitely
- **Privacy Compliance:** Backup systems respect data privacy and family isolation requirements

This database schema provides a robust foundation for all Grovesmith functionality while maintaining the flexibility to grow with future educational features and requirements.