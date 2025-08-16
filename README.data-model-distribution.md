# Distribution System Data Model

## Overview

The distribution system data model captures the complete allowance distribution process, from pooled undistributed funds through individual category allocations to detailed transaction audit trails. This system ensures complete financial transparency and educational accountability while supporting flexible distribution timing and amounts.

## Entity Relationships

```
Recipients (1) ──── (Many) Distributions
     │                      │
     │                      └── (Many) Transactions
     │                             │
     └── (4) Categories ←──────────┘
```

## Core Entities

### Distribution Entity

Master record of each allowance distribution event.

**Key Attributes:**

- `id` - UUID, primary key for distribution identification
- `recipient_id` - Foreign key linking to target recipient
- `manager_id` - Foreign key linking to authorizing manager
- `distribution_date` - Date the distribution represents (supports backdating)
- `total_amount` - Sum of all category allocations
- `give_amount` - Amount allocated to Give category
- `spend_amount` - Amount allocated to Spend category
- `save_amount` - Amount allocated to Save category
- `invest_amount` - Amount allocated to Invest category
- `notes` - Optional memo or description
- `created_at` - When distribution was actually created
- `updated_at` - Last modification timestamp

**Business Rules:**

- `total_amount` must equal sum of individual category amounts
- All category amounts must be non-negative
- `distribution_date` can be in the past (backdating support)
- Manager must own the recipient to create distribution
- Distribution creation triggers automatic balance updates and transaction creation

**Data Validation:**

- Total amount must be positive (no zero-dollar distributions)
- Individual category amounts cannot exceed reasonable limits
- Distribution date cannot be too far in the future
- Manager-recipient relationship verified before creation

### Transaction Entity

Detailed audit trail of individual financial movements.

**Key Attributes:**

- `id` - UUID, primary key for transaction identification
- `recipient_id` - Foreign key linking to affected recipient
- `distribution_id` - Foreign key linking to originating distribution (nullable)
- `category_type` - Target category: 'give', 'spend', 'save', 'invest'
- `transaction_type` - Type of transaction: 'distribution', 'withdrawal', 'dividend', 'allocation'
- `amount` - Dollar amount of the transaction
- `balance_after` - Category balance after this transaction
- `description` - Human-readable description of transaction
- `transaction_date` - Date the financial event represents
- `created_at` - When transaction record was created

**Business Rules:**

- Every non-zero category allocation creates a transaction record
- `balance_after` reflects category balance immediately after transaction
- Transaction types support different financial operations:
  - **Distribution:** Initial allowance allocation to categories
  - **Withdrawal:** Money removed from category (donations, purchases)
  - **Dividend:** Investment earnings added to invest category
  - **Allocation:** Internal movement between subcategories or goals
- Transaction descriptions provide educational context

**Transaction Types by Category:**

- **Give Transactions:** Distributions, allocations to causes, donations
- **Spend Transactions:** Distributions only (no individual purchase tracking)
- **Save Transactions:** Distributions, allocations to wishlist items, purchases
- **Invest Transactions:** Distributions, dividend payments, milestone withdrawals

## Specialized Data Structures

### Undistributed Allowance Calculation

Virtual entity calculated from recipient creation date and distribution history.

**Calculated Fields:**

- `weeks_since_created` - Time-based allowance accumulation
- `total_allowance_owed` - Weeks × weekly allowance amount
- `total_distributed` - Sum of all historical distributions
- `undistributed_amount` - Owed minus distributed
- `weekly_allowance` - Current allowance rate for recipient

**Calculation Logic:**

```typescript
interface UndistributedCalculation {
  weeksSinceCreated: number; // (now - recipient.created_at) / 7 days
  totalAllowanceOwed: number; // weeks × recipient.allowance_amount
  totalDistributed: number; // SUM(distributions.total_amount)
  undistributedAmount: number; // owed - distributed
  weeklyAllowance: number; // recipient.allowance_amount
}
```

**Business Rules:**

- Calculation starts from recipient creation date
- Allowance accumulates weekly based on recipient's allowance amount
- Historical distributions reduce undistributed amount
- Negative undistributed amounts indicate over-distribution
- Calculation supports flexible distribution timing

### Balance Update Mechanics

Automatic balance management through database triggers.

**Update Process:**

1. Distribution record created with category amounts
2. Trigger function executes automatically
3. Each category balance updated by adding distribution amount
4. Individual transaction records created for non-zero amounts
5. Transaction `balance_after` field populated with new balance

**Balance Calculations by Category:**

- **Give:** `balance = balance + distribution_amount`
- **Spend:** `balance = balance + distribution_amount` (lifetime total)
- **Save:** `balance = balance + distribution_amount`
- **Invest:** `balance = balance + distribution_amount`

## Database Schema Implementation

### Distributions Table

