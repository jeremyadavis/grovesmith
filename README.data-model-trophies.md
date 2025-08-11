# Trophy System Data Model

## Overview

The trophy system data model supports gamification and achievement recognition through automated trophy eligibility calculation, personalized profile theming, and achievement tracking. This system encourages positive financial behaviors while maintaining educational focus and avoiding artificial gamification that could undermine financial learning objectives.

## Data Philosophy

### Achievement-Based Recognition
The trophy system is built on real financial achievements rather than arbitrary task completion:

- **Balance-Based Awards:** All trophies tied to actual category balances and financial milestones
- **Automatic Recognition:** Trophy eligibility calculated in real-time from financial data
- **Progressive Difficulty:** Achievement criteria become more challenging as children advance
- **Educational Alignment:** Every trophy reinforces positive financial education behaviors

### No Persistent Trophy Storage
Trophy data is calculated dynamically rather than stored persistently:

- **Real-Time Calculation:** Trophy eligibility determined from current balances and transaction history
- **No Trophy Table:** Avoids artificial point systems or gamification mechanics
- **Always Accurate:** Trophy status automatically reflects current financial state
- **Simplified Architecture:** Reduces database complexity while maintaining full functionality

## Trophy Calculation Logic

### Trophy Eligibility Determination
```typescript
interface TrophyEligibilityCheck {
  recipientId: string;
  categoryBalances: {
    give: number;
    spend: number;
    save: number;
    invest: number;
  };
  transactionHistory?: Transaction[];
}

interface TrophyStatus {
  trophyId: string;
  isEarned: boolean;
  progress?: number;          // 0-100 percentage toward achievement
  nextMilestone?: number;     // Amount needed for next trophy level
}
```

### Core Trophy Definitions
```typescript
const TROPHY_DEFINITIONS = {
  // Beginner Achievements (Category Introduction)
  'first-saver': {
    name: 'First Saver',
    icon: '🏛️',
    color: 'purple',
    criteria: (balances) => balances.save >= 1.00,
    description: 'Save $1.00 or more',
    teachingGoal: 'Introduce the concept and satisfaction of saving money'
  },
  
  'generous-giver': {
    name: 'Generous Giver', 
    icon: '❤️',
    color: 'green',
    criteria: (balances, history) => getTotalDonations(history) >= 1.00,
    description: 'Complete $1.00 or more in charitable donations',
    teachingGoal: 'Encourage charitable giving and development of empathy'
  },
  
  'smart-investor': {
    name: 'Smart Investor',
    icon: '📈', 
    color: 'orange',
    criteria: (balances) => balances.invest >= 1.00,
    description: 'Allocate $1.00 or more to investment',
    teachingGoal: 'Introduce investment concepts and long-term thinking'
  },
  
  'wise-spender': {
    name: 'Wise Spender',
    icon: '💰',
    color: 'blue', 
    criteria: (balances) => balances.spend >= 1.00,
    description: 'Engage thoughtfully with spending money',
    teachingGoal: 'Acknowledge purposeful use of discretionary spending'
  },
  
  // Advanced Achievements (Sustained Behavior)
  'big-saver': {
    name: 'Big Saver',
    icon: '🏆',
    color: 'yellow',
    criteria: (balances) => balances.save >= 50.00,
    description: 'Accumulate $50.00 or more in savings',
    teachingGoal: 'Celebrate sustained saving habits and major milestones'
  },
  
  'champion-giver': {
    name: 'Champion Giver',
    icon: '🥇',
    color: 'green',
    criteria: (balances, history) => getTotalDonations(history) >= 25.00,
    description: 'Complete $25.00 or more in total donations',
    teachingGoal: 'Recognize sustained charitable behavior and meaningful impact'
  },
  
  // Balance Achievement (Holistic Financial Management)
  'goal-achiever': {
    name: 'Goal Achiever',
    icon: '🎯',
    color: 'indigo',
    criteria: (balances) => Object.values(balances).every(amount => amount >= 10.00),
    description: 'Reach $10.00 or more in ALL four categories',
    teachingGoal: 'Encourage balanced financial approach across all categories'
  }
} as const;
```

## Profile Personalization System

### Deterministic Theme Assignment
Each recipient receives a consistent visual theme calculated from their profile:

```typescript
interface RecipientTheme {
  id: string;
  name: string;
  gradientColors: {
    from: string;
    via?: string;
    to: string;
  };
  backgroundClass: string;
  textColors: {
    primary: string;
    secondary: string;
  };
}

const AVAILABLE_THEMES: RecipientTheme[] = [
  {
    id: 'sunset-dreams',
    name: 'Sunset Dreams',
    gradientColors: { from: 'pink-400', to: 'purple-600' },
    backgroundClass: 'bg-gradient-to-br from-pink-400 to-purple-600',
    textColors: { primary: 'white', secondary: 'pink-100' }
  },
  {
    id: 'ocean-breeze', 
    name: 'Ocean Breeze',
    gradientColors: { from: 'blue-400', to: 'cyan-500' },
    backgroundClass: 'bg-gradient-to-br from-blue-400 to-cyan-500',
    textColors: { primary: 'white', secondary: 'blue-100' }
  },
  // ... 8 more themes for visual variety
];

function getRecipientTheme(recipientId: string): RecipientTheme {
  // Deterministic hash of recipient ID
  let hash = 0;
  for (let i = 0; i < recipientId.length; i++) {
    const char = recipientId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const themeIndex = Math.abs(hash) % AVAILABLE_THEMES.length;
  return AVAILABLE_THEMES[themeIndex];
}
```

