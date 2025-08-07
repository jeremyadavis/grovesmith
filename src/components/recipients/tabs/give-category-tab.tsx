import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Plus } from 'lucide-react';
import { CategoryTransactionHistory } from '../category-transaction-history';

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
  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <Heart className="h-5 w-5" />
            <span>Give Category</span>
          </CardTitle>
          <CardDescription>
            Money set aside for charitable giving and meaningful causes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-700">
                ${recipient.categories.give.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Available to give</p>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Money
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charitable Causes */}
      <Card>
        <CardHeader>
          <CardTitle>Charitable Causes</CardTitle>
          <CardDescription>
            Track up to 3 causes {recipient.name} wants to support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder for causes - will be populated later */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">No causes added yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Help {recipient.name} find meaningful causes to support
              </p>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Cause
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Give History */}
      <CategoryTransactionHistory 
        recipientId={recipient.id}
        categoryType="give"
        title="Give History"
        description="Track of all charitable contributions and allowance additions"
      />
    </div>
  );
}