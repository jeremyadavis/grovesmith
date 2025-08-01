'use client';

import { useEffect, useState } from 'react';
import { calculateUndistributedAllowance } from '@/lib/distribution-actions';

interface UndistributedFundsProps {
  recipientId: string;
  children: (data: {
    undistributedAmount: number;
    weeksPending: number;
    isLoading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export function UndistributedFundsCalculator({ recipientId, children }: UndistributedFundsProps) {
  const [data, setData] = useState({
    undistributedAmount: 0,
    weeksPending: 0,
    isLoading: true,
    error: null as string | null
  });

  useEffect(() => {
    async function fetchUndistributedAmount() {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        const result = await calculateUndistributedAllowance(recipientId);
        
        setData({
          undistributedAmount: result.undistributedAmount,
          weeksPending: Math.floor(result.undistributedAmount / result.weeklyAllowance),
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error calculating undistributed funds:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to calculate undistributed funds'
        }));
      }
    }

    fetchUndistributedAmount();
  }, [recipientId]);

  return <>{children(data)}</>;
}