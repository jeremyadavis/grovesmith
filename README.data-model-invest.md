# Invest Category Data Model

## Overview

The Invest category data model supports investment education through simulated dividend payments, configurable investment parameters, milestone tracking, and eventual transition to real investment accounts. This comprehensive system teaches compound growth, patience, and investment fundamentals through progressive complexity and real-world connections.

## Entity Relationships

```
Recipients (1) ──── (1) Investment Settings
     │                   │
     │                   ├── (Many) Dividend Payments
     │                   │
     └── Invest Category ├── (Many) Investment Milestones
                         │
                         └── (Many) Real Investment Records
```

## Core Entities

### Investment Settings Entity

Configurable parameters controlling each recipient's investment simulation experience.

**Key Attributes:**

- `id` - UUID, primary key for settings identification
- `recipient_id` - Foreign key linking to recipient (one-to-one relationship)
- `dividend_rate` - Decimal rate for dividend calculation (default: 0.0500 for 5%)
- `payout_threshold` - Dollar amount triggering real investment transition (default: 50.00)
- `payout_frequency` - Enum: 'weekly', 'biweekly', 'monthly' (default: 'biweekly')
- `payout_schedule` - JSONB array of days for dividend payments (default: [1, 15])
- `is_active` - Boolean indicating if dividend payments are currently running
- `last_dividend_date` - Date of most recent dividend payment
- `created_at` - When investment settings were established
- `updated_at` - Last settings modification

**Business Rules:**

- Exactly one investment settings record per recipient
- Dividend rate must be positive and reasonable (0.01% to 10%)
- Payout threshold must be positive and achievable ($10 to $1000 range)
- Payout schedule must align with frequency (1-2 days for biweekly, 1 day for monthly)
- Settings can be customized per recipient to match learning goals and family preferences

**Payout Schedule Examples:**

```json
// Biweekly on 1st and 15th
{"days": [1, 15]}

// Weekly on Fridays
{"days": [5]}

// Monthly on 1st
{"days": [1]}

// Custom biweekly on 5th and 20th
{"days": [5, 20]}
```

### Dividend Payments Entity

Historical record of all dividend calculations and payments.

**Key Attributes:**

- `id` - UUID, primary key for dividend payment identification
- `recipient_id` - Foreign key linking to recipient who received dividend
- `principal_amount` - Invest category balance when dividend was calculated
- `dividend_rate` - Rate used for this specific dividend calculation
- `dividend_amount` - Dollar amount of dividend payment
- `payout_date` - Date dividend was calculated and paid
- `created_at` - When dividend record was created

**Business Rules:**

- Dividend amount = principal amount × dividend rate
- Principal amount captured at time of dividend calculation
- Rate preserved for historical accuracy (settings may change over time)
- Dividends automatically added to Invest category balance
- Complete historical record enables compound growth visualization

**Calculation Examples:**

```typescript
// Biweekly 5% dividend calculation
const principalAmount = 20.0; // Current Invest balance
const dividendRate = 0.05; // 5% rate
const dividend = principalAmount * dividendRate; // $1.00

// New balance after dividend
const newBalance = principalAmount + dividend; // $21.00
```

### Investment Milestones Entity

Records of significant investment achievements and real investment transitions.

**Key Attributes:**

- `id` - UUID, primary key for milestone identification
- `recipient_id` - Foreign key linking to recipient who achieved milestone
- `milestone_amount` - Dollar amount that triggered the milestone
- `achievement_date` - Date when milestone was reached
- `milestone_type` - Type of milestone: 'threshold_reached', 'real_investment_made', 'portfolio_milestone'
- `description` - Human-readable description of the milestone
- `stock_purchases` - JSONB array of stocks purchased with milestone funds
- `notes` - Optional notes about milestone achievement or celebration
- `created_at` - When milestone record was created

**Business Rules:**

- Milestones triggered automatically when thresholds are reached
- Multiple milestone types support different achievement recognition
- Stock purchase information helps track real investment progression
- Milestone achievements can trigger trophy awards or special recognition

**Milestone Types:**

