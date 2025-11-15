# Grovesmith Development Plan

## Created: October 12, 2025

---

## 📋 Executive Summary

**Current Status**: Phase 5 - Give Category Complete ✅

**What's Working**:

- ✅ Authentication & Authorization (Supabase server-side)
- ✅ Manager Dashboard with recipient management
- ✅ Distribution system with pooled undistributed funds
- ✅ Give Category (charitable causes with fund allocation)
- ✅ Trophy system (7 trophies with real-time recognition)
- ✅ Transaction history and audit trail
- ✅ Themed recipient profiles with gradients

**What's Next**: Complete the remaining three financial categories (Save, Spend, Invest)

---

## 🎯 Immediate Priorities (Next 2-3 Weeks)

### Priority 1: Save Category Implementation

**Timeline**: 5-7 days
**Impact**: High - Core educational category

**Requirements**:

1. Database schema for Save category
   - `save_subcategories` table
   - `wishlist_items` table
   - Add subcategory_id and wishlist_item_id to transactions table

2. Backend server actions
   - `save-actions.ts` with CRUD operations for subcategories
   - `wishlist-actions.ts` for wishlist item management
   - Fund allocation logic (category → subcategory → item)

3. UI Components
   - Save category tab with subcategory cards
   - Wishlist item management modal
   - Progress bars and status indicators
   - Fund allocation interface
   - Item completion workflow

4. Business Logic
   - 3-item limit per subcategory enforcement
   - Balance validation (unallocated → subcategory → item)
   - Item lifecycle (active → completed/removed)
   - Transaction creation for allocations and purchases

**Deliverables**:

- [ ] Database migration SQL (save_subcategories + wishlist_items)
- [ ] Server actions for Save category operations
- [ ] Save category tab component
- [ ] Wishlist management UI
- [ ] Integration with trophy system (First Saver, Big Saver)

---

### Priority 2: Spend Category Implementation

**Timeline**: 2-3 days
**Impact**: Medium - Simpler than other categories

**Requirements**:

1. Backend logic
   - Time-period aggregation queries (monthly, annual, all-time)
   - Reflection calculation functions
   - Spend-specific transaction validation

2. UI Components
   - Spend category tab with contribution summary
   - Time period toggles (month/year/all-time)
   - Historical contribution visualization
   - Reflection prompts and insights

3. Business Logic
   - Balance = lifetime contributions (always increasing)
   - No withdrawal transactions (privacy-focused)
   - Transaction validation (distribution only)

**Deliverables**:

- [ ] spend-actions.ts with aggregation queries
- [ ] Spend category tab component
- [ ] Time period visualization
- [ ] Integration with trophy system (Wise Spender)

---

### Priority 3: Invest Category Implementation

**Timeline**: 7-10 days
**Impact**: High - Complex automated system

**Requirements**:

1. Database schema for Invest category
   - `investment_settings` table (per recipient)
   - `dividend_payments` table (historical record)
   - `investment_milestones` table (threshold tracking)

2. Backend server actions
   - `investment-actions.ts` for settings management
   - Dividend calculation function
   - Milestone detection and notification
   - Investment reset logic (on threshold)

3. Automated dividend system
   - Scheduled job/cron for dividend payments (1st & 15th)
   - Balance update with dividend transactions
   - Compound growth calculation

4. UI Components
   - Invest category tab with balance and growth charts
   - Investment settings configuration modal
   - Dividend payment history
   - Milestone progress indicators
   - Threshold achievement celebration

5. Business Logic
   - Configurable dividend rate (default 5%)
   - Configurable payout schedule (default 1st & 15th)
   - Threshold detection ($50 default)
   - Investment reset and milestone recording

**Deliverables**:

- [ ] Database migration SQL (investment tables)
- [ ] Server actions for Invest operations
- [ ] Dividend calculation and automation system
- [ ] Invest category tab component
- [ ] Investment settings UI
- [ ] Integration with trophy system (Smart Investor)

---

## 🔄 Implementation Strategy

### Week 1: Save Category Foundation

**Days 1-2**: Database & Server Actions

- Create database migration for Save tables
- Run migration in Supabase
- Implement server actions for subcategories
- Implement server actions for wishlist items
- Add transaction extensions (subcategory_id, wishlist_item_id)

**Days 3-4**: Core UI Components

