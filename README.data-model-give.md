# Give Category Data Model

## Overview

The Give category data model supports charitable giving and purposeful donations through a structured system of charitable causes, fund allocation tracking, and donation completion. The model implements a two-phase approach: allocation of unallocated funds to specific causes, followed by donation completion that creates financial transactions and removes money from the Give category.

## Entity Relationships

```
Recipients (1) ──── (3 max) Charitable Causes
     │                       │
     │                       └── (Many) Give Transactions
     │                              │
     └── Give Category ←────────────┘
```

## Core Entities

### Charitable Cause Entity

Represents specific causes or organizations that recipients want to support.

**Key Attributes:**

- `id` - UUID, primary key for cause identification
- `recipient_id` - Foreign key linking to recipient who owns this cause
- `name` - Display name for the charitable cause
- `description` - Optional detailed description of why this cause matters
- `goal_amount` - Target donation amount for this cause
- `current_amount` - Amount currently allocated to this cause
- `due_date` - Optional deadline for completing the donation
- `is_completed` - Boolean indicating if donation has been made
- `completed_at` - Timestamp when donation was completed
- `created_at` - When cause was added
- `updated_at` - Last modification timestamp

**Business Rules:**

- Maximum 3 active (non-completed) causes per recipient
- `current_amount` represents allocated funds, not donated funds
- `goal_amount` must be positive and realistic
- Causes can be completed before reaching full goal amount
- Completed causes retain all historical data
- Application-level enforcement of 3-cause limit (not database constraint)

**Status Calculation:**

- **Active:** `is_completed = false` and either no due date or due date in future
- **Due Soon:** `is_completed = false` and due date within 7 days
- **Overdue:** `is_completed = false` and due date in past
- **Completed:** `is_completed = true`

### Give Balance Structure

Three-tier balance system for Give category financial management.

**Balance Components:**

- **Total Unspent:** Complete Give category balance (from `allowance_categories.balance`)
- **Total Allocated:** Sum of `current_amount` across all active charitable causes
- **Unallocated:** Available funds for new cause allocation (`total_unspent - total_allocated`)

**Balance Calculation:**

```typescript
interface GiveBalanceInfo {
  totalUnspent: number; // allowance_categories.balance WHERE category_type = 'give'
  totalAllocated: number; // SUM(charitable_causes.current_amount) WHERE is_completed = false
  unallocated: number; // totalUnspent - totalAllocated
}
```

**Financial Flow:**

1. **Distribution:** Allowance distribution increases `totalUnspent`
2. **Allocation:** Moving unallocated funds to causes increases `current_amount`
3. **Donation:** Completing donation reduces `totalUnspent` and marks cause as completed

## Database Schema Implementation

### Charitable Causes Table

```sql
CREATE TABLE charitable_causes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10,2) NOT NULL CHECK (goal_amount > 0),
  current_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (current_amount >= 0),
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure current amount doesn't exceed goal
  CONSTRAINT current_within_goal CHECK (current_amount <= goal_amount),

  -- Completed causes must have completion timestamp
  CONSTRAINT completion_consistency CHECK (
    (is_completed = FALSE AND completed_at IS NULL) OR
    (is_completed = TRUE AND completed_at IS NOT NULL)
  )
);
```

### Give Transaction Types

Give category uses the standard transactions table with specific transaction types:

**Transaction Types:**

- **distribution:** Allowance distribution to Give category (increases total unspent)
- **allocation:** Moving unallocated funds to specific cause (updates cause allocation)
- **withdrawal:** Donation completion (reduces total unspent, marks cause complete)

**Transaction Examples:**

```sql
-- Allowance distribution
INSERT INTO transactions (recipient_id, distribution_id, category_type, transaction_type, amount, description)
VALUES ($1, $2, 'give', 'distribution', $3, 'Allowance distribution to Give');

-- Fund allocation to cause
INSERT INTO transactions (recipient_id, category_type, transaction_type, amount, description)
VALUES ($1, 'give', 'allocation', $2, 'Allocated $X to [Cause Name]');

-- Donation completion
INSERT INTO transactions (recipient_id, category_type, transaction_type, amount, description)
VALUES ($1, 'give', 'withdrawal', $2, 'Donated $X to [Cause Name]');
```

## Core Data Operations

### Fund Allocation Process

Moving unallocated funds to specific charitable causes.

**Data Changes:**

1. Verify sufficient unallocated funds available
2. Check that allocation doesn't exceed cause goal
3. Update `charitable_causes.current_amount`
4. Create allocation transaction record
5. Update cause `updated_at` timestamp

**Validation Rules:**

- Allocation amount must be positive
- Cannot exceed available unallocated funds
- Cannot exceed remaining amount needed for cause goal
- Cannot allocate to completed causes

### Donation Completion Process

Final donation that completes charitable gift and removes money from Give category.

**UI Interaction Patterns:**

- **0% Progress**: Single "Give" button only (no funds allocated to complete with)
- **1-99% Progress**: Split button - primary "Give" button with dropdown containing "Mark Complete" option
- **100% Progress**: Single celebratory "Complete & Donate" button replacing Give button
- **Post-Completion**: "Goal Reached & Donated" confirmation message

The split button design encourages the preferred flow of reaching goals before completion while keeping early completion discoverable but secondary.

**Database Function:**

