# Spend Category Data Model

## Overview

The Spend category data model is intentionally minimal, focusing on contribution tracking and reflection rather than detailed purchase monitoring. This design philosophy respects children's privacy while providing aggregate data for educational reflection on spending patterns and decision-making over time.

## Data Philosophy

### Privacy-First Design
The Spend category deliberately avoids detailed transaction tracking:

- **No Purchase Recording:** Individual purchases are never tracked or stored
- **No Location Data:** Where money was spent is not recorded
- **No Item Tracking:** What was purchased remains private
- **No Time Stamps:** When purchases occurred is not monitored
- **No Judgment Data:** No "good" vs "bad" purchase classifications

### Aggregate Learning Focus
Educational value comes from high-level pattern recognition:

- **Contribution History:** Track money allocated to Spend category over time
- **Time-Based Views:** Monthly, quarterly, and annual spending contribution summaries
- **Reflection Triggers:** Large cumulative totals encourage spending mindfulness
- **Opportunity Cost Awareness:** Help children see alternative uses for spent money

## Entity Relationships

```
Recipients (1) ──── (1) Spend Category Balance
     │                     │
     │                     └── (Many) Spend Distribution Transactions
     │
     └── (No Purchase Tracking)
```

## Core Data Elements

### Spend Balance Structure
The Spend category balance represents lifetime contributions, not remaining cash.

**Balance Characteristics:**
- **Always Increasing:** Balance only grows, never decreases
- **Contribution Total:** Represents total allowance money allocated to Spend category
- **No Deductions:** Individual purchases don't reduce the balance
- **Reflection Tool:** Large totals over time encourage spending reflection

**Balance Calculation:**
```typescript
interface SpendBalance {
  lifetimeContributions: number;    // Total money ever allocated to Spend
  currentPeriodContributions: number; // Contributions within specific time period
  averageWeeklyContribution: number;  // Rolling average for pattern recognition
}
```

### Time-Period Analysis
Spend data is organized by time periods for educational reflection.

**Time Period Views:**
- **Current Month:** Contributions in current calendar month
- **Previous Months:** Historical monthly contribution amounts
- **Quarterly View:** Three-month contribution summaries
- **Annual View:** Year-to-date and previous year totals
- **All-Time:** Complete lifetime spending contribution history

**Period Calculation Queries:**
```sql
-- Current month contributions
SELECT SUM(amount) as current_month_total
FROM transactions 
WHERE recipient_id = $1 
  AND category_type = 'spend' 
  AND transaction_type = 'distribution'
  AND EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE);

-- Annual contributions by year
SELECT 
  EXTRACT(YEAR FROM transaction_date) as year,
  SUM(amount) as annual_total
FROM transactions 
WHERE recipient_id = $1 
  AND category_type = 'spend' 
  AND transaction_type = 'distribution'
GROUP BY EXTRACT(YEAR FROM transaction_date)
ORDER BY year DESC;
```

## Transaction Model

### Spend Transaction Types
Spend category uses limited transaction types focused on contributions:

**Allowed Transaction Types:**
- **distribution:** Allowance distribution to Spend category
- **adjustment:** Manual balance corrections (rare, manager-only)

**Explicitly NOT Tracked:**
- **withdrawal:** Individual purchases are not recorded
- **purchase:** Specific item purchases are not stored  
- **location:** Where money was spent is not tracked
- **merchant:** Who received the money is not recorded

### Transaction Schema Usage
```sql
-- Spend transactions use standard transaction table with restrictions
SELECT * FROM transactions 
WHERE category_type = 'spend' 
  AND transaction_type IN ('distribution', 'adjustment')
ORDER BY transaction_date DESC;

-- Balance calculation from contributions only
SELECT 
  recipient_id,
  SUM(amount) as lifetime_contributions,
  COUNT(*) as distribution_count
FROM transactions 
WHERE category_type = 'spend' 
  AND transaction_type = 'distribution'
GROUP BY recipient_id;
```

## Reflection Data Structures

### Spending Pattern Analysis
High-level insights for educational discussions without invasion of privacy.

**Pattern Metrics:**
- **Contribution Frequency:** How often money is allocated to Spend
- **Contribution Amounts:** Typical amounts allocated per distribution
- **Seasonal Patterns:** Higher spending contributions during holidays, summer, etc.
- **Trend Analysis:** Whether spending allocations are increasing or decreasing over time

### Educational Reflection Queries
```sql
-- Monthly contribution trends (last 12 months)
SELECT 
  DATE_TRUNC('month', transaction_date) as month,
  SUM(amount) as monthly_contributions,
  COUNT(*) as distribution_count
FROM transactions 
WHERE recipient_id = $1 
  AND category_type = 'spend' 
  AND transaction_type = 'distribution'
  AND transaction_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;

-- Average weekly spending allocation
SELECT 
  AVG(weekly_total) as avg_weekly_spend
FROM (
  SELECT 
    DATE_TRUNC('week', transaction_date) as week,
    SUM(amount) as weekly_total
  FROM transactions 
  WHERE recipient_id = $1 
    AND category_type = 'spend' 
    AND transaction_type = 'distribution'
    AND transaction_date >= CURRENT_DATE - INTERVAL '6 months'
  GROUP BY DATE_TRUNC('week', transaction_date)
) weekly_totals;
```

## Educational Insights Without Surveillance

### Reflection Prompts
Data-driven questions that encourage spending mindfulness:

