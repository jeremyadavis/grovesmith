'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Heart, PiggyBank } from 'lucide-react';
import { getGiveCategoryBalance } from '@/lib/charitable-causes-actions';

interface GiveBalanceSummaryProps {
  recipientId: string;
  recipientName: string;
}

export function GiveBalanceSummary({
  recipientId,
  recipientName,
}: GiveBalanceSummaryProps) {
  const [balanceInfo, setBalanceInfo] = useState({
    totalUnspent: 0,
    totalAllocated: 0,
    unallocated: 0,
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
          <div className="py-4 text-center text-gray-500">
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
          <div className="py-4 text-center text-red-500">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total Unspent */}
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <DollarSign className="mx-auto mb-2 h-8 w-8 text-green-600" />
            <div className="text-2xl font-bold text-green-700">
              ${balanceInfo.totalUnspent.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Give Money</div>
            <div className="mt-1 text-xs text-gray-500">
              All unspent give funds
            </div>
          </div>

          {/* Allocated to Causes */}
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <Heart className="mx-auto mb-2 h-8 w-8 text-pink-600" />
            <div className="text-2xl font-bold text-pink-700">
              ${balanceInfo.totalAllocated.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Allocated to Causes</div>
            <div className="mt-1 text-xs text-gray-500">
              Money saved for specific causes
            </div>
          </div>

          {/* Available to Allocate */}
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <PiggyBank className="mx-auto mb-2 h-8 w-8 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700">
              ${balanceInfo.unallocated.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Available to Allocate</div>
            <div className="mt-1 text-xs text-gray-500">
              Unassigned give money
            </div>
          </div>
        </div>

        {balanceInfo.unallocated > 0 && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-700">
              💡 You have ${balanceInfo.unallocated.toFixed(2)} available to
              allocate to charitable causes
            </p>
          </div>
        )}

        {balanceInfo.totalAllocated > 0 && (
          <div className="mt-2 rounded-lg border border-pink-200 bg-pink-50 p-3">
            <p className="text-sm text-pink-700">
              ❤️ ${balanceInfo.totalAllocated.toFixed(2)} is currently allocated
              to active causes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
