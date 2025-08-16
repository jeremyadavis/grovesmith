'use client';

import {
  ArrowLeft,
  ArrowRight,
  Gift,
  ChefHat,
  Trophy,
  Edit3,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { getRecipientTheme } from '@/lib/profile-themes';
import { DistributeFundsModal } from './distribute-funds-modal';
import { UndistributedFundsCalculator } from './undistributed-funds-calculator';
import { EditRecipientModal } from './edit-recipient-modal';

interface Recipient {
  id: string;
  name: string;
  allowance_amount: number;
  avatar_url?: string;
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

export function RecipientProfileHeader({
  recipient,
  allRecipients,
  onCategorySelect,
  activeCategory = 'give',
}: RecipientProfileHeaderProps) {
  const router = useRouter();
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUndistributedAmount, setCurrentUndistributedAmount] =
    useState(0);

  // Get the theme for this recipient
  const theme = getRecipientTheme(recipient.id);

  // Mock trophies for the carousel
  const trophies = [
    { icon: Gift, color: 'text-orange-500', bgColor: 'bg-yellow-100' },
    { icon: ChefHat, color: 'text-gray-400', bgColor: 'bg-gray-100' },
    { icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
  ];

  // Navigation logic with circular navigation
  const currentIndex = allRecipients.findIndex((r) => r.id === recipient.id);

  const handlePreviousRecipient = () => {
    if (allRecipients.length === 0) return;

    // Wrap around: if at first recipient, go to last
    const previousIndex =
      currentIndex === 0 ? allRecipients.length - 1 : currentIndex - 1;
    const previousRecipient = allRecipients[previousIndex];
    router.push(`/recipients/${previousRecipient.id}`);
  };

  const handleNextRecipient = () => {
    if (allRecipients.length === 0) return;

    // Wrap around: if at last recipient, go to first
    const nextIndex =
      currentIndex === allRecipients.length - 1 ? 0 : currentIndex + 1;
    const nextRecipient = allRecipients[nextIndex];
    router.push(`/recipients/${nextRecipient.id}`);
  };

  const handleDistribute = async (
    distribution: { give: number; spend: number; save: number; invest: number },
    date: Date
  ) => {
    try {
      const { distributeAllowance } = await import(
        '@/lib/distribution-actions'
      );

      await distributeAllowance({
        recipientId: recipient.id,
        distributionDate: date,
        giveAmount: distribution.give,
        spendAmount: distribution.spend,
        saveAmount: distribution.save,
        investAmount: distribution.invest,
        notes: `Distribution of $${(distribution.give + distribution.spend + distribution.save + distribution.invest).toFixed(2)}`,
      });

      // Refresh the page to show updated balances
      window.location.reload();
    } catch (error) {
      console.error('Distribution failed:', error);
      alert('Failed to distribute funds. Please try again.');
    }
  };

  const handleEditSuccess = () => {
    // Refresh the page to show updated recipient details
    window.location.reload();
  };

  return (
    <div className={`bg-gradient-to-br ${theme.gradient}`}>
      {/* Header section with navigation and avatar */}
      <div className="relative px-6 py-8">
        {/* Navigation arrows - always visible */}
        <button
          onClick={handlePreviousRecipient}
          className="absolute top-1/2 left-4 -translate-y-1/2 transform cursor-pointer p-2 text-gray-600 transition-colors hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <button
          onClick={handleNextRecipient}
          className="absolute top-1/2 right-4 -translate-y-1/2 transform cursor-pointer p-2 text-gray-600 transition-colors hover:text-gray-800"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Centered content */}
        <div className="flex flex-col items-center space-y-4">
          {/* Interactive Avatar and Name Container */}
          <div
            className="group flex cursor-pointer flex-col items-center space-y-4 rounded-xl p-4 transition-all duration-200 hover:scale-105 hover:bg-black/10 hover:shadow-lg hover:backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(true)}
          >
            {/* Avatar */}
            <div
              className={`h-24 w-24 ${theme.avatarBg} relative flex items-center justify-center rounded-full border-2 border-white/30 shadow-lg backdrop-blur-sm transition-colors group-hover:border-white/50`}
            >
              {recipient.avatar_url ? (
                <Image
                  src={recipient.avatar_url}
                  alt={recipient.name}
                  width={96}
                  height={96}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className={`text-2xl font-semibold ${theme.textColor}`}>
                  {recipient.name.charAt(0).toUpperCase()}
                </span>
              )}

              {/* Edit icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                <Edit3 className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Name */}
            <h1
              className={`text-3xl font-bold ${theme.textColor} group-hover:text-opacity-90 transition-colors`}
            >
              {recipient.name}
            </h1>
          </div>

          {/* Undistributed Funds */}
          <UndistributedFundsCalculator recipientId={recipient.id}>
            {({ undistributedAmount, weeksPending, isLoading, error }) => {
              // Store current amount for modal - but avoid calling setState in render
              if (
                !isLoading &&
                !error &&
                undistributedAmount !== currentUndistributedAmount
              ) {
                // Use setTimeout to defer the state update to avoid setState-in-render warning
                setTimeout(
                  () => setCurrentUndistributedAmount(undistributedAmount),
                  0
                );
              }

              return (
                <div className="flex flex-col items-center space-y-2">
                  {isLoading ? (
                    <p
                      className={`text-lg ${theme.textColor === 'text-gray-800' ? 'text-gray-600' : 'text-gray-700'}`}
                    >
                      Calculating...
                    </p>
                  ) : error ? (
                    <p
                      className={`text-lg ${theme.textColor === 'text-gray-800' ? 'text-red-600' : 'text-red-700'}`}
                    >
                      Error loading funds
                    </p>
                  ) : (
                    <>
                      <p
                        className={`text-lg ${theme.textColor === 'text-gray-800' ? 'text-gray-600' : 'text-gray-700'}`}
                      >
                        $ {undistributedAmount.toFixed(2)} to distribute
                      </p>
                      <p
                        className={`text-sm ${theme.textColor === 'text-gray-800' ? 'text-gray-500' : 'text-gray-600'}`}
                      >
                        {weeksPending} weeks pending
                      </p>
                    </>
                  )}
                  <button
                    onClick={() => setIsDistributeModalOpen(true)}
                    className="rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-gray-800 backdrop-blur-sm transition-colors hover:bg-white/30"
                  >
                    Distribute Funds
                  </button>
                </div>
              );
            }}
          </UndistributedFundsCalculator>

          {/* Trophy carousel */}
          <div className="mt-6 flex space-x-4">
            {trophies.map((trophy, index) => (
              <div
                key={index}
                className={`h-12 w-12 ${trophy.bgColor} flex items-center justify-center rounded-full`}
              >
                <trophy.icon className={`h-6 w-6 ${trophy.color}`} />
              </div>
            ))}
          </div>

          {/* Recipient navigation dots */}
          {allRecipients.length > 1 && (
            <div className="mt-4 flex space-x-2">
              {allRecipients.map((navRecipient, index) => (
                <button
                  key={navRecipient.id}
                  onClick={() => router.push(`/recipients/${navRecipient.id}`)}
                  className={`h-2 w-2 rounded-full transition-colors ${
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
            <div className="flex h-6 w-6 items-center justify-center">
              <div className="relative h-4 w-5 rounded-sm border-2 border-gray-400">
                <div className="absolute -top-1 left-1/2 h-1 w-2 -translate-x-1/2 transform rounded-t-sm border-t-2 border-r-2 border-l-2 border-gray-400"></div>
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
            <div className="flex h-6 w-6 items-center justify-center">
              <div className="relative h-5 w-5 rounded-sm border-2 border-gray-400">
                <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gray-400"></div>
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
            <div className="flex h-6 w-6 items-center justify-center">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600">Invest</span>
            <span className="text-2xl font-bold text-gray-600">
              ${recipient.categories.invest.toFixed(2)}
            </span>
          </button>
        </div>
      </div>

      {/* Distribution Modal */}
      <DistributeFundsModal
        recipient={recipient}
        isOpen={isDistributeModalOpen}
        onClose={() => setIsDistributeModalOpen(false)}
        onDistribute={handleDistribute}
        undistributedAmount={currentUndistributedAmount}
      />

      {/* Edit Recipient Modal */}
      <EditRecipientModal
        recipient={recipient}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