```sql
CREATE OR REPLACE FUNCTION complete_charitable_donation(
  p_cause_id UUID,
  p_recipient_id UUID,
  p_donation_amount DECIMAL(10,2),
  p_cause_name TEXT
) RETURNS VOID AS $$
DECLARE
  v_give_balance DECIMAL(10,2);
BEGIN
  -- Get current Give category balance
  SELECT balance INTO v_give_balance
  FROM allowance_categories
  WHERE recipient_id = p_recipient_id AND category_type = 'give';

  -- Validate sufficient funds
  IF v_give_balance < p_donation_amount THEN
    RAISE EXCEPTION 'Insufficient funds in Give category';
  END IF;

  -- Update category balance (reduce by donation amount)
  UPDATE allowance_categories
  SET balance = balance - p_donation_amount,
      updated_at = NOW()
  WHERE recipient_id = p_recipient_id AND category_type = 'give';

  -- Mark cause as completed
  UPDATE charitable_causes
  SET is_completed = TRUE,
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_cause_id;

  -- Create withdrawal transaction
  INSERT INTO transactions (
    recipient_id, category_type, transaction_type, amount,
    balance_after, description, transaction_date
  ) VALUES (
    p_recipient_id, 'give', 'withdrawal', p_donation_amount,
    v_give_balance - p_donation_amount,
    'Donated $' || p_donation_amount || ' to ' || p_cause_name,
    CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;
```

## Query Patterns & Performance

### Balance Calculation Query

```sql
-- Calculate Give category balance breakdown
WITH give_balance AS (
  SELECT balance as total_unspent
  FROM allowance_categories
  WHERE recipient_id = $1 AND category_type = 'give'
),
allocated_total AS (
  SELECT COALESCE(SUM(current_amount), 0) as total_allocated
  FROM charitable_causes
  WHERE recipient_id = $1 AND is_completed = false
)
SELECT
  gb.total_unspent,
  at.total_allocated,
  gb.total_unspent - at.total_allocated as unallocated
FROM give_balance gb, allocated_total at;
```

### Cause Management Queries

```sql
-- Get all causes for recipient with status
SELECT
  *,
  CASE
    WHEN is_completed THEN 'completed'
    WHEN due_date IS NOT NULL AND due_date < CURRENT_DATE THEN 'overdue'
    WHEN due_date IS NOT NULL AND due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
    ELSE 'active'
  END as status
FROM charitable_causes
WHERE recipient_id = $1
ORDER BY is_completed, due_date NULLS LAST, created_at;

-- Check active cause limit
SELECT COUNT(*) as active_count
FROM charitable_causes
WHERE recipient_id = $1 AND is_completed = false;
```

### Performance Indexes

```sql
-- Core access patterns
CREATE INDEX idx_charitable_causes_recipient_id ON charitable_causes(recipient_id);
CREATE INDEX idx_charitable_causes_completed ON charitable_causes(is_completed);
CREATE INDEX idx_charitable_causes_due_date ON charitable_causes(due_date) WHERE due_date IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_charitable_causes_recipient_active ON charitable_causes(recipient_id, is_completed);
CREATE INDEX idx_charitable_causes_recipient_status ON charitable_causes(recipient_id, is_completed, due_date);
```

## Security & Access Control

### Row-Level Security

```sql
-- Causes accessible through recipient ownership
CREATE POLICY "charitable_causes_recipient_access" ON charitable_causes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipients r
      WHERE r.id = charitable_causes.recipient_id
      AND r.manager_id = auth.uid()
    )
  );
```

### Data Validation

- **Cause Limit Enforcement:** Application logic prevents exceeding 3 active causes
- **Allocation Validation:** Server-side checks prevent over-allocation or impossible amounts
- **Completion Integrity:** Database constraints ensure completion status consistency
- **Manager Authorization:** All operations verified against recipient ownership

## Educational Data Insights

### Progress Tracking

- **Allocation Patterns:** How frequently children move unallocated funds to causes
- **Goal Achievement:** Percentage of causes that reach completion
- **Timeline Analysis:** How long children take to complete charitable goals
- **Cause Selection:** Types of causes children choose to support

### Learning Indicators

- **Planning Behavior:** Children who consistently allocate vs. those who leave funds unallocated
- **Goal Completion:** Follow-through rate from cause creation to donation completion
- **Amount Patterns:** How goal amounts correlate with completion rates
- **Priority Management:** How children handle multiple competing causes

### Reflection Opportunities

- **Cause History:** Review of completed and removed causes for learning discussion
- **Allocation Journey:** Timeline of how funds moved from unallocated to donated
- **Impact Discussion:** Connection between donations and real-world charitable impact
- **Decision Evolution:** How cause selection and goal-setting improve over time

## Integration Points

### Distribution System

- **Fund Source:** Give distributions provide the money that becomes available for allocation
- **Balance Updates:** Distribution system increases total unspent balance
- **Transaction Links:** Distribution transactions connect to Give category transaction history

### Trophy System

- **Achievement Triggers:** Give donations and allocations can trigger trophy awards
- **Milestone Recognition:** Generous Giver and Champion Giver trophies based on Give activity
- **Progress Celebration:** Visual recognition of charitable giving milestones

### Family Learning

- **Discussion Prompts:** Cause selection and completion provide rich conversation opportunities
- **Value Exploration:** Children's cause choices reveal their developing values and interests
- **Empathy Development:** Charitable giving process builds understanding of others' needs
- **Planning Skills:** Multi-cause management teaches resource allocation and prioritization

This Give category data model supports meaningful charitable education while maintaining complete financial transparency and robust data integrity, enabling children to develop purposeful giving habits through structured, trackable charitable experiences.
