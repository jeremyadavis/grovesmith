-- Grovesmith Database Setup
-- Run these commands in your Supabase SQL editor

-- 1. Create managers table
CREATE TABLE managers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create recipients table
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

-- 3. Create allowance_categories table
CREATE TABLE allowance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL CHECK (category_type IN ('give', 'spend', 'save', 'invest')),
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipient_id, category_type)
);

-- 4. Create allowance_transactions table  
CREATE TABLE allowance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL CHECK (category_type IN ('give', 'spend', 'save', 'invest')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('allowance', 'adjustment', 'withdrawal', 'dividend')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_id UUID,
  created_by UUID REFERENCES managers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Performance indexes
CREATE INDEX idx_recipients_manager_id ON recipients(manager_id);
CREATE INDEX idx_allowance_categories_recipient_id ON allowance_categories(recipient_id);
CREATE INDEX idx_allowance_transactions_recipient_id ON allowance_transactions(recipient_id);
CREATE INDEX idx_allowance_transactions_created_at ON allowance_transactions(created_at);

-- 6. Enable Row Level Security
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowance_transactions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for managers
CREATE POLICY "Managers can view own profile" ON managers 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Managers can update own profile" ON managers 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Managers can insert own profile" ON managers 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. RLS Policies for recipients
CREATE POLICY "Managers can manage own recipients" ON recipients 
  FOR ALL USING (manager_id = auth.uid());

-- 9. RLS Policies for allowance_categories
CREATE POLICY "Managers can manage own recipient categories" ON allowance_categories 
  FOR ALL USING (recipient_id IN (
    SELECT id FROM recipients WHERE manager_id = auth.uid()
  ));

-- 10. RLS Policies for allowance_transactions
CREATE POLICY "Managers can manage own recipient transactions" ON allowance_transactions 
  FOR ALL USING (recipient_id IN (
    SELECT id FROM recipients WHERE manager_id = auth.uid()
  ));

-- 11. Function to automatically create categories when recipient is created
CREATE OR REPLACE FUNCTION create_default_categories()
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

-- 12. Trigger to create categories automatically
CREATE TRIGGER trigger_create_default_categories
  AFTER INSERT ON recipients
  FOR EACH ROW EXECUTE FUNCTION create_default_categories();