- Build Save category tab skeleton
- Create subcategory card components
- Build wishlist item management modal
- Implement fund allocation interface

**Days 5-6**: Business Logic & Integration

- Implement 3-item limit enforcement
- Add balance validation logic
- Create item completion workflow
- Integrate with transaction system
- Wire up trophy achievements (First Saver, Big Saver)

**Day 7**: Testing & Polish

- Manual testing of all Save workflows
- Fix bugs and edge cases
- Polish UI/UX details
- Update documentation

---

### Week 2: Spend & Invest Categories

**Days 1-2**: Spend Category

- Implement spend-actions.ts with aggregation queries
- Build Spend category tab
- Create time period toggle UI
- Add reflection prompts
- Integrate Wise Spender trophy

**Days 3-7**: Invest Category - Phase 1 (Manual)

- Create database migration for Invest tables
- Implement investment-actions.ts
- Build Invest category tab
- Create investment settings modal
- Manual dividend calculation (button-triggered for testing)
- Add milestone detection
- Integrate Smart Investor trophy

---

### Week 3: Investment Automation & Polish

**Days 1-3**: Investment Automation

- Research Next.js/Vercel cron job options
- Implement scheduled dividend payments
- Test automated dividend system
- Handle edge cases and error scenarios

**Days 4-5**: Integration Testing

- Test complete distribution → category workflows
- Verify all trophy triggers work correctly
- Test transaction history across all categories
- Validate balance calculations

**Days 6-7**: UI/UX Polish

- Mobile responsiveness review
- Loading states and error handling
- Animation and transition polish
- Accessibility review

---

## 🏗️ Technical Architecture Notes

### Database Migrations

**Location**: Create new SQL files in root directory

- `supabase-save-schema.sql` - Save category tables
- `supabase-invest-schema.sql` - Invest category tables

**Migration Process**:

1. Create SQL file with schema changes
2. Test locally in Supabase SQL Editor
3. Apply to production after testing
4. Update main schema documentation

### Server Actions Pattern

**Convention**: Keep consistent with existing patterns

```typescript
// Pattern from charitable-causes-actions.ts
export async function addWishlistItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Validate inputs
  // Check business rules (3-item limit, etc.)
  // Insert into database
  // Revalidate paths
  // Return result
}
```

### Component Organization

**Follow existing structure**:

- `src/components/recipients/tabs/` - Category tab components
- `src/components/recipients/` - Category-specific modals and cards
- `src/lib/` - Server actions and utility functions

### Transaction Types

**Use consistent transaction_type values**:

- `distribution` - Allowance distribution
- `allocation` - Internal category allocation
- `withdrawal` - Money leaving category (donations, purchases)
- `dividend` - Investment earnings

---

## 🎨 Design Considerations

### Save Category UX

- **Visual Hierarchy**: Subcategories → Wishlist items → Progress bars
- **3-Item Limit**: Subtle enforcement with helpful messaging
- **Progress Celebration**: Special animation when items reach 100%
- **Item Lifecycle**: Clear visual distinction between active/completed/removed

### Spend Category UX

- **Privacy-First**: Aggregate views only, no purchase tracking
- **Time Context**: Easy switching between time periods
- **Reflection Prompts**: Age-appropriate messaging about spending patterns
- **Minimal Interface**: Simple, uncluttered view emphasizing totals

### Invest Category UX

- **Growth Visualization**: Charts showing compound effect of dividends
- **Next Dividend Countdown**: Visual countdown to next payment
- **Milestone Progress**: Clear progress bar toward $50 threshold
- **Settings Accessibility**: Easy access to investment configuration
- **Celebration**: Special recognition when threshold reached

---

## 📊 Success Metrics

### Category Completion Metrics

For each category implementation, verify:

- [ ] All CRUD operations work correctly
- [ ] Transaction history records properly
- [ ] Balance calculations are accurate
- [ ] Trophy triggers activate correctly
- [ ] Mobile responsive design works
- [ ] Loading and error states handled
- [ ] Data validation prevents invalid states

### Integration Testing

- [ ] Distribution flows to all 4 categories correctly
- [ ] Cross-category balance calculations accurate
- [ ] Trophy system recognizes achievements across all categories
- [ ] Transaction history shows all category activities
- [ ] Navigation between categories works smoothly

---

