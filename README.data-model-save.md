# Save Category Data Model

## Overview

The Save category data model supports structured saving toward specific goals through a comprehensive wishlist management system with subcategories, progress tracking, and item lifecycle management. This design teaches children delayed gratification, goal setting, and resource allocation while maintaining complete visibility into their saving journey.

## Entity Relationships

```
Recipients (1) ──── (Many) Save Subcategories
     │                       │
     │                       └── (3 max each) Wishlist Items
     │                              │
     └── Save Category ←────────────┘
```

## Core Entities

### Save Subcategory Entity
Organizational containers within the Save category for different types of goals.

**Key Attributes:**
- `id` - UUID, primary key for subcategory identification
- `recipient_id` - Foreign key linking to recipient who owns this subcategory
- `name` - Display name for the subcategory (e.g., "Clothes", "Books", "Toys")
- `balance` - Current amount of money allocated to this subcategory
- `is_active` - Boolean for soft deletion of unused subcategories
- `created_at` - When subcategory was created
- `updated_at` - Last balance or setting modification

**Business Rules:**
- Subcategories are created as needed for wishlist item organization
- Common predefined categories: Clothes, Books, Toys, Games, Electronics, Sports, Art, Other
- Custom subcategories can be created by managers
- Balances track money specifically allocated to this subcategory's goals
- Inactive subcategories retain historical data but don't appear in active UI

**Subcategory Balance Management:**
- Balance represents money allocated to wishlist items within this subcategory
- Money can be moved between subcategories as priorities change
- Total subcategory balances should not exceed Save category balance
- Unallocated Save money remains at category level until assigned to subcategories

### Wishlist Item Entity
Specific items or goals that recipients are saving toward.

**Key Attributes:**
- `id` - UUID, primary key for wishlist item identification  
- `recipient_id` - Foreign key linking to recipient who owns this item
- `subcategory_id` - Foreign key linking to organizing subcategory
- `name` - Display name for the item (e.g., "Nintendo Switch", "New Bike")
- `description` - Optional detailed description of the item or why it's wanted
- `target_amount` - Goal price for this item
- `current_amount` - Amount currently saved/allocated toward this item
- `url` - Optional link to product page or reference
- `priority_order` - Integer for ordering items within subcategory by importance
- `status` - Enum: 'active', 'completed', 'removed'
- `completed_at` - Timestamp when item was successfully purchased
- `removed_reason` - Optional explanation for why item was removed from wishlist
- `created_at` - When item was added to wishlist
- `updated_at` - Last modification timestamp

**Business Rules:**
- Maximum 3 active wishlist items per subcategory (encourages focus)
- Items must be added to wishlist before money can be allocated to them
- `current_amount` cannot exceed `target_amount`
- Items can be completed before reaching full target amount (partial saving)
- Removed items retain historical data for learning analysis
- Priority ordering helps children focus on most important goals

**Item Status Lifecycle:**
- **Active:** Currently being saved toward, appears in main UI
- **Completed:** Successfully purchased or goal achieved
- **Removed:** Taken off wishlist, either lost interest or changed priorities

### Save Transaction Types
Save category uses multiple transaction types to track complex saving behaviors.

**Transaction Types:**
- **distribution:** Allowance distribution to Save category
- **allocation:** Moving Save category funds to specific subcategory or wishlist item
- **reallocation:** Moving funds between subcategories or wishlist items
- **withdrawal:** Money removed for purchase (completing wishlist item)
- **adjustment:** Manual corrections by manager

**Transaction Context:**
- `subcategory_id` - Links transaction to specific subcategory when applicable
- `wishlist_item_id` - Links transaction to specific wishlist item when applicable
- `description` - Human-readable explanation of saving action

## Database Schema Implementation

### Save Subcategories Table
```sql
CREATE TABLE save_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique subcategory names per recipient
  UNIQUE(recipient_id, name)
);
```

### Wishlist Items Table
```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  subcategory_id UUID NOT NULL REFERENCES save_subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (current_amount >= 0),
  url TEXT,
  priority_order INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'removed')),
  completed_at TIMESTAMPTZ,
  removed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure current amount doesn't exceed target
  CONSTRAINT current_within_target CHECK (current_amount <= target_amount),
  
  -- Completion status consistency
  CONSTRAINT completion_consistency CHECK (
    (status = 'active' AND completed_at IS NULL) OR
    (status = 'completed' AND completed_at IS NOT NULL) OR
    (status = 'removed')
  )
);
```

