'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { createCharitableCause } from '@/lib/charitable-causes-actions';

interface AddCauseModalProps {
  recipientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCauseModal({ recipientId, isOpen, onClose, onSuccess }: AddCauseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goalAmount: '',
    dueDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.goalAmount) {
      alert('Please fill in all required fields');
      return;
    }

    const goalAmount = parseFloat(formData.goalAmount);
    if (goalAmount <= 0) {
      alert('Goal amount must be greater than zero');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCharitableCause({
        recipientId,
        name: formData.name,
        description: formData.description || undefined,
        goalAmount,
        dueDate: formData.dueDate || undefined
      });

      // Reset form and close modal
      setFormData({ name: '', description: '', goalAmount: '', dueDate: '' });
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error creating cause:', error);
      alert(error instanceof Error ? error.message : 'Failed to create cause');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', goalAmount: '', dueDate: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add Charitable Cause</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Cause Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Local Animal Shelter"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Why is this cause important?"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Goal Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.goalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, goalAmount: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Creating...' : 'Create Cause'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}