## 🚀 Future Phases (Post-Categories)

### Phase 8: Data Visualization & Polish (Estimated 1-2 weeks)

- Category balance charts
- Historical progress graphs
- Comparative recipient views
- Enhanced mobile experience
- Performance optimization

### Phase 9: Production Readiness (Estimated 1 week)

- Comprehensive testing
- Error handling improvements
- Security audit
- Documentation completion
- Deployment configuration

---

## 🔧 Development Workflow

### Daily Development Process

1. **Morning**: Review plan, pick task, create branch
2. **Implementation**: Code with frequent commits
3. **Testing**: Manual testing in development
4. **Quality Gates**: Run `npm run lint` and `npm run format`
5. **Integration**: Merge to main, test full system
6. **Documentation**: Update relevant README files

### Quality Checklist (Before Completing Each Feature)

- [ ] TypeScript compiles without errors
- [ ] ESLint passes (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] Manual testing completed
- [ ] README documentation updated
- [ ] Database schema documented (if changed)

---

## 📝 Documentation Updates Required

As features are completed, update these files:

- `docs/plan.md` - Mark phases complete
- `README.md` - Update current status section
- `README.data-model-*.md` - Update if data models change
- `README.product-*.md` - Update if product features change
- Database schema documentation

---

## 🎯 Definition of Done

**Save Category Complete** when:

- ✅ Subcategories can be created and managed
- ✅ Wishlist items can be added (max 3 per subcategory)
- ✅ Funds can be allocated from category → subcategory → item
- ✅ Items can be marked as purchased/completed
- ✅ Items can be removed with reason tracking
- ✅ Progress bars show accurate completion percentages
- ✅ Transactions record all Save operations
- ✅ Trophies (First Saver, Big Saver) trigger correctly

**Spend Category Complete** when:

- ✅ Contribution totals display correctly
- ✅ Time period views (monthly, annual, all-time) work
- ✅ Reflection prompts appear appropriately
- ✅ Privacy-first design maintained (no purchase tracking)
- ✅ Wise Spender trophy triggers correctly
- ✅ Transaction history shows distributions only

**Invest Category Complete** when:

- ✅ Investment settings can be configured per recipient
- ✅ Dividend calculations work correctly
- ✅ Dividends can be paid manually (button-triggered initially)
- ✅ Automated dividend payments work (1st & 15th)
- ✅ Milestone detection triggers at threshold ($50 default)
- ✅ Investment reset process works
- ✅ Transaction history shows dividends and distributions
- ✅ Smart Investor trophy triggers correctly

---

## 💡 Key Insights from Documentation Review

### Architectural Strengths

- Server-side rendering approach is solid
- Row-Level Security provides excellent data isolation
- Database triggers automate complex balance calculations
- Server actions pattern is clean and consistent

### Design Philosophy

- Manager-controlled (not child-controlled)
- Real financial milestones over gamification
- Privacy-first (especially Spend category)
- Educational focus over point accumulation

### Technical Debt to Avoid

- Keep client components minimal
- Maintain server-first approach
- Don't add complex state management libraries
- Keep business logic in server actions

---

## 🤔 Open Questions & Decisions Needed

1. **Dividend Automation**:
   - Use Vercel Cron Jobs vs external service?
   - How to handle failures/retries?
   - Testing strategy for scheduled tasks?

2. **Real Investment Integration**:
   - Defer to Phase 10+ or prototype now?
   - Which APIs/services for real investment tracking?

3. **Data Visualization**:
   - Which charting library? (Chart.js, Recharts, D3)
   - Server-side rendering for charts?

4. **Testing Strategy**:
   - Unit tests for server actions?
   - E2E tests for critical flows?
   - Integration tests for database operations?

---

## 📞 Next Steps (Immediate)

1. **Start Save Category Implementation**
   - Create `supabase-save-schema.sql`
   - Test migration in Supabase SQL Editor
   - Begin `save-actions.ts` implementation

2. **Review Existing Code**
   - Study `charitable-causes-actions.ts` patterns
   - Review `give-category-tab.tsx` structure
   - Understand transaction creation flow

3. **Set Up Development Environment**
   - Ensure local environment is running
   - Test database connection
   - Verify all existing features still work

---

**Ready to begin Save Category implementation! 🚀**

_This plan will be updated as development progresses and new insights emerge._
