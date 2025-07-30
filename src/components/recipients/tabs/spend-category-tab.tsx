import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus, TrendingUp } from 'lucide-react';

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

interface SpendCategoryTabProps {
  recipient: Recipient;
}

export function SpendCategoryTab({ recipient }: SpendCategoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-700">
            <ShoppingBag className="h-5 w-5" />
            <span>Spend Category</span>
          </CardTitle>
          <CardDescription>
            Money for immediate purchases and learning to handle cash
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-700">
                ${recipient.categories.spend.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total contributed (lifetime)</p>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Money
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spending Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">This Year</p>
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">All Time</p>
              <p className="text-2xl font-bold text-gray-900">
                ${recipient.categories.spend.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Reflection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Spending Reflection</span>
          </CardTitle>
          <CardDescription>
            Help {recipient.name} understand their spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Spending insights will appear here as {recipient.name} uses their spend money</p>
          </div>
        </CardContent>
      </Card>

      {/* Cash Management Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Management Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Practice counting money before going to the store
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Learn to check receipts and count change
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Think before buying: &quot;Do I really want this?&quot;
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}