### Extended Transactions Table
```sql
-- Add Save-specific foreign keys to transactions table
ALTER TABLE transactions ADD COLUMN subcategory_id UUID REFERENCES save_subcategories(id);
ALTER TABLE transactions ADD COLUMN wishlist_item_id UUID REFERENCES wishlist_items(id);

-- Indexes for Save category queries
CREATE INDEX idx_transactions_subcategory ON transactions(subcategory_id);
CREATE INDEX idx_transactions_wishlist_item ON transactions(wishlist_item_id);
```

## Core Data Operations

### Fund Allocation Process
Moving money from Save category balance to specific subcategories and wishlist items.

**Allocation Hierarchy:**
1. **Category Level:** Money from distributions sits at Save category level initially
2. **Subcategory Level:** Funds allocated to specific subcategories for organization
3. **Item Level:** Subcategory funds allocated to specific wishlist items for goal achievement

**Allocation Validation:**
- Cannot allocate more than available unallocated Save balance
- Cannot allocate more than wishlist item needs (`target_amount - current_amount`)
- Cannot allocate to inactive subcategories or non-active wishlist items
- All allocations must be positive amounts

### Wishlist Item Completion Process
```sql
CREATE OR REPLACE FUNCTION complete_wishlist_item(
  p_item_id UUID,
  p_recipient_id UUID,
  p_purchase_amount DECIMAL(10,2),
  p_item_name TEXT
) RETURNS VOID AS $$
DECLARE
  v_save_balance DECIMAL(10,2);
  v_item_record wishlist_items%ROWTYPE;
BEGIN
  -- Get item details
  SELECT * INTO v_item_record
  FROM wishlist_items 
  WHERE id = p_item_id AND recipient_id = p_recipient_id;
  
  -- Validate item exists and is active
  IF NOT FOUND OR v_item_record.status != 'active' THEN
    RAISE EXCEPTION 'Wishlist item not found or not active';
  END IF;
  
  -- Get Save category balance
  SELECT balance INTO v_save_balance
  FROM allowance_categories 
  WHERE recipient_id = p_recipient_id AND category_type = 'save';
  
  -- Validate sufficient funds
  IF v_save_balance < p_purchase_amount THEN
    RAISE EXCEPTION 'Insufficient funds in Save category';
  END IF;
  
  -- Update Save category balance
  UPDATE allowance_categories 
  SET balance = balance - p_purchase_amount,
      updated_at = NOW()
  WHERE recipient_id = p_recipient_id AND category_type = 'save';
  
  -- Update subcategory balance
  UPDATE save_subcategories
  SET balance = balance - p_purchase_amount,
      updated_at = NOW()
  WHERE id = v_item_record.subcategory_id;
  
  -- Mark item as completed
  UPDATE wishlist_items
  SET status = 'completed',
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_item_id;
  
  -- Create withdrawal transaction
  INSERT INTO transactions (
    recipient_id, category_type, transaction_type, amount,
    balance_after, subcategory_id, wishlist_item_id,
    description, transaction_date
  ) VALUES (
    p_recipient_id, 'save', 'withdrawal', p_purchase_amount,
    v_save_balance - p_purchase_amount, v_item_record.subcategory_id, p_item_id,
    'Purchased ' || p_item_name || ' for $' || p_purchase_amount,
    CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;
```

## Query Patterns & Performance

### Balance Calculation Queries
```sql
-- Save category balance breakdown
WITH category_balance AS (
  SELECT balance as total_save_balance
  FROM allowance_categories 
  WHERE recipient_id = $1 AND category_type = 'save'
),
subcategory_totals AS (
  SELECT COALESCE(SUM(balance), 0) as total_subcategory_balance
  FROM save_subcategories 
  WHERE recipient_id = $1 AND is_active = true
)
SELECT 
  cb.total_save_balance,
  st.total_subcategory_balance,
  cb.total_save_balance - st.total_subcategory_balance as unallocated_balance
FROM category_balance cb, subcategory_totals st;

-- Wishlist progress summary
SELECT 
  sc.name as subcategory_name,
  wi.name as item_name,
  wi.target_amount,
  wi.current_amount,
  (wi.current_amount / wi.target_amount * 100) as progress_percentage,
  wi.target_amount - wi.current_amount as remaining_amount
FROM wishlist_items wi
JOIN save_subcategories sc ON wi.subcategory_id = sc.id
WHERE wi.recipient_id = $1 AND wi.status = 'active'
ORDER BY sc.name, wi.priority_order;
```

