import { Trophy, Award, Target, Star, DollarSign, Heart, PiggyBank, TrendingUp } from 'lucide-react';
import { Trophy as TrophyComponent } from '@/components/ui/trophy';

interface TrophyData {
  id: string;
  icon: typeof Trophy;
  title: string;
  description: string;
  color: string;
  earned: boolean;
  category?: 'give' | 'spend' | 'save' | 'invest' | 'general';
}

interface TrophySystemProps {
  recipientId: string;
  categories: {
    give: number;
    spend: number;
    save: number;
    invest: number;
  };
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  className?: string;
}

export function TrophySystem({ 
  categories, 
  size = "md", 
  maxDisplay = 4,
  className 
}: TrophySystemProps) {
  // Define available trophies based on achievements
  const availableTrophies: TrophyData[] = [
    {
      id: 'first-saver',
      icon: PiggyBank,
      title: 'First Saver',
      description: 'Saved your first dollar',
      color: 'text-purple-500',
      earned: categories.save > 0,
      category: 'save'
    },
    {
      id: 'generous-giver', 
      icon: Heart,
      title: 'Generous Giver',
      description: 'Made your first donation',
      color: 'text-green-500',
      earned: categories.give > 0,
      category: 'give'
    },
    {
      id: 'smart-investor',
      icon: TrendingUp,
      title: 'Smart Investor',
      description: 'Made your first investment',
      color: 'text-orange-500',
      earned: categories.invest > 0,
      category: 'invest'
    },
    {
      id: 'wise-spender',
      icon: DollarSign,
      title: 'Wise Spender',
      description: 'Made your first purchase',
      color: 'text-blue-500',
      earned: categories.spend > 0,
      category: 'spend'
    },
    {
      id: 'big-saver',
      icon: Trophy,
      title: 'Big Saver',
      description: 'Saved $50 or more',
      color: 'text-yellow-500',
      earned: categories.save >= 50,
      category: 'save'
    },
    {
      id: 'champion-giver',
      icon: Award,
      title: 'Champion Giver',
      description: 'Given $25 or more',
      color: 'text-green-600',
      earned: categories.give >= 25,
      category: 'give'
    },
    {
      id: 'goal-achiever',
      icon: Target,
      title: 'Goal Achiever',
      description: 'Reached all category goals',
      color: 'text-indigo-500',
      earned: Object.values(categories).every(amount => amount >= 10),
      category: 'general'
    }
  ];

  // Sort trophies: earned first, then by category
  const sortedTrophies = availableTrophies.sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return 0;
  });

  // Take only the specified number to display, plus one "next goal" if there are unearned trophies
  const displayTrophies = sortedTrophies.slice(0, maxDisplay);
  const hasUnearned = sortedTrophies.some(trophy => !trophy.earned);
  const nextTrophy = sortedTrophies.find(trophy => !trophy.earned);

  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-white/80 mb-3">Achievements</h3>
      <div className="flex space-x-3">
        {displayTrophies.map((trophy) => (
          <TrophyComponent
            key={trophy.id}
            icon={trophy.icon}
            title={trophy.title}
            color={trophy.color}
            earned={trophy.earned}
            size={size}
          />
        ))}
        {hasUnearned && nextTrophy && displayTrophies.length < maxDisplay && (
          <TrophyComponent
            icon={Star}
            title="Next Goal"
            color="text-white/40"
            earned={false}
            size={size}
          />
        )}
      </div>
    </div>
  );
}