**Contribution Reflection:**
- "You've received $X in spending money this year - are you happy with how you used it?"
- "Last month you allocated $Y to spending - would you change that amount?"
- "Your spending contributions have increased/decreased this quarter - is that intentional?"

**Opportunity Cost Awareness:**
- "The $Z you've allocated to spending could have bought [Save category item]"
- "Your yearly spending contributions could have supported [Give category cause]"
- "If you reduced spending allocations by 10%, you could increase [other category] by $A"

### Family Discussion Support
Aggregate data supports meaningful conversations:

**Trend Discussions:**
- Seasonal spending patterns and their causes
- Changes in spending allocation preferences over time
- Relationship between age/maturity and spending allocation choices

**Goal Planning:**
- How current spending allocations align with other financial goals
- Whether spending allocation amounts support learning objectives
- Adjustment strategies for better balance across all categories

## Database Implementation

### Spend-Specific Constraints
```sql
-- Ensure Spend transactions are contribution-only
CREATE OR REPLACE FUNCTION validate_spend_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow distribution and adjustment types for Spend category
  IF NEW.category_type = 'spend' AND 
     NEW.transaction_type NOT IN ('distribution', 'adjustment') THEN
    RAISE EXCEPTION 'Spend category only allows distribution and adjustment transactions';
  END IF;
  
  -- Ensure all Spend transactions are positive (contributions)
  IF NEW.category_type = 'spend' AND NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Spend category transactions must be positive contributions';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_spend_transaction_trigger
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION validate_spend_transaction();
```

### Balance Calculation Views
```sql
-- Create view for easy Spend balance calculation
CREATE VIEW spend_balances AS
SELECT 
  r.id as recipient_id,
  r.name as recipient_name,
  COALESCE(SUM(t.amount), 0) as lifetime_contributions,
  COUNT(t.id) as contribution_count,
  MIN(t.transaction_date) as first_contribution,
  MAX(t.transaction_date) as latest_contribution
FROM recipients r
LEFT JOIN transactions t ON r.id = t.recipient_id 
  AND t.category_type = 'spend' 
  AND t.transaction_type = 'distribution'
GROUP BY r.id, r.name;
```

## Performance Considerations

### Query Optimization
```sql
-- Indexes for common Spend category queries
CREATE INDEX idx_transactions_spend_category ON transactions(recipient_id, category_type) 
  WHERE category_type = 'spend';

CREATE INDEX idx_transactions_spend_date ON transactions(recipient_id, transaction_date) 
  WHERE category_type = 'spend';

-- Partial index for spend distributions only
CREATE INDEX idx_transactions_spend_distributions ON transactions(recipient_id, transaction_date)
  WHERE category_type = 'spend' AND transaction_type = 'distribution';
```

### Efficient Time-Period Queries
```sql
-- Materialized view for monthly spend summaries (optional optimization)
CREATE MATERIALIZED VIEW monthly_spend_summaries AS
SELECT 
  recipient_id,
  DATE_TRUNC('month', transaction_date) as month,
  SUM(amount) as monthly_total,
  COUNT(*) as contribution_count
FROM transactions 
WHERE category_type = 'spend' AND transaction_type = 'distribution'
GROUP BY recipient_id, DATE_TRUNC('month', transaction_date);

-- Refresh monthly (can be automated)
REFRESH MATERIALIZED VIEW monthly_spend_summaries;
```

## Educational Data Analysis

### Learning Pattern Recognition
Analysis of spending allocation patterns without privacy violation:

**Positive Indicators:**
- Consistent, reasonable spending allocations over time
- Spending allocations that leave room for other categories
- Seasonal adjustments that reflect learning and maturity

**Learning Opportunities:**
- Very high spending allocations suggesting need for balance discussion
- Inconsistent patterns that might indicate need for planning support
- Opportunity cost discussions when spending reduces other category funding

### Age-Appropriate Insights
```sql
-- Age-based spending patterns (using recipient creation date as age proxy)
SELECT 
  CASE 
    WHEN EXTRACT(DAYS FROM NOW() - r.created_at) / 365 < 2 THEN 'New (0-2 years)'
    WHEN EXTRACT(DAYS FROM NOW() - r.created_at) / 365 < 5 THEN 'Developing (2-5 years)'
    ELSE 'Experienced (5+ years)'
  END as experience_level,
  AVG(sb.lifetime_contributions) as avg_lifetime_spend,
  AVG(sb.contribution_count) as avg_contribution_count
FROM recipients r
JOIN spend_balances sb ON r.id = sb.recipient_id
WHERE r.manager_id = auth.uid()
GROUP BY experience_level;
```

## Integration Points

### Distribution System
- **Contribution Source:** Spend allocations come from distribution system
- **Balance Updates:** Distribution system increases Spend category balance
- **Historical Record:** All Spend contributions tracked through distribution records

### Family Education
- **Discussion Triggers:** Large cumulative amounts prompt spending mindfulness conversations
- **Goal Planning:** Spending patterns inform allowance allocation discussions
- **Opportunity Cost Learning:** Spend data supports trade-off discussions with other categories

### Trophy System
- **Wise Spender Trophy:** Recognition for thoughtful spending category engagement
- **Balance Achievement:** Spend category participates in balanced financial achievement recognition

This Spend category data model successfully balances educational value with privacy protection, providing meaningful insights for financial learning while respecting children's autonomy and privacy in their purchase decisions.