### Wishlist Management Queries
```sql
-- Active item count per subcategory
SELECT 
  sc.id,
  sc.name,
  COUNT(wi.id) as active_item_count
FROM save_subcategories sc
LEFT JOIN wishlist_items wi ON sc.id = wi.subcategory_id AND wi.status = 'active'
WHERE sc.recipient_id = $1 AND sc.is_active = true
GROUP BY sc.id, sc.name
ORDER BY sc.name;

-- Item priority management
SELECT * FROM wishlist_items
WHERE subcategory_id = $1 AND status = 'active'
ORDER BY priority_order, created_at;

-- Historical analysis of removed vs completed items
SELECT 
  status,
  COUNT(*) as item_count,
  AVG(current_amount / target_amount) as avg_completion_rate
FROM wishlist_items
WHERE recipient_id = $1 AND status IN ('completed', 'removed')
GROUP BY status;
```

### Performance Indexes
```sql
-- Core relationship indexes
CREATE INDEX idx_save_subcategories_recipient_id ON save_subcategories(recipient_id);
CREATE INDEX idx_save_subcategories_active ON save_subcategories(is_active);
CREATE INDEX idx_wishlist_items_recipient_id ON wishlist_items(recipient_id);
CREATE INDEX idx_wishlist_items_subcategory_id ON wishlist_items(subcategory_id);
CREATE INDEX idx_wishlist_items_status ON wishlist_items(status);

-- Composite indexes for common queries
CREATE INDEX idx_wishlist_items_active ON wishlist_items(recipient_id, status, subcategory_id)
  WHERE status = 'active';
CREATE INDEX idx_wishlist_items_priority ON wishlist_items(subcategory_id, status, priority_order)
  WHERE status = 'active';
```

## Educational Data Insights

### Goal-Setting Behavior Analysis
```sql
-- Average time to complete wishlist items
SELECT 
  AVG(EXTRACT(DAYS FROM completed_at - created_at)) as avg_days_to_completion,
  COUNT(*) as completed_items
FROM wishlist_items
WHERE recipient_id = $1 AND status = 'completed';

-- Goal achievement rate by subcategory
SELECT 
  sc.name as subcategory,
  COUNT(CASE WHEN wi.status = 'completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN wi.status = 'removed' THEN 1 END) as removed_count,
  COUNT(*) as total_items,
  ROUND(COUNT(CASE WHEN wi.status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
FROM save_subcategories sc
LEFT JOIN wishlist_items wi ON sc.id = wi.subcategory_id
WHERE sc.recipient_id = $1
GROUP BY sc.id, sc.name
HAVING COUNT(*) > 0
ORDER BY completion_rate DESC;
```

### Learning Indicators
- **Planning Consistency:** How regularly children add items to wishlist before saving
- **Priority Management:** How often children reorder items and whether high-priority items get completed
- **Goal Completion:** Percentage of wishlist items that reach completion vs. removal
- **Amount Accuracy:** How well children estimate target amounts for desired items

### Reflection Opportunities
- **Removed Item Analysis:** Discussion of why certain items lost appeal over time
- **Completion Celebration:** Recognition of successful delayed gratification
- **Priority Evolution:** How children's priorities change as they mature
- **Trade-off Decisions:** Choosing between competing goals within limited resources

## Integration Points

### Distribution System
- **Fund Source:** Save distributions provide money for subcategory and item allocation
- **Balance Hierarchy:** Distribution system feeds top-level Save category balance
- **Allocation Flow:** Distributed funds flow down through subcategories to specific items

### Trophy System
- **Achievement Recognition:** First Saver and Big Saver trophies based on Save category activity
- **Goal Completion:** Wishlist item completions can trigger special recognition
- **Persistence Rewards:** Long-term saving behavior recognition

### Family Education
- **Goal Setting Practice:** Wishlist management teaches systematic goal setting
- **Priority Training:** Limited item slots force prioritization discussions
- **Patience Building:** Progress tracking visualization builds delayed gratification skills
- **Research Skills:** Item description and URL fields encourage purchase research

This Save category data model provides comprehensive support for goal-oriented saving education while maintaining detailed tracking of children's learning progression through structured goal achievement experiences.