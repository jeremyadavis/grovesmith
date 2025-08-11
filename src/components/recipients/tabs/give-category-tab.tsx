'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Plus } from 'lucide-react';
import { CharitableCauseCard } from '../charitable-cause-card';
import { AddCauseModal } from '../add-cause-modal';
import { GiveBalanceSummary } from '../give-balance-summary';
import { getCharitableCauses, CharitableCause, getGiveCategoryBalance } from '@/lib/charitable-causes-actions';

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

interface GiveCategoryTabProps {
  recipient: Recipient;
}

export function GiveCategoryTab({ recipient }: GiveCategoryTabProps) {
  const [causes, setCauses] = useState<CharitableCause[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [unallocatedBalance, setUnallocatedBalance] = useState(0);

  const fetchCauses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedCauses, balanceInfo] = await Promise.all([
        getCharitableCauses(recipient.id),
        getGiveCategoryBalance(recipient.id)
      ]);
      setCauses(fetchedCauses);
      setUnallocatedBalance(balanceInfo.unallocated);
    } catch (err) {
      console.error('Error fetching causes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load causes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCauses();
  }, [recipient.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCauses = causes.filter(cause => !cause.is_completed);
  const completedCauses = causes.filter(cause => cause.is_completed);
  const canAddMore = activeCauses.length < 3;

  return (
    <div className="space-y-6">
      {/* Give Balance Summary */}
      <GiveBalanceSummary recipientId={recipient.id} recipientName={recipient.name} />

      {/* Charitable Causes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Charitable Causes</CardTitle>
              <CardDescription>
                Track up to 3 causes {recipient.name} wants to support
              </CardDescription>
            </div>
            {canAddMore && (
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Cause
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Loading causes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error: {error}</p>
              <Button 
                onClick={fetchCauses} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Causes */}
              {activeCauses.length > 0 && (
                <div className="space-y-4">
                  {activeCauses.map((cause) => (
                    <CharitableCauseCard
                      key={cause.id}
                      cause={cause}
                      availableBalance={recipient.categories.give}
                      unallocatedBalance={unallocatedBalance}
                      onUpdate={fetchCauses}
                    />
                  ))}
                </div>
              )}

              {/* Completed Causes */}
              {completedCauses.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Recently Completed</h4>
                  <div className="space-y-4">
                    {completedCauses.slice(0, 3).map((cause) => (
                      <CharitableCauseCard
                        key={cause.id}
                        cause={cause}
                        availableBalance={recipient.categories.give}
                        unallocatedBalance={unallocatedBalance}
                        onUpdate={fetchCauses}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {activeCauses.length === 0 && completedCauses.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">No causes added yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Help {recipient.name} find meaningful causes to support
                  </p>
                  <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    variant="outline" 
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Cause
                  </Button>
                </div>
              )}

              {/* Limit Message */}
              {!canAddMore && activeCauses.length >= 3 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <p>Maximum of 3 active causes. Complete one to add another.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Cause Modal */}
      <AddCauseModal
        recipientId={recipient.id}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchCauses}
      />
    </div>
  );
}