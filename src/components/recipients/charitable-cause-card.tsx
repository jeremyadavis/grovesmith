'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Target, Trash2, DollarSign, PiggyBank } from 'lucide-react';
import { format, isAfter, differenceInDays } from 'date-fns';
import { CharitableCause, completeDonation, allocateToCharity } from '@/lib/charitable-causes-actions';

interface CharitableCauseCardProps {
  cause: CharitableCause;
  availableBalance: number;
  unallocatedBalance: number;
  onUpdate: () => void;
}

export function CharitableCauseCard({ cause, availableBalance, unallocatedBalance, onUpdate }: CharitableCauseCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showAllocateDialog, setShowAllocateDialog] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [allocationAmount, setAllocationAmount] = useState('');

  const progressPercentage = Math.min((cause.current_amount / cause.goal_amount) * 100, 100);
  const remainingAmount = Math.max(cause.goal_amount - cause.current_amount, 0);
  const isOverdue = cause.due_date && isAfter(new Date(), new Date(cause.due_date));
  const daysUntilDue = cause.due_date ? differenceInDays(new Date(cause.due_date), new Date()) : null;

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
      alert(`Allocation exceeds remaining goal (${remainingAmount.toFixed(2)})`);
      return;
    }

    setIsAllocating(true);
    try {
      await allocateToCharity(cause.id, amount);
      
      setShowAllocateDialog(false);
      setAllocationAmount('');
      onUpdate();
      
      // Show success message
      alert(`Successfully allocated $${amount.toFixed(2)} to ${cause.name}!`);
    } catch (error) {
      console.error('Error allocating funds:', error);
      alert(error instanceof Error ? error.message : 'Failed to allocate funds');
    } finally {
      setIsAllocating(false);
    }
  };

  const handleCompleteDonation = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    const amount = parseFloat(donationAmount);
    if (amount > availableBalance) {
      alert('Insufficient funds in Give category');
      return;
    }

    if (amount > remainingAmount) {
      alert(`Donation amount exceeds remaining goal (${remainingAmount.toFixed(2)})`);
      return;
    }

    setIsCompleting(true);
    try {
      await completeDonation({
        causeId: cause.id,
        donationAmount: amount
      });
      
      setShowCompleteDialog(false);
      setDonationAmount('');
      onUpdate();
      
      // Show success message
      alert(`Successfully donated $${amount.toFixed(2)} to ${cause.name}!`);
    } catch (error) {
      console.error('Error completing donation:', error);
      alert(error instanceof Error ? error.message : 'Failed to complete donation');
    } finally {
      setIsCompleting(false);
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
    <Card className={`relative ${cause.is_completed ? 'bg-green-50 border-green-200' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2">
              <Heart className={`h-5 w-5 ${cause.is_completed ? 'text-green-600' : 'text-gray-600'}`} />
              <span>{cause.name}</span>
            </CardTitle>
            {cause.description && (
              <p className="text-sm text-gray-600 mt-1">{cause.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* TODO: Implement delete */}}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Allocated Progress</span>
            <span className="text-sm text-gray-600">
              ${cause.current_amount.toFixed(2)} of ${cause.goal_amount.toFixed(2)}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{progressPercentage.toFixed(1)}% allocated</span>
            <span>${remainingAmount.toFixed(2)} to allocate</span>
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
        <div className="flex items-center space-x-2 text-sm">
          <Target className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">
            Goal: ${cause.goal_amount.toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        {!cause.is_completed && remainingAmount > 0 && (
          <div className="space-y-2">
            {/* Allocate Funds Button */}
            {unallocatedBalance > 0 && (
              <Button 
                onClick={() => setShowAllocateDialog(true)}
                disabled={unallocatedBalance <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <PiggyBank className="h-4 w-4 mr-2" />
                Allocate Funds (${unallocatedBalance.toFixed(2)} available)
              </Button>
            )}
            
            {/* Donate Button */}
            <Button 
              onClick={() => setShowCompleteDialog(true)}
              disabled={availableBalance <= 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Donate Money
            </Button>
          </div>
        )}

        {cause.is_completed && (
          <div className="text-center py-2 text-green-600 font-medium">
            ✓ Goal Reached & Donated!
          </div>
        )}
      </CardContent>

      {/* Allocation Dialog */}
      {showAllocateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Allocate Funds</h3>
            <p className="text-sm text-gray-600 mb-4">
              How much would you like to allocate to <strong>{cause.name}</strong>?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Allocation Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={Math.min(remainingAmount, unallocatedBalance)}
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unallocated: ${unallocatedBalance.toFixed(2)} • Remaining Goal: ${remainingAmount.toFixed(2)}
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
                  {isAllocating ? 'Allocating...' : 'Allocate'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Dialog */}
      {showCompleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Complete Donation</h3>
            <p className="text-sm text-gray-600 mb-4">
              How much would you like to donate to <strong>{cause.name}</strong>?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Donation Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={Math.min(remainingAmount, availableBalance)}
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: ${availableBalance.toFixed(2)} • Remaining: ${remainingAmount.toFixed(2)}
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCompleteDialog(false);
                    setDonationAmount('');
                  }}
                  disabled={isCompleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteDonation}
                  disabled={isCompleting || !donationAmount}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isCompleting ? 'Donating...' : 'Donate'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}