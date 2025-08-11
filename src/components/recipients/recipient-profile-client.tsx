'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
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

export function RecipientProfileClient({ recipient, allRecipients, managerName, managerEmail }: RecipientProfileClientProps) {
  const [activeTab, setActiveTab] = useState("give");

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
        {activeTab === "give" ? (
          /* Give category: Full-width header with traditional sidebar below */
          <div className="space-y-8">
            {/* Full-width category header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-8 text-white">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Give Category</h1>
                  <p className="text-green-100 mt-2 text-lg">
                    Money set aside for charitable giving and meaningful causes
                  </p>
                </div>
              </div>
            </div>
            
            {/* Content area with sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main content area */}
              <div className="xl:col-span-3">
                <GiveCategoryTab recipient={recipient} />
              </div>
              
              {/* Settings sidebar */}
              <div className="xl:col-span-1">
                <RecipientSettings recipient={recipient} activeCategory={activeTab} />
              </div>
            </div>
          </div>
        ) : (
          /* Other categories: Traditional sidebar layout */
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main content area */}
            <div className="xl:col-span-3">
              <div className="space-y-6">
                {activeTab === "spend" && <SpendCategoryTab recipient={recipient} />}
                {activeTab === "save" && <SaveCategoryTab recipient={recipient} />}
                {activeTab === "invest" && <InvestCategoryTab recipient={recipient} />}
              </div>
            </div>
            
            {/* Settings sidebar */}
            <div className="xl:col-span-1">
              <RecipientSettings recipient={recipient} activeCategory={activeTab} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}