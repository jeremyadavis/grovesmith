-- Distribution and Transaction Schema for Grovesmith
-- Run these commands in your Supabase SQL Editor

-- 0. Create the update_updated_at_column function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Create distributions table to track allowance distributions
CREATE TABLE IF NOT EXISTS distributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES managers(id) ON DELETE CASCADE,
    distribution_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    give_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (give_amount >= 0),
    spend_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (spend_amount >= 0),
    save_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (save_amount >= 0),
    invest_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (invest_amount >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create transactions table for detailed transaction history
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
    distribution_id UUID REFERENCES distributions(id) ON DELETE SET NULL,
    category_type TEXT NOT NULL CHECK (category_type IN ('give', 'spend', 'save', 'invest')),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('distribution', 'withdrawal', 'dividend', 'bonus')),
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL CHECK (balance_after >= 0),
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add RLS policies for distributions
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own distributions" ON distributions
    FOR SELECT USING (manager_id = auth.uid());

CREATE POLICY "Users can insert their own distributions" ON distributions
    FOR INSERT WITH CHECK (manager_id = auth.uid());

CREATE POLICY "Users can update their own distributions" ON distributions
    FOR UPDATE USING (manager_id = auth.uid());

CREATE POLICY "Users can delete their own distributions" ON distributions
    FOR DELETE USING (manager_id = auth.uid());

-- 4. Add RLS policies for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions for their recipients" ON transactions
    FOR SELECT USING (
        recipient_id IN (
            SELECT id FROM recipients WHERE manager_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert transactions for their recipients" ON transactions
    FOR INSERT WITH CHECK (
        recipient_id IN (
            SELECT id FROM recipients WHERE manager_id = auth.uid()
        )
    );

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_distributions_recipient_id ON distributions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_distributions_manager_id ON distributions(manager_id);
CREATE INDEX IF NOT EXISTS idx_distributions_date ON distributions(distribution_date);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_id ON transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- 6. Create function to automatically update category balances after distribution
CREATE OR REPLACE FUNCTION update_category_balances_after_distribution()
RETURNS TRIGGER AS $$
BEGIN
    -- Update give category balance
    UPDATE allowance_categories
    SET balance = balance + NEW.give_amount,
        updated_at = NOW()
    WHERE recipient_id = NEW.recipient_id AND category_type = 'give';

    -- Update spend category balance
    UPDATE allowance_categories
    SET balance = balance + NEW.spend_amount,
        updated_at = NOW()
    WHERE recipient_id = NEW.recipient_id AND category_type = 'spend';

    -- Update save category balance
    UPDATE allowance_categories
    SET balance = balance + NEW.save_amount,
        updated_at = NOW()
    WHERE recipient_id = NEW.recipient_id AND category_type = 'save';

    -- Update invest category balance
    UPDATE allowance_categories
    SET balance = balance + NEW.invest_amount,
        updated_at = NOW()
    WHERE recipient_id = NEW.recipient_id AND category_type = 'invest';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to automatically update balances
CREATE TRIGGER trigger_update_category_balances_after_distribution
    AFTER INSERT ON distributions
    FOR EACH ROW
    EXECUTE FUNCTION update_category_balances_after_distribution();

-- 8. Create function to create transaction records after distribution
CREATE OR REPLACE FUNCTION create_transaction_records_after_distribution()
RETURNS TRIGGER AS $$
DECLARE
    current_give_balance DECIMAL(10,2);
    current_spend_balance DECIMAL(10,2);
    current_save_balance DECIMAL(10,2);
    current_invest_balance DECIMAL(10,2);
BEGIN
    -- Get updated balances after the distribution
    SELECT balance INTO current_give_balance
    FROM allowance_categories
    WHERE recipient_id = NEW.recipient_id AND category_type = 'give';

    SELECT balance INTO current_spend_balance
    FROM allowance_categories
    WHERE recipient_id = NEW.recipient_id AND category_type = 'spend';

    SELECT balance INTO current_save_balance
    FROM allowance_categories
    WHERE recipient_id = NEW.recipient_id AND category_type = 'save';

    SELECT balance INTO current_invest_balance
    FROM allowance_categories
    WHERE recipient_id = NEW.recipient_id AND category_type = 'invest';

    -- Create transaction records for each non-zero category
    IF NEW.give_amount > 0 THEN
        INSERT INTO transactions (
            recipient_id, distribution_id, category_type, transaction_type,
            amount, balance_after, description, transaction_date
        ) VALUES (
            NEW.recipient_id, NEW.id, 'give', 'distribution',
            NEW.give_amount, current_give_balance,
            'Allowance distribution', NEW.distribution_date
        );
    END IF;

    IF NEW.spend_amount > 0 THEN
        INSERT INTO transactions (
            recipient_id, distribution_id, category_type, transaction_type,
            amount, balance_after, description, transaction_date
        ) VALUES (
            NEW.recipient_id, NEW.id, 'spend', 'distribution',
            NEW.spend_amount, current_spend_balance,
            'Allowance distribution', NEW.distribution_date
        );
    END IF;

    IF NEW.save_amount > 0 THEN
        INSERT INTO transactions (
            recipient_id, distribution_id, category_type, transaction_type,
            amount, balance_after, description, transaction_date
        ) VALUES (
            NEW.recipient_id, NEW.id, 'save', 'distribution',
            NEW.save_amount, current_save_balance,
            'Allowance distribution', NEW.distribution_date
        );
    END IF;

    IF NEW.invest_amount > 0 THEN
        INSERT INTO transactions (
            recipient_id, distribution_id, category_type, transaction_type,
            amount, balance_after, description, transaction_date
        ) VALUES (
            NEW.recipient_id, NEW.id, 'invest', 'distribution',
            NEW.invest_amount, current_invest_balance,
            'Allowance distribution', NEW.distribution_date
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to automatically create transaction records
CREATE TRIGGER trigger_create_transaction_records_after_distribution
    AFTER INSERT ON distributions
    FOR EACH ROW
    EXECUTE FUNCTION create_transaction_records_after_distribution();

-- 10. Add updated_at trigger for distributions
CREATE TRIGGER trigger_update_distributions_updated_at
    BEFORE UPDATE ON distributions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();