```sql
CREATE TABLE distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  distribution_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  give_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (give_amount >= 0),
  spend_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (spend_amount >= 0),
  save_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (save_amount >= 0),
  invest_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (invest_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure total equals sum of parts
  CONSTRAINT total_equals_sum CHECK (
    total_amount = give_amount + spend_amount + save_amount + invest_amount
  )
);
```

### Transactions Table

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

### Distribution Processing Trigger

```sql
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

  -- Create transaction records for non-zero amounts
  INSERT INTO transactions (
    recipient_id, distribution_id, category_type, transaction_type,
    amount, balance_after, transaction_date, description
  )
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
    NEW.distribution_date,
    CASE
      WHEN ac.category_type = 'give' THEN 'Allowance distribution to Give'
      WHEN ac.category_type = 'spend' THEN 'Allowance distribution to Spend'
      WHEN ac.category_type = 'save' THEN 'Allowance distribution to Save'
      WHEN ac.category_type = 'invest' THEN 'Allowance distribution to Invest'
    END
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

CREATE TRIGGER process_distribution_trigger
  AFTER INSERT ON distributions
  FOR EACH ROW EXECUTE FUNCTION process_distribution();
```

## Query Patterns & Performance

### Common Queries

```sql
-- Calculate undistributed allowance
SELECT
  r.id,
  r.allowance_amount,
  EXTRACT(DAYS FROM NOW() - r.created_at) / 7 as weeks_since_created,
  (EXTRACT(DAYS FROM NOW() - r.created_at) / 7) * r.allowance_amount as total_owed,
  COALESCE(SUM(d.total_amount), 0) as total_distributed,
  ((EXTRACT(DAYS FROM NOW() - r.created_at) / 7) * r.allowance_amount) - COALESCE(SUM(d.total_amount), 0) as undistributed
FROM recipients r
LEFT JOIN distributions d ON r.id = d.recipient_id
WHERE r.manager_id = auth.uid()
GROUP BY r.id, r.allowance_amount, r.created_at;

-- Transaction history for recipient
SELECT t.*, d.distribution_date, d.notes
FROM transactions t
LEFT JOIN distributions d ON t.distribution_id = d.id
WHERE t.recipient_id = $1
ORDER BY t.transaction_date DESC, t.created_at DESC;

-- Category-specific transaction history
SELECT * FROM transactions
WHERE recipient_id = $1 AND category_type = $2
ORDER BY transaction_date DESC, created_at DESC;
```

### Performance Indexes

```sql
-- Core relationship indexes
CREATE INDEX idx_distributions_recipient_id ON distributions(recipient_id);
CREATE INDEX idx_distributions_manager_id ON distributions(manager_id);
CREATE INDEX idx_distributions_date ON distributions(distribution_date);
CREATE INDEX idx_transactions_recipient_id ON transactions(recipient_id);
CREATE INDEX idx_transactions_category_type ON transactions(category_type);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- Composite indexes for common queries
CREATE INDEX idx_transactions_recipient_category ON transactions(recipient_id, category_type);
CREATE INDEX idx_distributions_recipient_date ON distributions(recipient_id, distribution_date);
```

## Security & Access Control

### Row-Level Security

```sql
-- Distributions accessible through manager ownership
CREATE POLICY "distributions_manager_access" ON distributions
  FOR ALL USING (manager_id = auth.uid());

-- Transactions accessible through recipient ownership
CREATE POLICY "transactions_recipient_access" ON transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipients r
      WHERE r.id = transactions.recipient_id
      AND r.manager_id = auth.uid()
    )
  );
```

### Data Protection

- **Financial Audit Trail:** Complete transaction history preserved indefinitely
- **Manager Isolation:** Each family's financial data completely separate
- **Immutable Records:** Historical distributions and transactions cannot be modified
- **Validation Layers:** Multiple checks prevent invalid financial data

## Integration Points

### Category Systems

- **Give Category:** Distributions fund charitable cause allocations
- **Spend Category:** Distributions represent contribution history for reflection
- **Save Category:** Distributions provide funds for wishlist goal pursuit
- **Invest Category:** Distributions create principal for dividend calculations

### Educational Features

- **Historical Analysis:** Transaction patterns support learning discussions
- **Progress Tracking:** Distribution consistency indicates financial habit development
- **Goal Achievement:** Distribution timing correlates with savings and giving milestones
- **Family Planning:** Distribution data supports allowance adjustment decisions

### External Systems

- **Trophy System:** Distribution milestones can trigger achievement recognition
- **Analytics:** Distribution patterns inform educational effectiveness metrics
- **Reporting:** Complete audit trail supports financial education assessment

This distribution data model ensures complete financial transparency, supports flexible family allowance management, and provides the detailed tracking necessary for effective financial education while maintaining robust security and data integrity.