### Theme Consistency
- **Persistent Assignment:** Same theme appears across all sessions and views
- **Visual Ownership:** Children recognize "their" profile through consistent theming  
- **Family Distinction:** Multiple recipients have clearly different visual identities
- **No Storage Required:** Theme calculated on-demand from recipient ID

## Trophy Calculation Queries

### Real-Time Trophy Status
```sql
-- Function to get all trophy-relevant data for a recipient
CREATE OR REPLACE FUNCTION get_trophy_data(p_recipient_id UUID)
RETURNS JSON AS $$
DECLARE
  v_balances JSON;
  v_total_donations DECIMAL(10,2);
  v_result JSON;
BEGIN
  -- Get current category balances
  SELECT json_object_agg(category_type, balance) INTO v_balances
  FROM allowance_categories 
  WHERE recipient_id = p_recipient_id;
  
  -- Calculate total donations (Give category withdrawals)
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_total_donations
  FROM transactions
  WHERE recipient_id = p_recipient_id 
    AND category_type = 'give' 
    AND transaction_type = 'withdrawal';
  
  -- Combine all trophy-relevant data
  v_result := json_build_object(
    'recipientId', p_recipient_id,
    'balances', v_balances,
    'totalDonations', v_total_donations,
    'calculatedAt', NOW()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
```

### Trophy Progress Calculation
```typescript
interface TrophyProgress {
  trophyId: string;
  isEarned: boolean;
  progress: number;         // 0-1 decimal representing progress toward trophy
  progressPercent: number;  // 0-100 integer for UI display
  nextMilestone?: number;   // Amount needed to earn trophy
  description: string;
}

function calculateTrophyProgress(
  balances: CategoryBalances, 
  totalDonations: number
): TrophyProgress[] {
  return Object.entries(TROPHY_DEFINITIONS).map(([trophyId, trophy]) => {
    let isEarned = false;
    let progress = 0;
    let nextMilestone = undefined;
    
    switch (trophyId) {
      case 'first-saver':
        isEarned = balances.save >= 1.00;
        progress = Math.min(balances.save, 1.00);
        nextMilestone = isEarned ? undefined : 1.00 - balances.save;
        break;
        
      case 'generous-giver':
        isEarned = totalDonations >= 1.00;
        progress = Math.min(totalDonations, 1.00);
        nextMilestone = isEarned ? undefined : 1.00 - totalDonations;
        break;
        
      case 'big-saver':
        isEarned = balances.save >= 50.00;
        progress = Math.min(balances.save / 50.00, 1.0);
        nextMilestone = isEarned ? undefined : 50.00 - balances.save;
        break;
        
      case 'goal-achiever':
        const minBalance = Math.min(...Object.values(balances));
        isEarned = minBalance >= 10.00;
        progress = Math.min(minBalance / 10.00, 1.0);
        nextMilestone = isEarned ? undefined : 10.00 - minBalance;
        break;
        
      // ... other trophy calculations
    }
    
    return {
      trophyId,
      isEarned,
      progress,
      progressPercent: Math.floor(progress * 100),
      nextMilestone,
      description: trophy.description
    };
  });
}
```

## Visual Trophy Rendering

### Trophy Display States
```typescript
interface TrophyDisplayProps {
  trophy: TrophyProgress;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

const TrophyIcon = ({ trophy, size = 'md', showProgress = false }: TrophyDisplayProps) => {
  const definition = TROPHY_DEFINITIONS[trophy.trophyId];
  
  return (
    <div className={`trophy-container trophy-${size}`}>
      {/* Earned Trophy */}
      {trophy.isEarned && (
        <div className={`trophy-earned bg-${definition.color}-100 border-${definition.color}-300`}>
          <span className="trophy-icon text-2xl">{definition.icon}</span>
          <span className="trophy-name text-sm font-medium">{definition.name}</span>
        </div>
      )}
      
      {/* Unearned Trophy */}
      {!trophy.isEarned && (
        <div className="trophy-unearned bg-gray-100 border-gray-300 border-dashed">
          <span className="trophy-icon text-2xl opacity-40">{definition.icon}</span>
          <span className="trophy-name text-sm text-gray-500">{definition.name}</span>
          {showProgress && (
            <div className="progress-bar mt-1">
              <div 
                className={`progress-fill bg-${definition.color}-400`}
                style={{ width: `${trophy.progressPercent}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### Achievement Animation
