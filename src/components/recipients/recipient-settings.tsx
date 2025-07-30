import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Edit, Trash2, DollarSign } from 'lucide-react';

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

interface RecipientSettingsProps {
  recipient: Recipient;
}

export function RecipientSettings({ recipient }: RecipientSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Allowance</span>
          </CardTitle>
          <CardDescription>
            Distribute weekly allowance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" size="lg">
            Distribute ${recipient.allowance_amount.toFixed(2)}
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            Repeat Last Distribution
          </Button>
        </CardContent>
      </Card>

      {/* Recipient Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </CardTitle>
          <CardDescription>
            Manage {recipient.name}&apos;s profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Name</span>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">{recipient.name}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Weekly Allowance</span>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              ${recipient.allowance_amount.toFixed(2)}
            </p>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" />
              Archive Recipient
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Category Summary</CardTitle>
          <CardDescription>
            Current balances across all categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Give</span>
              </div>
              <span className="text-sm font-semibold">
                ${recipient.categories.give.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Spend</span>
              </div>
              <span className="text-sm font-semibold">
                ${recipient.categories.spend.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Save</span>
              </div>
              <span className="text-sm font-semibold">
                ${recipient.categories.save.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Invest</span>
              </div>
              <span className="text-sm font-semibold">
                ${recipient.categories.invest.toFixed(2)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center font-semibold">
                <span>Total</span>
                <span>
                  ${Object.values(recipient.categories).reduce((sum, amount) => sum + amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}