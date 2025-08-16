import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Plus, DollarSign, Calendar, Target } from 'lucide-react';

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

interface InvestCategoryTabProps {
  recipient: Recipient;
}

export function InvestCategoryTab({ recipient }: InvestCategoryTabProps) {
  const dividendRate = 0.05; // 5% default rate
  const nextDividend = recipient.categories.invest * dividendRate;
  const thresholdAmount = 50.0; // Default threshold

  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-700">
            <TrendingUp className="h-5 w-5" />
            <span>Invest Category</span>
          </CardTitle>
          <CardDescription>
            Learn about investing and the power of compound growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-700">
                ${recipient.categories.invest.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Investment balance</p>
            </div>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Money
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Investment Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <DollarSign className="mx-auto mb-2 h-6 w-6 text-orange-500" />
              <p className="text-sm font-medium text-gray-600">Dividend Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {(dividendRate * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Calendar className="mx-auto mb-2 h-6 w-6 text-orange-500" />
              <p className="text-sm font-medium text-gray-600">Next Dividend</p>
              <p className="text-xl font-bold text-gray-900">
                ${nextDividend.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-orange-500" />
              <p className="text-sm font-medium text-gray-600">
                Total Dividends
              </p>
              <p className="text-xl font-bold text-gray-900">$0.00</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Target className="mx-auto mb-2 h-6 w-6 text-orange-500" />
              <p className="text-sm font-medium text-gray-600">
                Until Real Investing
              </p>
              <p className="text-xl font-bold text-gray-900">
                ${Math.max(0, thresholdAmount - 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dividend Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Dividend Schedule</span>
          </CardTitle>
          <CardDescription>
            Dividends are paid twice monthly on the 1st and 15th
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div>
                <p className="font-medium">Next Payment: 1st of next month</p>
                <p className="text-sm text-gray-600">
                  Expected dividend: ${nextDividend.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Based on current balance
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Education */}
      <Card>
        <CardHeader>
          <CardTitle>How Investing Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-orange-50 p-4">
              <h4 className="mb-2 font-semibold text-orange-700">
                Compound Growth
              </h4>
              <p className="text-sm text-gray-700">
                When you invest money, it grows over time. The more you invest
                and the longer you leave it, the more it can grow through the
                power of compound interest.
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-blue-700">
                Dividend Simulation
              </h4>
              <p className="text-sm text-gray-700">
                Every dollar you invest earns a 5¢ dividend twice per month.
                This helps you see how investments can grow over time.
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="mb-2 font-semibold text-green-700">
                Real Investing
              </h4>
              <p className="text-sm text-gray-700">
                When your dividends reach $50, you can move to real stock
                investing with a UGMA/UTMA account!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
