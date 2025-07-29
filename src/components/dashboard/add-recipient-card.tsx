'use client';

import { useState } from 'react';
import { addRecipient } from '@/lib/auth-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export function AddRecipientCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError('');

    try {
      await addRecipient(formData);
      setIsOpen(false);
      // Form will be reset by the dialog closing
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-2 border-dashed border-gray-300 transition-all hover:border-gray-400 hover:shadow-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-1 font-semibold text-gray-900">Add Recipient</h3>
            <p className="text-sm text-gray-500">
              Create a new child profile to start their financial journey
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Recipient</DialogTitle>
          <DialogDescription>
            Create a profile for a child to start managing their allowance and
            financial learning.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter child's name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowance">Weekly Allowance Amount</Label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">
                $
              </span>
              <Input
                id="allowance"
                name="allowanceAmount"
                type="number"
                step="0.01"
                min="0"
                defaultValue="5.00"
                className="pl-8"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              This amount will be distributed across the four categories each
              week
            </p>
          </div>

          {error && (
            <div className="rounded bg-red-50 p-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Recipient'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
