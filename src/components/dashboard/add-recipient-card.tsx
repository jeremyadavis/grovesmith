'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
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

interface AddRecipientCardProps {
  onRecipientAdded?: () => void;
}

export function AddRecipientCard({ onRecipientAdded }: AddRecipientCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [allowanceAmount, setAllowanceAmount] = useState('5.00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('recipients')
        .insert({
          name: name.trim(),
          allowance_amount: parseFloat(allowanceAmount),
          manager_id: user.id,
        });

      if (error) throw error;

      setName('');
      setAllowanceAmount('5.00');
      setIsOpen(false);
      onRecipientAdded?.();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Add Recipient</h3>
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
            Create a profile for a child to start managing their allowance and financial learning.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter child's name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allowance">Weekly Allowance Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="allowance"
                type="number"
                step="0.01"
                min="0"
                value={allowanceAmount}
                onChange={(e) => setAllowanceAmount(e.target.value)}
                className="pl-8"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              This amount will be distributed across the four categories each week
            </p>
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
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