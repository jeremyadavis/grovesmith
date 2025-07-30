'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GiveCategoryTab } from './tabs/give-category-tab';
import { SpendCategoryTab } from './tabs/spend-category-tab';
import { SaveCategoryTab } from './tabs/save-category-tab';
import { InvestCategoryTab } from './tabs/invest-category-tab';

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

interface CategoryTabsProps {
  recipient: Recipient;
}

export function CategoryTabs({ recipient }: CategoryTabsProps) {
  return (
    <Tabs defaultValue="give" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="give" className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Give</span>
        </TabsTrigger>
        <TabsTrigger value="spend" className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Spend</span>
        </TabsTrigger>
        <TabsTrigger value="save" className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span>Save</span>
        </TabsTrigger>
        <TabsTrigger value="invest" className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>Invest</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="give" className="space-y-6">
          <GiveCategoryTab recipient={recipient} />
        </TabsContent>

        <TabsContent value="spend" className="space-y-6">
          <SpendCategoryTab recipient={recipient} />
        </TabsContent>

        <TabsContent value="save" className="space-y-6">
          <SaveCategoryTab recipient={recipient} />
        </TabsContent>

        <TabsContent value="invest" className="space-y-6">
          <InvestCategoryTab recipient={recipient} />
        </TabsContent>
      </div>
    </Tabs>
  );
}