// Profile theme system for recipients
// This will eventually be expanded to include customizable backgrounds, borders, and trophy arrangements

export interface ProfileTheme {
  id: string;
  name: string;
  gradient: string;
  avatarBg: string;
  textColor: string;
  unlocked?: boolean;
}

// Predefined theme options that kids can unlock
export const AVAILABLE_THEMES: ProfileTheme[] = [
  {
    id: 'sunset',
    name: 'Sunset Dreams',
    gradient: 'from-pink-200 to-purple-200',
    avatarBg: 'bg-white/20',
    textColor: 'text-gray-800',
    unlocked: true, // Default theme
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    gradient: 'from-blue-200 to-cyan-200',
    avatarBg: 'bg-white/20',
    textColor: 'text-gray-800',
  },
  {
    id: 'forest',
    name: 'Forest Adventure',
    gradient: 'from-green-200 to-emerald-200',
    avatarBg: 'bg-white/20',
    textColor: 'text-gray-800',
  },
  {
    id: 'sunshine',
    name: 'Sunshine Valley',
    gradient: 'from-yellow-200 to-orange-200',
    avatarBg: 'bg-white/20',
    textColor: 'text-gray-800',
  },
  {
    id: 'lavender',
    name: 'Lavender Fields',
    gradient: 'from-purple-200 to-indigo-200',
    avatarBg: 'bg-white/20',
    textColor: 'text-gray-800',
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    gradient: 'from-rose-200 to-pink-200',
    avatarBg: 'bg-white/20',
    textColor: 'text-gray-800',
  },
  {
    id: 'mint',
    name: 'Mint Chocolate',
    gradient: 'from-teal-200 to-green-200',
    avatarBg: 'bg-white/20',
    textColor: 'text-gray-800',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Purple',
    gradient: 'from-violet-300 to-purple-300',
    avatarBg: 'bg-white/20',
    textColor: 'text-gray-800',
  },
  {
    id: 'peach',
    name: 'Peach Sorbet',
    gradient: 'from-orange-200 to-rose-200',
    avatarBg: 'bg-white/20',
    textColor: 'text-gray-800',
  },
  {
    id: 'aurora',
    name: 'Aurora Sky',
    gradient: 'from-cyan-200 via-purple-200 to-pink-200',
    avatarBg: 'bg-white/20',
    textColor: 'text-gray-800',
  },
];

// Generate a deterministic theme for a recipient based on their ID
export function getRecipientTheme(recipientId: string): ProfileTheme {
  // Create a simple hash from the recipient ID
  let hash = 0;
  for (let i = 0; i < recipientId.length; i++) {
    const char = recipientId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to select a theme (ensure it's always positive)
  const themeIndex = Math.abs(hash) % AVAILABLE_THEMES.length;
  return AVAILABLE_THEMES[themeIndex];
}

// Get theme by ID (for when recipients can choose their own themes)
export function getThemeById(themeId: string): ProfileTheme | undefined {
  return AVAILABLE_THEMES.find((theme) => theme.id === themeId);
}

// Check if a recipient has unlocked a specific theme (placeholder for future logic)
export function hasUnlockedTheme(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _recipientId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _themeId: string
): boolean {
  // For now, everyone has access to all themes
  // Future implementation would check database for unlocked themes
  return true;
}

// Get all unlocked themes for a recipient (placeholder for future logic)
export function getUnlockedThemes(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _recipientId: string
): ProfileTheme[] {
  // For now, return first 3 themes as "unlocked"
  // Future implementation would fetch from database
  return AVAILABLE_THEMES.slice(0, 3);
}
