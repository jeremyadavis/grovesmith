# Grovesmith Distribution System

## Overview
The distribution system is the core functionality that allows managers to allocate allowance funds to recipients across the four educational categories (Give, Spend, Save, Invest). It implements a pooled approach where undistributed funds accumulate until manually distributed by the manager.

## Architecture

### Database Schema
```sql
-- Distributions table: Records each allowance distribution
distributions (
  id UUID PRIMARY KEY,
  recipient_id UUID REFERENCES recipients(id),
  manager_id UUID REFERENCES managers(id),
  distribution_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  give_amount DECIMAL(10,2) DEFAULT 0.00,
  spend_amount DECIMAL(10,2) DEFAULT 0.00,
  save_amount DECIMAL(10,2) DEFAULT 0.00,
  invest_amount DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Transactions table: Detailed audit trail
transactions (
  id UUID PRIMARY KEY,
  recipient_id UUID REFERENCES recipients(id),
  distribution_id UUID REFERENCES distributions(id),
  category_type TEXT CHECK (category_type IN ('give', 'spend', 'save', 'invest')),
  transaction_type TEXT CHECK (transaction_type IN ('distribution', 'withdrawal', 'dividend', 'bonus')),
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP
)
```

### Automatic Triggers
1. **Balance Updates**: When a distribution is created, category balances are automatically updated
2. **Transaction Creation**: Individual transaction records are created for each non-zero category
3. **Timestamp Management**: Automatic `updated_at` field maintenance

## User Interface

### Distribution Modal Components
- **Undistributed Amount Display**: Shows pooled funds with editable testing interface
- **Category Allocation Controls**: Interactive +/- buttons and direct input for each category
- **Date Picker**: Calendar interface for backdating distributions
- **Real-time Validation**: Live feedback on remaining funds and allocation limits
- **Quick Actions**: "Split Equally" and "Reset" buttons for common operations

### Distribution Flow
```
1. Manager clicks "Distribute Funds" button
2. Modal opens showing current undistributed amount
3. Manager allocates funds across categories using controls
4. Manager selects distribution date (defaults to today)
5. Manager clicks "Distribute $X.XX" to submit
6. Server action creates distribution record
7. Database triggers update balances and create transactions
8. UI updates to reflect new balances
```

## Server Actions

### `distributeAllowance(data: DistributionData)`
Creates a new distribution record and triggers automatic balance updates.

**Parameters:**
- `recipientId`: Target recipient UUID
- `distributionDate`: Date for the distribution (supports backdating)
- `giveAmount`, `spendAmount`, `saveAmount`, `investAmount`: Category allocations
- `notes`: Optional description

**Validation:**
- Verifies recipient belongs to authenticated manager
- Ensures total amount is positive
- Prevents negative individual category amounts
- Uses database transactions for consistency

### `calculateUndistributedAllowance(recipientId: string)`
Calculates how much allowance is owed to a recipient based on their creation date and distribution history.

**Returns:**
```typescript
{
  undistributedAmount: number,    // Amount ready to distribute
  totalDistributed: number,       // Historical total distributed
  totalAllowanceOwed: number,     // Total allowance earned since creation
  weeksSinceCreated: number,      // Weeks since recipient was added
  weeklyAllowance: number         // Recipient's weekly allowance amount
}
```

### `getRecipientDistributions(recipientId: string)`
Fetches distribution history for reporting and analysis.

### `getRecipientTransactions(recipientId: string, limit?: number)`
Retrieves detailed transaction history with distribution context.

## Security & Performance

### Row-Level Security (RLS)
- Managers can only access distributions for their own recipients
- All queries are automatically filtered by `manager_id = auth.uid()`
- Transactions are accessible only for manager's recipients

### Database Optimization
- Indexes on frequently queried columns (`recipient_id`, `manager_id`, dates)
- Efficient JOIN queries for transaction history
- Automatic cleanup of related records on deletion

### Error Handling
- Comprehensive validation at both client and server levels
- Transaction rollback on errors to maintain data consistency
- User-friendly error messages with specific failure reasons

## Testing Features

### Development Mode Enhancements
- **Always Accessible Modal**: Distribution button always enabled for testing
- **Editable Undistributed Amount**: Direct manipulation of pool amount
- **Multi-Distribution Testing**: Modal stays open for rapid testing
- **Amount Validation**: Prevents over-allocation while allowing flexible testing

### Testing Workflow
```
1. Open distribution modal (always available)
2. Adjust undistributed amount using +/- buttons or direct input
3. Allocate funds and select date
4. Distribute to create real database records
5. Repeat for multiple distributions testing
6. Close modal to reset for next test session
```

## Future Enhancements

### Planned Features
- **Auto-Distribution**: Saved percentage preferences per recipient
- **Scheduled Distributions**: Automatic weekly/biweekly distributions
- **Bulk Operations**: Distribute to multiple recipients simultaneously
- **Distribution Templates**: Save and reuse common allocation patterns
- **Advanced Reporting**: Analytics on distribution patterns and trends

### Integration Points
- **Category Features**: Integration with Give goals, Save wishlists, Investment thresholds
- **Notification System**: Alerts for missed distributions or milestone achievements
- **Mobile Optimization**: Touch-friendly controls and offline capability
- **Export Functionality**: CSV/PDF reports for tax and record-keeping purposes

## Implementation Notes

### Performance Considerations
- Distribution calculations are performed server-side to ensure accuracy
- Real-time balance updates use optimistic UI patterns
- Database functions minimize round trips for complex operations
- Efficient caching of frequently accessed recipient data

### Scalability
- Supports unlimited recipients per manager
- Historical data retention with efficient querying
- Partitioned tables planned for high-volume deployments
- API rate limiting for production environments

### Maintenance
- Database migrations handle schema changes
- Automated testing covers distribution logic
- Error monitoring and alerting for production issues
- Regular backup and recovery procedures for financial data