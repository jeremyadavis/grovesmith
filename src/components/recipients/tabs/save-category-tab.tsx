import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PiggyBank, Plus, Target, List } from 'lucide-react';

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

interface SaveCategoryTabProps {
  recipient: Recipient;
}

export function SaveCategoryTab({ recipient }: SaveCategoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-700">
            <PiggyBank className="h-5 w-5" />
            <span>Save Category</span>
          </CardTitle>
          <CardDescription>
            Money saved toward specific goals and desired purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-700">
                ${recipient.categories.save.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total savings</p>
            </div>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Money
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Subcategories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Savings Categories</span>
          </CardTitle>
          <CardDescription>
            Organize savings by type (Clothes, Books, Toys, Games, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder for subcategories */}
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <Target className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <h3 className="mb-1 font-medium text-gray-900">
                No categories yet
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                Create categories to organize {recipient.name}&apos;s savings
                goals
              </p>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wishlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <List className="h-5 w-5" />
            <span>Wishlist</span>
          </CardTitle>
          <CardDescription>
            Items {recipient.name} wants to save for (up to 3 per category)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder for wishlist items */}
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <List className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <h3 className="mb-1 font-medium text-gray-900">
                Wishlist is empty
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                Add items {recipient.name} wants to save for
              </p>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Wishlist Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-purple-500"></div>
              <p className="text-sm text-gray-700">
                Set clear goals for what you want to buy
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-purple-500"></div>
              <p className="text-sm text-gray-700">
                Sometimes waiting helps you realize you don&apos;t want
                something as much
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-purple-500"></div>
              <p className="text-sm text-gray-700">
                Celebrate when you reach your savings goals!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
