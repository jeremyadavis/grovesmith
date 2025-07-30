'use client';

import { ArrowLeft, ArrowRight, Gift, ChefHat, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getRecipientTheme } from '@/lib/profile-themes';

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

interface RecipientProfileHeaderProps {
  recipient: Recipient;
  allRecipients: RecipientNavInfo[];
  onCategorySelect?: (category: string) => void;
  activeCategory?: string;
}

export function RecipientProfileHeader({ recipient, allRecipients, onCategorySelect, activeCategory = "give" }: RecipientProfileHeaderProps) {
  const router = useRouter();
  
  // Get the theme for this recipient
  const theme = getRecipientTheme(recipient.id);
  
  // Mock trophies for the carousel
  const trophies = [
    { icon: Gift, color: 'text-orange-500', bgColor: 'bg-yellow-100' },
    { icon: ChefHat, color: 'text-gray-400', bgColor: 'bg-gray-100' },
    { icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
  ];

  // Navigation logic with circular navigation
  const currentIndex = allRecipients.findIndex(r => r.id === recipient.id);

  const handlePreviousRecipient = () => {
    if (allRecipients.length === 0) return;
    
    // Wrap around: if at first recipient, go to last
    const previousIndex = currentIndex === 0 ? allRecipients.length - 1 : currentIndex - 1;
    const previousRecipient = allRecipients[previousIndex];
    router.push(`/recipients/${previousRecipient.id}`);
  };

  const handleNextRecipient = () => {
    if (allRecipients.length === 0) return;
    
    // Wrap around: if at last recipient, go to first
    const nextIndex = currentIndex === allRecipients.length - 1 ? 0 : currentIndex + 1;
    const nextRecipient = allRecipients[nextIndex];
    router.push(`/recipients/${nextRecipient.id}`);
  };

  return (
    <div className={`bg-gradient-to-br ${theme.gradient}`}>
      {/* Header section with navigation and avatar */}
      <div className="relative px-6 py-8">
        {/* Navigation arrows - always visible */}
        <button 
          onClick={handlePreviousRecipient}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 transition-colors text-gray-600 hover:text-gray-800 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <button 
          onClick={handleNextRecipient}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 transition-colors text-gray-600 hover:text-gray-800 cursor-pointer"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Centered content */}
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar */}
          <div className={`w-24 h-24 ${theme.avatarBg} backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-white/30`}>
            <span className={`text-2xl font-semibold ${theme.textColor}`}>
              {recipient.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Name */}
          <h1 className={`text-3xl font-bold ${theme.textColor}`}>
            {recipient.name}
          </h1>

          {/* Allowance */}
          <p className={`text-lg ${theme.textColor === 'text-gray-800' ? 'text-gray-600' : 'text-gray-700'}`}>
            $ {recipient.allowance_amount.toFixed(2)} allowance
          </p>

          {/* Trophy carousel */}
          <div className="flex space-x-4 mt-6">
            {trophies.map((trophy, index) => (
              <div key={index} className={`w-12 h-12 ${trophy.bgColor} rounded-full flex items-center justify-center`}>
                <trophy.icon className={`h-6 w-6 ${trophy.color}`} />
              </div>
            ))}
          </div>

          {/* Recipient navigation dots */}
          {allRecipients.length > 1 && (
            <div className="flex space-x-2 mt-4">
              {allRecipients.map((navRecipient, index) => (
                <button
                  key={navRecipient.id}
                  onClick={() => router.push(`/recipients/${navRecipient.id}`)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-gray-800' : 'bg-gray-400'
                  }`}
                  title={navRecipient.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories section */}
      <div className="bg-white">
        <div className="grid grid-cols-4 py-6">
          {/* Give */}
          <button 
            onClick={() => onCategorySelect?.('give')}
            className={`flex flex-col items-center space-y-2 p-4 transition-colors ${
              activeCategory === 'give' ? 'bg-green-50' : 'hover:bg-gray-50'
            }`}
          >
            <Gift className="h-6 w-6 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Give</span>
            <span className="text-2xl font-bold text-green-500">
              ${recipient.categories.give.toFixed(2)}
            </span>
          </button>

          {/* Spend */}
          <button 
            onClick={() => onCategorySelect?.('spend')}
            className={`flex flex-col items-center space-y-2 p-4 transition-colors ${
              activeCategory === 'spend' ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="h-6 w-6 flex items-center justify-center">
              <div className="w-5 h-4 border-2 border-gray-400 rounded-sm relative">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border-t-2 border-l-2 border-r-2 border-gray-400 rounded-t-sm"></div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600">Spend</span>
            <span className="text-2xl font-bold text-gray-600">
              ${recipient.categories.spend.toFixed(2)}
            </span>
          </button>

          {/* Save */}
          <button 
            onClick={() => onCategorySelect?.('save')}
            className={`flex flex-col items-center space-y-2 p-4 transition-colors ${
              activeCategory === 'save' ? 'bg-purple-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="h-6 w-6 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-gray-400 rounded-sm relative">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600">Save</span>
            <span className="text-2xl font-bold text-gray-600">
              ${recipient.categories.save.toFixed(2)}
            </span>
          </button>

          {/* Invest */}
          <button 
            onClick={() => onCategorySelect?.('invest')}
            className={`flex flex-col items-center space-y-2 p-4 transition-colors ${
              activeCategory === 'invest' ? 'bg-orange-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="h-6 w-6 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600">Invest</span>
            <span className="text-2xl font-bold text-gray-600">
              ${recipient.categories.invest.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}