'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getRecipientTransactions } from '@/lib/distribution-actions';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  category_type: 'give' | 'spend' | 'save' | 'invest';
  transaction_type: 'distribution' | 'withdrawal' | 'dividend' | 'bonus';
  amount: string;
  balance_after: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
  distributions?: {
    distribution_date: string;
    notes: string | null;
  } | null;
}

interface CategoryTransactionHistoryProps {
  recipientId: string;
  categoryType: 'give' | 'spend' | 'save' | 'invest';
  title?: string;
  description?: string;
}

export function CategoryTransactionHistory({ 
  recipientId, 
  categoryType, 
  title = "Transaction History",
  description = "Recent transactions for this category"
}: CategoryTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true);
        setError(null);
        
        const allTransactions = await getRecipientTransactions(recipientId, 50);
        
        // Filter transactions for this specific category
        const categoryTransactions = allTransactions.filter(
          (transaction: Transaction) => transaction.category_type === categoryType
        );
        
        setTransactions(categoryTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [recipientId, categoryType]);

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'distribution':
        return 'Allowance';
      case 'withdrawal':
        return 'Withdrawal';
      case 'dividend':
        return 'Dividend';
      case 'bonus':
        return 'Bonus';
      default:
        return type;
    }
  };

  const getTransactionColor = (type: string, amount: string) => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      return 'text-green-600'; // Money added
    } else {
      return 'text-red-600'; // Money removed
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions yet for this category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {formatTransactionType(transaction.transaction_type)}
                    </span>
                    <span className={`font-bold ${getTransactionColor(transaction.transaction_type, transaction.amount)}`}>
                      {parseFloat(transaction.amount) > 0 ? '+' : ''}${parseFloat(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                    <span>
                      {format(new Date(transaction.transaction_date), 'MMM d, yyyy')}
                    </span>
                    <span>
                      Balance: ${parseFloat(transaction.balance_after).toFixed(2)}
                    </span>
                  </div>
                  {transaction.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {transactions.length >= 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Showing recent transactions • View all in full transaction history
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}