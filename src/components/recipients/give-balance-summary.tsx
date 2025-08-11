'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Heart, PiggyBank } from 'lucide-react';
import { getGiveCategoryBalance } from '@/lib/charitable-causes-actions';

interface GiveBalanceSummaryProps {
  recipientId: string;
  recipientName: string;
}

export function GiveBalanceSummary({ recipientId, recipientName }: GiveBalanceSummaryProps) {
  const [balanceInfo, setBalanceInfo] = useState({
    totalUnspent: 0,
    totalAllocated: 0,
    unallocated: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const balance = await getGiveCategoryBalance(recipientId);
      setBalanceInfo(balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to load balance');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [recipientId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center py-4 text-gray-500">
            <p>Loading balance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center py-4 text-red-500">
            <p>Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-700">Give Money Overview</CardTitle>
        <CardDescription>
          {recipientName}&apos;s charitable giving funds and allocations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Unspent */}
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">
              ${balanceInfo.totalUnspent.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Give Money</div>
            <div className="text-xs text-gray-500 mt-1">
              All unspent give funds
            </div>
          </div>

          {/* Allocated to Causes */}
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-pink-700">
              ${balanceInfo.totalAllocated.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Allocated to Causes</div>
            <div className="text-xs text-gray-500 mt-1">
              Money saved for specific causes
            </div>
          </div>

          {/* Available to Allocate */}
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <PiggyBank className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">
              ${balanceInfo.unallocated.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Available to Allocate</div>
            <div className="text-xs text-gray-500 mt-1">
              Unassigned give money
            </div>
          </div>
        </div>

        {balanceInfo.unallocated > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              💡 You have ${balanceInfo.unallocated.toFixed(2)} available to allocate to charitable causes
            </p>
          </div>
        )}

        {balanceInfo.totalAllocated > 0 && (
          <div className="mt-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
            <p className="text-sm text-pink-700">
              ❤️ ${balanceInfo.totalAllocated.toFixed(2)} is currently allocated to active causes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}