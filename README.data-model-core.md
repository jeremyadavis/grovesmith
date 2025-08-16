# Core Data Models - Users & Recipients

## Overview

The core data models establish the foundation for all Grovesmith functionality, defining the relationship between managers (parents) and recipients (children), along with the basic financial category structure that supports the educational allowance system.

## Entity Relationships

```
Managers (1) ──── (Many) Recipients
    │                    │
    │                    └── (4) Allowance Categories
    │                           │
    └── (Many) Distributions ────┘
```

## Core Entities

### Manager Entity

Represents parents, guardians, or sponsors who control financial operations.

**Key Attributes:**

- `id` - UUID, primary key, links to Supabase auth system
- `email` - Unique email address from authentication
- `full_name` - Display name for the manager
- `created_at` - Account creation timestamp
- `updated_at` - Profile modification timestamp

**Business Rules:**

- Each manager operates as an isolated tenant
- Complete data separation between different manager accounts
- Managers can only access their own recipients and related data
- Profile extends Supabase's built-in authentication system

**Data Security:**

- Row-Level Security (RLS) ensures managers can only see their own data
- Cascade delete removes all related data when manager account is deleted
- Email uniqueness enforced at authentication layer

### Recipient Entity

Represents children or learners participating in financial education.

**Key Attributes:**

- `id` - UUID, primary key for recipient identification
- `manager_id` - Foreign key linking to manager (owner)
- `name` - Display name for the recipient
- `allowance_amount` - Custom weekly allowance (not age-based)
- `avatar_url` - Optional profile image URL
- `is_active` - Active/inactive status for current use
- `is_archived` - Archived status for long-term data retention
- `created_at` - Recipient creation timestamp
- `updated_at` - Profile modification timestamp

**Business Rules:**

- Each recipient belongs to exactly one manager
- Custom allowance amounts per recipient (manager-controlled)
- Soft delete through `is_active` flag to preserve transaction history
- Archive capability through `is_archived` for graduated recipients

**Personalization Features:**

- **Theme Assignment:** Each recipient gets a unique visual theme based on deterministic algorithm
- **Avatar Support:** Custom profile images for personal connection
- **Individual Settings:** Per-recipient allowance amounts and preferences

### Allowance Categories Entity

The four core financial education categories for each recipient.

**Key Attributes:**

- `id` - UUID, primary key for category identification
- `recipient_id` - Foreign key linking to recipient
- `category_type` - Enum: 'give', 'spend', 'save', 'invest'
- `balance` - Current balance in this category
- `created_at` - Category creation timestamp
- `updated_at` - Last balance update timestamp

**Business Rules:**

- Exactly four categories per recipient (enforced by unique constraint)
- Categories automatically created when recipient is added
- Balances updated through distribution system and category-specific actions
- Balance meanings vary by category:
  - **Give:** Available funds for charitable allocation/donation
  - **Spend:** Total lifetime contributions (always increasing)
  - **Save:** Available funds for wishlist goals
  - **Invest:** Principal amount for dividend calculation

**Category-Specific Behaviors:**

- **Give Category:** Balance represents total unspent money; separate tracking of allocated vs unallocated funds
- **Spend Category:** Balance represents cumulative contributions for reflection, not remaining amount
- **Save Category:** Balance available for allocation to wishlist items and subcategories
- **Invest Category:** Balance used for dividend calculations and milestone tracking

## Data Relationships

### Manager → Recipient Relationship

- **Type:** One-to-Many
- **Constraint:** Recipients must belong to exactly one manager
- **Security:** Row-Level Security ensures complete data isolation
- **Lifecycle:** Cascade delete removes recipients when manager account is deleted

### Recipient → Categories Relationship

- **Type:** One-to-Four (exactly four categories)
- **Constraint:** Unique constraint prevents duplicate categories per recipient
- **Automation:** Database trigger automatically creates all four categories for new recipients
- **Lifecycle:** Categories are permanent; only balances change over time

## Data Integrity & Security

### Row-Level Security Policies

```sql
-- Managers can only access their own profile
CREATE POLICY "managers_own_data" ON managers
  FOR ALL USING (auth.uid() = id);

-- Managers can only access their own recipients
CREATE POLICY "recipients_own_data" ON recipients
  FOR ALL USING (manager_id = auth.uid());

-- Categories accessible through recipient ownership
CREATE POLICY "categories_through_recipients" ON allowance_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipients r
      WHERE r.id = allowance_categories.recipient_id
      AND r.manager_id = auth.uid()
    )
  );
```

### Database Triggers

```sql
-- Automatically create four categories when recipient is added
CREATE TRIGGER create_recipient_categories_trigger
  AFTER INSERT ON recipients
  FOR EACH ROW EXECUTE FUNCTION create_recipient_categories();
```

### Data Validation

- **Manager Email:** Must be unique and valid email format
- **Recipient Name:** Required, non-empty string
- **Allowance Amount:** Positive decimal with reasonable limits
- **Category Type:** Must be one of the four allowed values
- **Balance:** Non-negative decimal values

## Performance Considerations

### Database Indexing

```sql
-- Core relationship indexes
CREATE INDEX idx_recipients_manager_id ON recipients(manager_id);
CREATE INDEX idx_allowance_categories_recipient_id ON allowance_categories(recipient_id);
CREATE INDEX idx_allowance_categories_type ON allowance_categories(category_type);

-- Query optimization indexes
CREATE INDEX idx_recipients_active ON recipients(is_active) WHERE is_active = true;
CREATE INDEX idx_recipients_archived ON recipients(is_archived) WHERE is_archived = false;
```

### Query Patterns

- **Manager Dashboard:** Efficient retrieval of all recipients with category summaries
- **Recipient Profiles:** Fast loading of individual recipient data with all categories
- **Balance Calculations:** Optimized queries for real-time financial calculations
- **Historical Analysis:** Efficient access to recipient lifecycle and financial progression

## Integration Points

### Authentication System

- **Supabase Integration:** Direct foreign key relationship to auth.users table
- **Session Management:** Row-Level Security automatically filters data based on authenticated user
- **OAuth Support:** Works with Google, GitHub, and other OAuth providers through Supabase

### Theme System

- **Deterministic Assignment:** Each recipient gets consistent theme based on ID hash
- **Visual Consistency:** Same theme appears across all app views and sessions
- **Family Distinction:** Multiple recipients have clearly different visual identities

### Category Extensions

- **Give Categories:** Foundation for charitable causes and fund allocation
- **Save Categories:** Base for subcategories and wishlist management
- **Invest Categories:** Framework for dividend calculations and milestone tracking
- **Spend Categories:** Support for reflection and spending pattern analysis

## Future Extensions

### Enhanced Personalization

- **Custom Themes:** Unlock additional themes through achievements
- **Avatar Systems:** Expanded profile customization options
- **Preference Storage:** Per-recipient settings and learning preferences

### Advanced Analytics

- **Progress Tracking:** Long-term financial education progression metrics
- **Family Insights:** Aggregate analytics across multiple recipients
- **Educational Outcomes:** Correlation between system usage and financial literacy development

### Scalability Features

- **Multi-Family Support:** Enhanced tenant isolation for larger deployments
- **Bulk Operations:** Efficient operations across multiple recipients
- **Data Export:** Complete data portability for families

This core data model provides a secure, scalable foundation for all Grovesmith financial education features while maintaining clear separation between families and comprehensive tracking of each recipient's financial learning journey.
