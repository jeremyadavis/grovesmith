'use client';

import { useState } from 'react';
import { Heart, ShoppingBag, PiggyBank, TrendingUp } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { RecipientProfileHeader } from './recipient-profile-header';
import { GiveCategoryTab } from './tabs/give-category-tab';
import { SpendCategoryTab } from './tabs/spend-category-tab';
import { SaveCategoryTab } from './tabs/save-category-tab';
import { InvestCategoryTab } from './tabs/invest-category-tab';
import { RecipientSettings } from './recipient-settings';

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

interface RecipientNavInfo {
  id: string;
  name: string;
}

interface RecipientProfileClientProps {
  recipient: Recipient;
  allRecipients: RecipientNavInfo[];
  managerName: string;
  managerEmail?: string;
}

export function RecipientProfileClient({
  recipient,
  allRecipients,
  managerName,
  managerEmail,
}: RecipientProfileClientProps) {
  const [activeTab, setActiveTab] = useState('give');

  // Handle category selection from the header
  const handleCategorySelect = (category: string) => {
    setActiveTab(category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader managerName={managerName} managerEmail={managerEmail} />
      <RecipientProfileHeader
        recipient={recipient}
        allRecipients={allRecipients}
        onCategorySelect={handleCategorySelect}
        activeCategory={activeTab}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Full-width category header */}
          {activeTab === 'give' && (
            <div className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 p-8 text-white">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Give Category</h1>
                  <p className="mt-2 text-lg text-green-100">
                    Money set aside for charitable giving and meaningful causes
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spend' && (
            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Spend Category</h1>
                  <p className="mt-2 text-lg text-blue-100">
                    Money for immediate purchases and learning to handle cash
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'save' && (
            <div className="rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 p-8 text-white">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                  <PiggyBank className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Save Category</h1>
                  <p className="mt-2 text-lg text-purple-100">
                    Money saved toward specific goals and desired purchases
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invest' && (
            <div className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Invest Category</h1>
                  <p className="mt-2 text-lg text-orange-100">
                    Learn about investing and the power of compound growth
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content area with sidebar */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-4">
            {/* Main content area */}
            <div className="xl:col-span-3">
              {activeTab === 'give' && (
                <GiveCategoryTab recipient={recipient} />
              )}
              {activeTab === 'spend' && (
                <SpendCategoryTab recipient={recipient} />
              )}
              {activeTab === 'save' && (
                <SaveCategoryTab recipient={recipient} />
              )}
              {activeTab === 'invest' && (
                <InvestCategoryTab recipient={recipient} />
              )}
            </div>

            {/* Settings sidebar */}
            <div className="xl:col-span-1">
              <RecipientSettings
                recipient={recipient}
                activeCategory={activeTab}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
