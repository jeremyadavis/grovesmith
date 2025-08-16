'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  updateRecipientProfile,
  resetRecipientAccount,
} from '@/lib/recipient-actions';

interface Recipient {
  id: string;
  name: string;
  allowance_amount: number;
  avatar_url?: string;
}

interface EditRecipientModalProps {
  recipient: Recipient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditRecipientModal({
  recipient,
  isOpen,
  onClose,
  onSuccess,
}: EditRecipientModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: recipient.name,
    allowanceAmount: recipient.allowance_amount,
    avatarUrl: recipient.avatar_url || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.allowanceAmount <= 0) {
      newErrors.allowanceAmount = 'Allowance amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await updateRecipientProfile({
        recipientId: recipient.id,
        name: formData.name.trim(),
        allowanceAmount: formData.allowanceAmount,
        avatarUrl: formData.avatarUrl.trim() || null,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update recipient:', error);
      setErrors({
        submit: 'Failed to update recipient profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: recipient.name,
      allowanceAmount: recipient.allowance_amount,
      avatarUrl: recipient.avatar_url || '',
    });
    setErrors({});
    setShowResetConfirm(false);
    onClose();
  };

  const handleResetAccount = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    setIsResetting(true);

    try {
      await resetRecipientAccount(recipient.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to reset account:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors({
        submit: `Failed to reset account: ${errorMessage}`,
      });
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {recipient.name}&rsquo;s Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter recipient name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Allowance Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="allowanceAmount">Weekly Allowance Amount</Label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">
                $
              </span>
              <Input
                id="allowanceAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.allowanceAmount}
                onChange={(e) =>
                  handleInputChange(
                    'allowanceAmount',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
                className={`pl-8 ${errors.allowanceAmount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.allowanceAmount && (
              <p className="text-sm text-red-600">{errors.allowanceAmount}</p>
            )}
          </div>

          {/* Avatar URL Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
            <Input
              id="avatarUrl"
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
            <p className="text-xs text-gray-500">
              Leave empty to use the first letter of the name
            </p>
          </div>

          {/* Reset Account Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">
                Reset Account
              </h3>
              <p className="text-sm text-gray-600">
                This will reset all balances to $0.00 across all categories,
                clear charitable cause allocations, delete all distributions,
                and remove all transaction history. This action cannot be
                undone.
              </p>

              {showResetConfirm && (
                <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
                  <p className="text-sm font-medium text-orange-800">
                    Are you sure? This will permanently reset {recipient.name}
                    &rsquo;s account to zero balances.
                  </p>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleResetAccount}
                disabled={isLoading || isResetting}
                className={`${
                  showResetConfirm
                    ? 'border-red-500 text-red-700 hover:bg-red-50'
                    : 'border-orange-500 text-orange-700 hover:bg-orange-50'
                }`}
              >
                {isResetting
                  ? 'Resetting...'
                  : showResetConfirm
                    ? 'Confirm Reset Account'
                    : 'Reset Account'}
              </Button>

              {showResetConfirm && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isResetting}
                  className="ml-2"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading || isResetting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isResetting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
