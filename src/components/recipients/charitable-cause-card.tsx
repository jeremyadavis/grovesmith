'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Heart,
  Calendar,
  Target,
  Edit,
  PiggyBank,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import { format, isAfter, differenceInDays } from 'date-fns';
import {
  CharitableCause,
  allocateToCharity,
  markCauseComplete,
} from '@/lib/charitable-causes-actions';

interface CharitableCauseCardProps {
  cause: CharitableCause;
  availableBalance: number;
  unallocatedBalance: number;
  onUpdate: () => void;
  onEdit: (cause: CharitableCause) => void;
}

export function CharitableCauseCard({
  cause,
  availableBalance,
  unallocatedBalance,
  onUpdate,
  onEdit,
}: CharitableCauseCardProps) {
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [showMarkCompleteDialog, setShowMarkCompleteDialog] = useState(false);
  const [showAllocateDialog, setShowAllocateDialog] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationAmount, setAllocationAmount] = useState('');

  const progressPercentage = Math.min(
    (cause.current_amount / cause.goal_amount) * 100,
    100
  );
  const remainingAmount = Math.max(cause.goal_amount - cause.current_amount, 0);
  const isGoalReached = progressPercentage >= 100;
  const isOverdue =
    cause.due_date && isAfter(new Date(), new Date(cause.due_date));
  const daysUntilDue = cause.due_date
    ? differenceInDays(new Date(cause.due_date), new Date())
    : null;

  const handleAllocateFunds = async () => {
    if (!allocationAmount || parseFloat(allocationAmount) <= 0) {
      alert('Please enter a valid allocation amount');
      return;
    }

    const amount = parseFloat(allocationAmount);
    if (amount > unallocatedBalance) {
      alert('Insufficient unallocated funds');
      return;
    }

    if (amount > remainingAmount) {
      alert(
        `Allocation exceeds remaining goal (${remainingAmount.toFixed(2)})`
      );
      return;
    }

    setIsAllocating(true);
    try {
      await allocateToCharity(cause.id, amount);

      setShowAllocateDialog(false);
      setAllocationAmount('');
      onUpdate();
    } catch (error) {
      console.error('Error giving to cause:', error);
      alert(error instanceof Error ? error.message : 'Failed to give to cause');
    } finally {
      setIsAllocating(false);
    }
  };

  const handleMarkComplete = async () => {
    setIsMarkingComplete(true);
    try {
      await markCauseComplete({
        causeId: cause.id,
      });

      setShowMarkCompleteDialog(false);
      onUpdate();

      // Show success message
      alert(
        `Successfully completed ${cause.name} with a donation of $${cause.current_amount.toFixed(2)}!`
      );
    } catch (error) {
      console.error('Error marking cause complete:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to mark cause complete'
      );
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const getStatusBadge = () => {
    if (cause.is_completed) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }
    if (daysUntilDue !== null && daysUntilDue <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
  };

  return (
    <Card
      className={`relative ${cause.is_completed ? 'border-green-200 bg-green-50' : ''}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2">
              <Heart
                className={`h-5 w-5 ${cause.is_completed ? 'text-green-600' : 'text-gray-600'}`}
              />
              <span>{cause.name}</span>
            </CardTitle>
            {cause.description && (
              <p className="mt-1 text-sm text-gray-600">{cause.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(cause)}
              className="text-gray-400 hover:text-blue-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {isGoalReached ? '🎯 Goal Reached!' : 'Allocated Progress'}
            </span>
            <span
              className={`text-sm ${isGoalReached ? 'font-semibold text-green-600' : 'text-gray-600'}`}
            >
              ${cause.current_amount.toFixed(2)} of $
              {cause.goal_amount.toFixed(2)}
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className={`h-3 ${isGoalReached ? 'bg-green-100' : ''}`}
          />
          <div className="flex items-center justify-between text-xs">
            <span
              className={
                isGoalReached ? 'font-medium text-green-600' : 'text-gray-500'
              }
            >
              {progressPercentage.toFixed(1)}% allocated
              {isGoalReached ? ' ✨' : ''}
            </span>
            {!isGoalReached && (
              <span className="text-gray-500">
                ${remainingAmount.toFixed(2)} to allocate
              </span>
            )}
            {isGoalReached && (
              <span className="font-medium text-green-600">
                Ready to donate!
              </span>
            )}
          </div>
        </div>

        {/* Due Date */}
        {cause.due_date && (
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className={isOverdue ? 'text-red-600' : 'text-gray-600'}>
              Due: {format(new Date(cause.due_date), 'MMM d, yyyy')}
              {daysUntilDue !== null && daysUntilDue > 0 && (
                <span className="text-gray-400"> ({daysUntilDue} days)</span>
              )}
            </span>
          </div>
        )}

        {/* Goal Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <Target className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              Goal: ${cause.goal_amount.toFixed(2)}
            </span>
          </div>

          {/* Progress < 100% - Give Button (Single or Split) */}
          {!cause.is_completed &&
            !isGoalReached &&
            remainingAmount > 0 &&
            unallocatedBalance > 0 && (
              <>
                {/* 0% Progress - Single Give Button */}
                {cause.current_amount === 0 && (
                  <Button
                    onClick={() => setShowAllocateDialog(true)}
                    disabled={unallocatedBalance <= 0}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <PiggyBank className="mr-1 h-3 w-3" />
                    Give
                  </Button>
                )}

                {/* 1-99% Progress - Split Button */}
                {cause.current_amount > 0 && (
                  <div className="flex">
                    <Button
                      onClick={() => setShowAllocateDialog(true)}
                      disabled={unallocatedBalance <= 0}
                      size="sm"
                      className="rounded-r-none border-r-0 bg-blue-600 hover:bg-blue-700"
                    >
                      <PiggyBank className="mr-1 h-3 w-3" />
                      Give
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          disabled={availableBalance < cause.current_amount}
                          className="rounded-l-none border-l border-blue-500 bg-blue-600 px-2 hover:bg-blue-700"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => setShowMarkCompleteDialog(true)}
                          disabled={availableBalance < cause.current_amount}
                          className="cursor-pointer"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Complete (${cause.current_amount.toFixed(2)})
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </>
            )}
        </div>

        {/* Action Buttons */}
        {!cause.is_completed && (
          <div className="space-y-3">
            {/* Goal Reached State - Prominent Complete Button */}
            {isGoalReached && cause.current_amount > 0 && (
              <Button
                onClick={() => setShowMarkCompleteDialog(true)}
                disabled={availableBalance < cause.current_amount}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 py-3 font-semibold text-white shadow-lg hover:from-green-700 hover:to-green-800"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                🎉 Complete & Donate (${cause.current_amount.toFixed(2)})
              </Button>
            )}
          </div>
        )}

        {cause.is_completed && (
          <div className="py-2 text-center font-medium text-green-600">
            ✓ Goal Reached & Donated!
          </div>
        )}
      </CardContent>

      {/* Give Dialog */}
      {showAllocateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Give to Cause</h3>
            <p className="mb-4 text-sm text-gray-600">
              How much would you like to give to <strong>{cause.name}</strong>?
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Amount to Give
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={Math.min(remainingAmount, unallocatedBalance)}
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Unallocated: ${unallocatedBalance.toFixed(2)} • Remaining
                  Goal: ${remainingAmount.toFixed(2)}
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAllocateDialog(false);
                    setAllocationAmount('');
                  }}
                  disabled={isAllocating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAllocateFunds}
                  disabled={isAllocating || !allocationAmount}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isAllocating ? 'Giving...' : 'Give'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Complete Dialog */}
      {showMarkCompleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Mark Cause Complete</h3>
            <p className="mb-4 text-sm text-gray-600">
              Are you sure you want to mark <strong>{cause.name}</strong> as
              complete? This will donate the full allocated amount of{' '}
              <strong>${cause.current_amount.toFixed(2)}</strong>
              and mark the cause as completed.
            </p>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowMarkCompleteDialog(false)}
                disabled={isMarkingComplete}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkComplete}
                disabled={isMarkingComplete}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isMarkingComplete ? 'Completing...' : 'Mark Complete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