- **threshold_reached:** Invest balance reached payout threshold (e.g., $50)
- **real_investment_made:** Actual stock purchase completed with milestone funds
- **portfolio_milestone:** Significant real portfolio achievements (e.g., $500 total invested)

### Real Investment Tracking Entity (Future Enhancement)

Records of actual investments made with milestone funds.

**Key Attributes:**

- `id` - UUID, primary key for investment record identification
- `recipient_id` - Foreign key linking to recipient who owns investment
- `milestone_id` - Foreign key linking to triggering milestone
- `stock_symbol` - Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
- `shares` - Number of shares purchased
- `purchase_price` - Price per share at purchase time
- `purchase_date` - Date when stock was actually purchased
- `current_price` - Last known price per share (updated periodically)
- `current_value` - Current total value of this investment
- `last_updated` - When price information was last refreshed
- `notes` - Optional notes about investment choice or reasoning

**Performance Tracking:**

- **Total Investment:** Purchase price × shares
- **Current Value:** Current price × shares
- **Gain/Loss:** Current value - total investment
- **Percentage Return:** (Current value / total investment - 1) × 100

## Database Schema Implementation

### Investment Settings Table

```sql
CREATE TABLE investment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  dividend_rate DECIMAL(5,4) DEFAULT 0.0500 CHECK (dividend_rate > 0 AND dividend_rate <= 0.1000),
  payout_threshold DECIMAL(10,2) DEFAULT 50.00 CHECK (payout_threshold > 0 AND payout_threshold <= 1000.00),
  payout_frequency TEXT DEFAULT 'biweekly' CHECK (payout_frequency IN ('weekly', 'biweekly', 'monthly')),
  payout_schedule JSONB DEFAULT '{"days": [1, 15]}',
  is_active BOOLEAN DEFAULT TRUE,
  last_dividend_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(recipient_id)
);
```

### Dividend Payments Table

```sql
CREATE TABLE dividend_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  principal_amount DECIMAL(10,2) NOT NULL CHECK (principal_amount >= 0),
  dividend_rate DECIMAL(5,4) NOT NULL CHECK (dividend_rate > 0),
  dividend_amount DECIMAL(10,2) NOT NULL CHECK (dividend_amount >= 0),
  payout_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Investment Milestones Table

```sql
CREATE TABLE investment_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  milestone_amount DECIMAL(10,2) NOT NULL CHECK (milestone_amount > 0),
  achievement_date DATE NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('threshold_reached', 'real_investment_made', 'portfolio_milestone')),
  description TEXT NOT NULL,
  stock_purchases JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Real Investment Tracking Table (Future)