```typescript
// Detect newly earned trophies for celebration
function detectNewAchievements(
  previousTrophies: TrophyProgress[],
  currentTrophies: TrophyProgress[]
): TrophyProgress[] {
  const newlyEarned = [];
  
  for (const current of currentTrophies) {
    const previous = previousTrophies.find(t => t.trophyId === current.trophyId);
    
    if (current.isEarned && (!previous || !previous.isEarned)) {
      newlyEarned.push(current);
    }
  }
  
  return newlyEarned;
}

// Achievement celebration component
const AchievementCelebration = ({ newTrophies }: { newTrophies: TrophyProgress[] }) => {
  if (newTrophies.length === 0) return null;
  
  return (
    <div className="achievement-popup animate-bounce-in">
      <h3 className="text-lg font-bold text-green-600">🎉 New Achievement!</h3>
      {newTrophies.map(trophy => (
        <div key={trophy.trophyId} className="achievement-item">
          <span className="trophy-icon text-3xl">
            {TROPHY_DEFINITIONS[trophy.trophyId].icon}
          </span>
          <div>
            <h4 className="font-medium">{TROPHY_DEFINITIONS[trophy.trophyId].name}</h4>
            <p className="text-sm text-gray-600">{trophy.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## Performance Optimization

### Efficient Trophy Calculation
```sql
-- Optimized query for trophy calculation data
CREATE INDEX idx_transactions_trophy_calc ON transactions(recipient_id, category_type, transaction_type)
  WHERE transaction_type IN ('distribution', 'withdrawal', 'dividend');

-- Materialized view for complex trophy calculations (if needed)
CREATE MATERIALIZED VIEW recipient_trophy_data AS
SELECT 
  r.id as recipient_id,
  ac_give.balance as give_balance,
  ac_spend.balance as spend_balance,
  ac_save.balance as save_balance,
  ac_invest.balance as invest_balance,
  COALESCE(donation_totals.total_donations, 0) as total_donations
FROM recipients r
LEFT JOIN allowance_categories ac_give ON r.id = ac_give.recipient_id AND ac_give.category_type = 'give'
LEFT JOIN allowance_categories ac_spend ON r.id = ac_spend.recipient_id AND ac_spend.category_type = 'spend'
LEFT JOIN allowance_categories ac_save ON r.id = ac_save.recipient_id AND ac_save.category_type = 'save'
LEFT JOIN allowance_categories ac_invest ON r.id = ac_invest.recipient_id AND ac_invest.category_type = 'invest'
LEFT JOIN (
  SELECT 
    recipient_id,
    SUM(ABS(amount)) as total_donations
  FROM transactions 
  WHERE category_type = 'give' AND transaction_type = 'withdrawal'
  GROUP BY recipient_id
) donation_totals ON r.id = donation_totals.recipient_id;

-- Refresh when balances change (can be automated with triggers)
```

### Client-Side Caching
```typescript
interface TrophyCacheEntry {
  recipientId: string;
  trophyData: TrophyProgress[];
  calculatedAt: number;
  expiresAt: number;
}

class TrophyCache {
  private cache = new Map<string, TrophyCacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  getTrophies(recipientId: string, balances: CategoryBalances, totalDonations: number): TrophyProgress[] {
    const cached = this.cache.get(recipientId);
    const now = Date.now();
    
    // Return cached data if still valid
    if (cached && now < cached.expiresAt) {
      return cached.trophyData;
    }
    
    // Calculate fresh trophy data
    const trophyData = calculateTrophyProgress(balances, totalDonations);
    
    // Cache the results
    this.cache.set(recipientId, {
      recipientId,
      trophyData,
      calculatedAt: now,
      expiresAt: now + this.CACHE_DURATION
    });
    
    return trophyData;
  }
  
  invalidate(recipientId: string): void {
    this.cache.delete(recipientId);
  }
}
```

## Educational Integration

### Achievement Trigger Points
Trophy calculations run automatically at key moments:

- **Balance Updates:** After allowance distributions or category transactions
- **Category Actions:** After charitable donations, savings withdrawals, etc.
- **Page Loads:** When viewing recipient profiles or dashboard
- **Periodic Checks:** Background recalculation for dividend payments

### Learning Reinforcement
- **Real-Time Recognition:** Immediate trophy updates reinforce positive behaviors
- **Progress Visualization:** Partial progress toward trophies encourages continued effort
- **Balanced Motivation:** Equal representation across all four financial categories
- **Achievement Context:** Trophy descriptions connect to educational financial goals

### Family Engagement
- **Achievement Celebrations:** New trophies provide natural conversation opportunities
- **Progress Discussions:** Partial progress toward trophies supports goal-setting conversations
- **Category Balance:** Trophy system encourages engagement across all financial categories
- **Long-term Recognition:** Advanced trophies acknowledge sustained positive financial behaviors

This trophy system data model successfully gamifies financial education without compromising educational integrity, providing meaningful recognition that reinforces positive financial behaviors while maintaining focus on real financial learning outcomes.