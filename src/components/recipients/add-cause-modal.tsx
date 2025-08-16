'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Trash2 } from 'lucide-react';
import {
  createCharitableCause,
  updateCharitableCause,
  deleteCharitableCause,
  CharitableCause,
} from '@/lib/charitable-causes-actions';

interface AddCauseModalProps {
  recipientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCause?: CharitableCause | null;
}

export function AddCauseModal({
  recipientId,
  isOpen,
  onClose,
  onSuccess,
  editingCause,
}: AddCauseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goalAmount: '',
    dueDate: '',
  });

  const isEditing = !!editingCause;

  // Populate form data when editing
  useEffect(() => {
    if (editingCause) {
      setFormData({
        name: editingCause.name,
        description: editingCause.description || '',
        goalAmount: editingCause.goal_amount.toString(),
        dueDate: editingCause.due_date || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        goalAmount: '',
        dueDate: '',
      });
    }
  }, [editingCause]);

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
      if (isEditing && editingCause) {
        await updateCharitableCause({
          causeId: editingCause.id,
          name: formData.name,
          description: formData.description || undefined,
          goalAmount,
          dueDate: formData.dueDate || undefined,
        });
      } else {
        await createCharitableCause({
          recipientId,
          name: formData.name,
          description: formData.description || undefined,
          goalAmount,
          dueDate: formData.dueDate || undefined,
        });
      }

      handleClose();
      onSuccess();
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} cause:`,
        error
      );
      alert(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? 'update' : 'create'} cause`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingCause) return;

    setIsDeleting(true);
    try {
      await deleteCharitableCause(editingCause.id);
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error deleting cause:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete cause');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', goalAmount: '', dueDate: '' });
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isEditing ? 'Edit Charitable Cause' : 'Add Charitable Cause'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Cause Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="e.g., Local Animal Shelter"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Why is this cause important?"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Goal Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.goalAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    goalAmount: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Delete Section for Edit Mode */}
            {isEditing && editingCause && (
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Delete Cause
                  </h3>
                  <p className="text-sm text-gray-600">
                    Deleting this cause will return any allocated funds ($
                    {editingCause.current_amount.toFixed(2)}) back to available
                    funds. This action cannot be undone.
                  </p>

                  {showDeleteConfirm && (
                    <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
                      <p className="text-sm font-medium text-orange-800">
                        Are you sure? This will permanently delete &quot;
                        {editingCause.name}&quot;.
                      </p>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      showDeleteConfirm
                        ? handleDelete()
                        : setShowDeleteConfirm(true)
                    }
                    disabled={isSubmitting || isDeleting}
                    className={`${
                      showDeleteConfirm
                        ? 'border-red-500 text-red-700 hover:bg-red-50'
                        : 'border-orange-500 text-orange-700 hover:bg-orange-50'
                    }`}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting
                      ? 'Deleting...'
                      : showDeleteConfirm
                        ? 'Confirm Delete Cause'
                        : 'Delete Cause'}
                  </Button>

                  {showDeleteConfirm && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="ml-2"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting
                  ? isEditing
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditing
                    ? 'Update Cause'
                    : 'Create Cause'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