```sql
CREATE TABLE real_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES investment_milestones(id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  shares DECIMAL(10,6) NOT NULL CHECK (shares > 0),
  purchase_price DECIMAL(10,4) NOT NULL CHECK (purchase_price > 0),
  purchase_date DATE NOT NULL,
  current_price DECIMAL(10,4),
  current_value DECIMAL(10,2),
  last_updated TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Core Investment Operations

### Dividend Calculation and Payment

```sql
CREATE OR REPLACE FUNCTION process_dividend_payment(
  p_recipient_id UUID,
  p_payout_date DATE DEFAULT CURRENT_DATE
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_principal DECIMAL(10,2);
  v_dividend_rate DECIMAL(5,4);
  v_dividend_amount DECIMAL(10,2);
  v_settings investment_settings%ROWTYPE;
BEGIN
  -- Get investment settings
  SELECT * INTO v_settings
  FROM investment_settings
  WHERE recipient_id = p_recipient_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active investment settings found for recipient';
  END IF;

  -- Get current Invest category balance
  SELECT balance INTO v_principal
  FROM allowance_categories
  WHERE recipient_id = p_recipient_id AND category_type = 'invest';

  -- Calculate dividend
  v_dividend_rate := v_settings.dividend_rate;
  v_dividend_amount := v_principal * v_dividend_rate;

  -- Only process if dividend amount is meaningful (> $0.01)
  IF v_dividend_amount >= 0.01 THEN
    -- Update Invest category balance
    UPDATE allowance_categories
    SET balance = balance + v_dividend_amount,
        updated_at = NOW()
    WHERE recipient_id = p_recipient_id AND category_type = 'invest';

    -- Record dividend payment
    INSERT INTO dividend_payments (
      recipient_id, principal_amount, dividend_rate,
      dividend_amount, payout_date
    ) VALUES (
      p_recipient_id, v_principal, v_dividend_rate,
      v_dividend_amount, p_payout_date
    );

    -- Create dividend transaction
    INSERT INTO transactions (
      recipient_id, category_type, transaction_type, amount,
      balance_after, description, transaction_date
    ) VALUES (
      p_recipient_id, 'invest', 'dividend', v_dividend_amount,
      v_principal + v_dividend_amount,
      'Dividend payment: $' || v_dividend_amount || ' on $' || v_principal,
      p_payout_date
    );

    -- Update last dividend date
    UPDATE investment_settings
    SET last_dividend_date = p_payout_date,
        updated_at = NOW()
    WHERE recipient_id = p_recipient_id;
  END IF;

  RETURN v_dividend_amount;
END;
$$ LANGUAGE plpgsql;
```

### Milestone Achievement Processing

```sql
CREATE OR REPLACE FUNCTION check_investment_milestone(
  p_recipient_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance DECIMAL(10,2);
  v_threshold DECIMAL(10,2);
  v_existing_milestone_count INTEGER;
BEGIN
  -- Get current Invest balance
  SELECT balance INTO v_current_balance
  FROM allowance_categories
  WHERE recipient_id = p_recipient_id AND category_type = 'invest';

  -- Get threshold from settings
  SELECT payout_threshold INTO v_threshold
  FROM investment_settings
  WHERE recipient_id = p_recipient_id;

  -- Check if milestone already exists for this threshold
  SELECT COUNT(*) INTO v_existing_milestone_count
  FROM investment_milestones
  WHERE recipient_id = p_recipient_id
    AND milestone_amount = v_threshold
    AND milestone_type = 'threshold_reached';

  -- Create milestone if threshold reached and not already recorded
  IF v_current_balance >= v_threshold AND v_existing_milestone_count = 0 THEN
    INSERT INTO investment_milestones (
      recipient_id, milestone_amount, achievement_date,
      milestone_type, description
    ) VALUES (
      p_recipient_id, v_threshold, CURRENT_DATE,
      'threshold_reached',
      'Reached $' || v_threshold || ' investment milestone - ready for real investing!'
    );

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

## Query Patterns & Performance

### Investment Performance Queries

```sql
-- Investment growth over time
SELECT
  DATE_TRUNC('month', dp.payout_date) as month,
  AVG(dp.principal_amount) as avg_principal,
  SUM(dp.dividend_amount) as monthly_dividends,
  COUNT(*) as dividend_count
FROM dividend_payments dp
WHERE dp.recipient_id = $1
  AND dp.payout_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', dp.payout_date)
ORDER BY month;

-- Compound growth calculation
WITH growth_timeline AS (
  SELECT
    payout_date,
    principal_amount,
    dividend_amount,
    SUM(dividend_amount) OVER (ORDER BY payout_date) as cumulative_dividends
  FROM dividend_payments
  WHERE recipient_id = $1
  ORDER BY payout_date
)
SELECT
  payout_date,
  principal_amount,
  cumulative_dividends,
  principal_amount + cumulative_dividends as total_value
FROM growth_timeline;
```

### Milestone and Achievement Queries

```sql
-- Investment milestone history
SELECT
  im.*,
  CASE
    WHEN im.milestone_type = 'threshold_reached' THEN 'Ready for Real Investment'
    WHEN im.milestone_type = 'real_investment_made' THEN 'Stock Purchase Completed'
    WHEN im.milestone_type = 'portfolio_milestone' THEN 'Portfolio Achievement'
  END as milestone_description
FROM investment_milestones im
WHERE im.recipient_id = $1
ORDER BY im.achievement_date DESC;

-- Next milestone progress
SELECT
  is_settings.payout_threshold as next_milestone,
  ac.balance as current_balance,
  is_settings.payout_threshold - ac.balance as amount_needed,
  CASE
    WHEN ac.balance >= is_settings.payout_threshold THEN 'Milestone Reached!'
    ELSE ROUND((ac.balance / is_settings.payout_threshold * 100), 1) || '% Complete'
  END as progress_status
FROM investment_settings is_settings
JOIN allowance_categories ac ON is_settings.recipient_id = ac.recipient_id
WHERE is_settings.recipient_id = $1 AND ac.category_type = 'invest';
```

### Performance Indexes

```sql
-- Core relationship indexes
CREATE INDEX idx_investment_settings_recipient_id ON investment_settings(recipient_id);
CREATE INDEX idx_dividend_payments_recipient_id ON dividend_payments(recipient_id);
CREATE INDEX idx_dividend_payments_date ON dividend_payments(payout_date);
CREATE INDEX idx_investment_milestones_recipient_id ON investment_milestones(recipient_id);
CREATE INDEX idx_investment_milestones_type ON investment_milestones(milestone_type);

-- Performance optimization indexes
CREATE INDEX idx_dividend_payments_recipient_date ON dividend_payments(recipient_id, payout_date);
CREATE INDEX idx_milestones_recipient_date ON investment_milestones(recipient_id, achievement_date);
```

## Educational Data Analysis

### Investment Learning Metrics

```sql
-- Investment consistency analysis
SELECT
  r.id,
  r.name,
  COUNT(dp.id) as total_dividends_received,
  SUM(dp.dividend_amount) as total_dividend_earnings,
  AVG(dp.principal_amount) as avg_investment_balance,
  MAX(ac.balance) as peak_investment_balance
FROM recipients r
JOIN dividend_payments dp ON r.id = dp.recipient_id
JOIN allowance_categories ac ON r.id = ac.recipient_id
WHERE ac.category_type = 'invest' AND r.manager_id = auth.uid()
GROUP BY r.id, r.name;

-- Compound growth demonstration
SELECT
  recipient_id,
  MIN(payout_date) as first_dividend,
  MAX(payout_date) as latest_dividend,
  COUNT(*) as total_payments,
  SUM(dividend_amount) as total_earned,
  MIN(principal_amount) as starting_principal,
  MAX(principal_amount + dividend_amount) as ending_balance,
  ROUND(((MAX(principal_amount + dividend_amount) - MIN(principal_amount)) / MIN(principal_amount) * 100), 2) as total_growth_percent
FROM dividend_payments
WHERE recipient_id = $1
GROUP BY recipient_id;
```

### Investment Behavior Insights

- **Consistency Patterns:** How regularly children allocate funds to investment vs other categories
- **Milestone Motivation:** Whether approaching milestones increases investment allocation
- **Patience Development:** Time between investment start and first milestone achievement
- **Real Investment Engagement:** Participation level when transitioning to actual stock purchases

## Integration Points

### Distribution System

- **Investment Funding:** Allowance distributions to Invest category provide principal for dividend calculations
- **Balance Growth:** Dividend payments increase Invest category balance automatically
- **Milestone Triggers:** Balance updates check for milestone achievements

### Trophy System

- **Smart Investor Trophy:** Recognition for first investment category participation
- **Investment Milestones:** Special achievements for reaching significant investment thresholds
- **Long-term Recognition:** Trophies for sustained investment behavior over time

### Real-World Transition

- **UGMA/UTMA Integration:** Milestone achievements trigger real investment account opening
- **Stock Selection Education:** Children participate in choosing actual stocks with milestone funds
- **Portfolio Tracking:** Long-term tracking of real investment performance vs simulation
- **Financial Literacy:** Connection between investment simulation and real market concepts

### Family Education

- **Compound Growth Visualization:** Charts showing how money grows over time through reinvestment
- **Milestone Celebrations:** Recognition events when children reach investment thresholds
- **Investment Discussions:** Dividend payments provide regular opportunities for investment education
- **Long-term Planning:** Investment progression supports college and future financial planning discussions

This Invest category data model provides a comprehensive foundation for investment education, progressing from safe simulation through real-world investment experience while maintaining detailed tracking of learning progression and financial growth.
