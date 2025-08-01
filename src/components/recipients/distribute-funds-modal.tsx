'use client';

import { useState } from 'react';
import { X, Gift, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Recipient {
  id: string;
  name: string;
  allowance_amount: number;
  categories: {
    give: number;
    spend: number;
    save: number;
    invest: number;
  };
}

interface DistributeFundsModalProps {
  recipient: Recipient;
  isOpen: boolean;
  onClose: () => void;
  onDistribute: (distribution: CategoryDistribution, date: Date) => void;
}

interface CategoryDistribution {
  give: number;
  spend: number;
  save: number;
  invest: number;
}

export function DistributeFundsModal({
  recipient,
  isOpen,
  onClose,
  onDistribute,
}: DistributeFundsModalProps) {
  // Allow testing by creating undistributed funds
  const [undistributedAmount, setUndistributedAmount] = useState(recipient.allowance_amount * 3);

  const [distribution, setDistribution] = useState<CategoryDistribution>({
    give: 0,
    spend: 0,
    save: 0,
    invest: 0,
  });

  const [distributionDate, setDistributionDate] = useState<Date>(new Date());

  const totalDistributed = Object.values(distribution).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const remaining = undistributedAmount - totalDistributed;

  const handleDistribute = (
    category: keyof CategoryDistribution,
    amount: number
  ) => {
    const newAmount = Math.max(0, Math.min(amount, undistributedAmount));
    setDistribution((prev) => ({
      ...prev,
      [category]: newAmount,
    }));
  };

  const handleQuickDistribute = () => {
    const equalAmount = undistributedAmount / 4;
    setDistribution({
      give: equalAmount,
      spend: equalAmount,
      save: equalAmount,
      invest: equalAmount,
    });
  };

  const handleSubmit = () => {
    if (totalDistributed > 0) {
      onDistribute(distribution, distributionDate);
      // Reduce the undistributed amount by what was distributed
      setUndistributedAmount(prev => Math.max(0, prev - totalDistributed));
      setDistribution({ give: 0, spend: 0, save: 0, invest: 0 });
      // Keep modal open for testing multiple distributions
      // onClose(); // Comment out to allow multiple distributions
    }
  };

  const handleReset = () => {
    setDistribution({ give: 0, spend: 0, save: 0, invest: 0 });
  };

  const handleClose = () => {
    setDistribution({ give: 0, spend: 0, save: 0, invest: 0 });
    setDistributionDate(new Date());
    setUndistributedAmount(recipient.allowance_amount * 3); // Reset for next test
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Distribute Funds
            </h2>
            <p className="text-sm text-gray-600">{recipient.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Available Amount - Editable for Testing */}
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-600">Available to Distribute</p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <button
                onClick={() => setUndistributedAmount(Math.max(0, undistributedAmount - recipient.allowance_amount))}
                className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600"
              >
                -
              </button>
              <input
                type="number"
                value={undistributedAmount.toFixed(2)}
                onChange={(e) => setUndistributedAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-32 text-center border border-blue-300 rounded px-2 py-1 text-xl font-bold text-blue-800 bg-white"
                step={recipient.allowance_amount}
                min="0"
              />
              <button
                onClick={() => setUndistributedAmount(undistributedAmount + recipient.allowance_amount)}
                className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600"
              >
                +
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {Math.floor(undistributedAmount / recipient.allowance_amount)} weeks @ ${recipient.allowance_amount}/week
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button
              onClick={handleQuickDistribute}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Split Equally
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Reset
            </Button>
          </div>

          {/* Category Distribution */}
          <div className="space-y-4">
            {/* Give */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Give</div>
                  <div className="text-sm text-gray-500">
                    Current: ${recipient.categories.give.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleDistribute('give', distribution.give - 0.25)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  disabled={distribution.give <= 0}
                >
                  -
                </button>
                <input
                  type="number"
                  value={distribution.give.toFixed(2)}
                  onChange={(e) =>
                    handleDistribute('give', parseFloat(e.target.value) || 0)
                  }
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm"
                  step="0.25"
                  min="0"
                  max={undistributedAmount}
                />
                <button
                  onClick={() =>
                    handleDistribute('give', distribution.give + 0.25)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  disabled={remaining < 0.25}
                >
                  +
                </button>
              </div>
            </div>

            {/* Spend */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <div className="relative h-4 w-5 rounded-sm border-2 border-blue-600">
                    <div className="absolute -top-1 left-1/2 h-1 w-2 -translate-x-1/2 transform rounded-t-sm border-t-2 border-r-2 border-l-2 border-blue-600"></div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Spend</div>
                  <div className="text-sm text-gray-500">
                    Current: ${recipient.categories.spend.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleDistribute('spend', distribution.spend - 0.25)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  disabled={distribution.spend <= 0}
                >
                  -
                </button>
                <input
                  type="number"
                  value={distribution.spend.toFixed(2)}
                  onChange={(e) =>
                    handleDistribute('spend', parseFloat(e.target.value) || 0)
                  }
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm"
                  step="0.25"
                  min="0"
                  max={undistributedAmount}
                />
                <button
                  onClick={() =>
                    handleDistribute('spend', distribution.spend + 0.25)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  disabled={remaining < 0.25}
                >
                  +
                </button>
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <div className="relative h-5 w-5 rounded-sm border-2 border-purple-600">
                    <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-purple-600"></div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Save</div>
                  <div className="text-sm text-gray-500">
                    Current: ${recipient.categories.save.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleDistribute('save', distribution.save - 0.25)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  disabled={distribution.save <= 0}
                >
                  -
                </button>
                <input
                  type="number"
                  value={distribution.save.toFixed(2)}
                  onChange={(e) =>
                    handleDistribute('save', parseFloat(e.target.value) || 0)
                  }
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm"
                  step="0.25"
                  min="0"
                  max={undistributedAmount}
                />
                <button
                  onClick={() =>
                    handleDistribute('save', distribution.save + 0.25)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  disabled={remaining < 0.25}
                >
                  +
                </button>
              </div>
            </div>

            {/* Invest */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <svg
                    className="h-5 w-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Invest</div>
                  <div className="text-sm text-gray-500">
                    Current: ${recipient.categories.invest.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleDistribute('invest', distribution.invest - 0.25)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  disabled={distribution.invest <= 0}
                >
                  -
                </button>
                <input
                  type="number"
                  value={distribution.invest.toFixed(2)}
                  onChange={(e) =>
                    handleDistribute('invest', parseFloat(e.target.value) || 0)
                  }
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm"
                  step="0.25"
                  min="0"
                  max={undistributedAmount}
                />
                <button
                  onClick={() =>
                    handleDistribute('invest', distribution.invest + 0.25)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  disabled={remaining < 0.25}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Distributed:</span>
              <span className="font-medium text-gray-900">
                ${totalDistributed.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Remaining:</span>
              <span
                className={`font-medium ${remaining === 0 ? 'text-green-600' : 'text-gray-900'}`}
              >
                ${remaining.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Distribution Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Distribution Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !distributionDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {distributionDate
                    ? format(distributionDate, 'PPP')
                    : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={distributionDate}
                  onSelect={(date) => date && setDistributionDate(date)}
                  disabled={(date) =>
                    date > new Date() || date < new Date('1900-01-01')
                  }
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500">
              This will record the distribution as if it happened on this date
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex space-x-3 rounded-b-lg border-t bg-gray-50 p-6">
          <Button onClick={handleClose} variant="outline" className="flex-1">
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={totalDistributed === 0}
            className="flex-1"
          >
            Distribute ${totalDistributed.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
