import { MaterialIcons } from '@expo/vector-icons';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'cosmic';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tier: AchievementTier;
  tierColor: string;
  tierBg: string;
  coinReward: number;
  type: 'level' | 'words' | 'streak' | 'coins' | 'boss';
  target: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_flight',
    title: 'First Flight',
    description: 'Reached Level 1',
    icon: 'flight-takeoff',
    tier: 'bronze',
    tierColor: '#CD7F32',
    tierBg: 'rgba(205, 127, 50, 0.15)',
    coinReward: 50,
    type: 'level',
    target: 1,
  },
  {
    id: 'word_speller',
    title: 'Word Speller',
    description: 'Solve 10 words',
    icon: 'spellcheck',
    tier: 'bronze',
    tierColor: '#CD7F32',
    tierBg: 'rgba(205, 127, 50, 0.15)',
    coinReward: 40,
    type: 'words',
    target: 10,
  },
  {
    id: 'combo_champ',
    title: '3x Combo Spark',
    description: 'Solve 3 words in a row',
    icon: 'local-fire-department',
    tier: 'bronze',
    tierColor: '#CD7F32',
    tierBg: 'rgba(205, 127, 50, 0.15)',
    coinReward: 50,
    type: 'streak',
    target: 3,
  },
  {
    id: 'cave_explorer',
    title: 'Cave Adventurer',
    description: 'Reached Level 3',
    icon: 'explore',
    tier: 'silver',
    tierColor: '#C0C0C0',
    tierBg: 'rgba(192, 192, 192, 0.15)',
    coinReward: 60,
    type: 'level',
    target: 3,
  },
  {
    id: 'word_explorer',
    title: 'Word Explorer',
    description: 'Solve 25 words',
    icon: 'menu-book',
    tier: 'silver',
    tierColor: '#C0C0C0',
    tierBg: 'rgba(192, 192, 192, 0.15)',
    coinReward: 75,
    type: 'words',
    target: 25,
  },
  {
    id: 'streak_master',
    title: '6x Blazing Streak',
    description: 'Solve 6 words in a row',
    icon: 'whatshot',
    tier: 'silver',
    tierColor: '#C0C0C0',
    tierBg: 'rgba(192, 192, 192, 0.15)',
    coinReward: 80,
    type: 'streak',
    target: 6,
  },
  {
    id: 'neon_challenger',
    title: 'Neon Challenger',
    description: 'Reached Level 5',
    icon: 'auto-awesome',
    tier: 'gold',
    tierColor: '#FFD700',
    tierBg: 'rgba(255, 215, 0, 0.15)',
    coinReward: 100,
    type: 'level',
    target: 5,
  },
  {
    id: 'lexicon_master',
    title: 'Lexicon Master',
    description: 'Solve 50 words',
    icon: 'psychology',
    tier: 'gold',
    tierColor: '#FFD700',
    tierBg: 'rgba(255, 215, 0, 0.15)',
    coinReward: 120,
    type: 'words',
    target: 50,
  },
  {
    id: 'treasure_hunter',
    title: 'Treasure Hunter',
    description: 'Collect 750 coins',
    icon: 'toll',
    tier: 'gold',
    tierColor: '#FFD700',
    tierBg: 'rgba(255, 215, 0, 0.15)',
    coinReward: 80,
    type: 'coins',
    target: 750,
  },
  {
    id: 'boss_slayer',
    title: 'Cosmic Legend',
    description: 'Defeat the Level 8 boss',
    icon: 'military-tech',
    tier: 'cosmic',
    tierColor: '#06B6D4',
    tierBg: 'rgba(6, 182, 212, 0.15)',
    coinReward: 200,
    type: 'boss',
    target: 8,
  },
];

export function computeAchievementProgress(
  achievement: Achievement,
  state?: {
    currentLevel?: number;
    playedWords?: string[];
    highestStreak?: number;
    streak?: number;
    coins?: number;
    gameCompleted?: boolean;
  }
): { current: number; target: number; percent: number; isCompleted: boolean } {
  const target = Math.max(1, achievement?.target || 1);
  const currentLvl = Math.max(1, state?.currentLevel || 1);
  const played = Array.isArray(state?.playedWords) ? state.playedWords : [];
  const currStreak = Math.max(0, state?.streak || 0);
  const maxStreak = Math.max(0, state?.highestStreak || 0);
  const userCoins = Math.max(0, state?.coins || 0);
  const isGameComplete = Boolean(state?.gameCompleted);

  let current = 0;
  switch (achievement?.type) {
    case 'level':
      current = currentLvl;
      break;
    case 'words':
      current = played.length;
      break;
    case 'streak':
      current = Math.max(currStreak, maxStreak);
      break;
    case 'coins':
      current = userCoins;
      break;
    case 'boss':
      current = isGameComplete ? 8 : currentLvl >= 8 ? 7 : currentLvl;
      break;
    default:
      current = 0;
  }

  const safeCurrent = Math.max(0, Math.min(current, target));
  const rawPercent = Math.floor((safeCurrent / target) * 100);
  const percent = Number.isFinite(rawPercent) ? Math.min(100, Math.max(0, rawPercent)) : 0;
  const isCompleted = current >= target || (achievement?.type === 'boss' && isGameComplete);

  return {
    current: safeCurrent,
    target,
    percent,
    isCompleted,
  };
}
