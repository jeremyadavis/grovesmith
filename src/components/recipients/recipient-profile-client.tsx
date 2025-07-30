'use client';

import { useState } from 'react';
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
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main content area */}
          <div className="xl:col-span-3">
            <div className="space-y-6">
              {activeTab === "give" && <GiveCategoryTab recipient={recipient} />}
              {activeTab === "spend" && <SpendCategoryTab recipient={recipient} />}
              {activeTab === "save" && <SaveCategoryTab recipient={recipient} />}
              {activeTab === "invest" && <InvestCategoryTab recipient={recipient} />}
            </div>
          </div>
          
          {/* Settings sidebar */}
          <div className="xl:col-span-1">
            <RecipientSettings recipient={recipient} />
          </div>
        </div>
      </main>
    </div>
  );
}