import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLevelConfig, MAX_LEVEL } from '../config/levelConfig';
import { buildWordSetForLevelNumber } from '../data/levelWords';
import { getCategoryPool } from '../data/categoriesData';

export interface WordObj {
  word: string;
  description: string;
}

export interface Level {
  targetWords: WordObj[];
  levelName: string;
}

export const LEVEL_CLEAR_COIN_BONUS = 20;

export interface SfxSettings {
  click: boolean;
  correct: boolean;
  wrong: boolean;
  streak: boolean;
  hint: boolean;
  warning: boolean;
  levelComplete: boolean;
  coinReward: boolean;
}

interface GameState {
  coins: number;
  score: number;
  energy: number;
  hints: number;
  streakShields: number;
  chronoBoosters: number;
  streak: number;
  highestStreak: number;
  claimedAchievements: string[];
  /** Numeric progression through the campaign (1-8). */
  currentLevel: number;
  /** The active word set currently being played. */
  activeLevel: Level;
  /** The word position to resume when returning to the game board. */
  currentWordIndex: number;
  /** Cosmetic "realm" flavor picked on the category screen. */
  selectedCategoryId: string;
  /** True once the Level 8 boss word is cleared. */
  gameCompleted: boolean;
  /** The last solved word, shown on the success screen. */
  lastCompletedWord: WordObj | null;
  playedWords: string[];
  /** True once persisted state has been rehydrated from AsyncStorage. */
  hasHydrated: boolean;
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  addHints: (amount: number) => void;
  useHintCharge: () => boolean;
  addStreakShields: (amount: number) => void;
  useStreakShield: () => boolean;
  addChronoBoosters: (amount: number) => void;
  useChronoBooster: () => boolean;
  restoreCredits: (amount?: number) => void;
  addScore: (amount: number) => void;
  useEnergy: (amount?: number) => boolean;
  incrementStreak: () => number;
  resetStreak: () => void;
  claimAchievement: (achievementId: string, coinReward: number) => boolean;
  setLevel: (level: Level) => void;
  setCurrentWordIndex: (index: number) => void;
  markWordsAsPlayed: (words: string[]) => void;
  setSelectedCategoryId: (id: string) => void;
  /**
   * Jump directly to any level (1-8) with proper word pools and config for testing/QA.
   */
  jumpToLevel: (level: number, categoryId?: string) => void;
  /**
   * Moves progression to the next level and preloads its configuration.
   * No-op at MAX_LEVEL except for flagging game completion.
   */
  advanceLevel: () => void;
  /** Back to Level 1, keeping coins/score/energy. Used by "Play Again". */
  resetProgression: () => void;
  /** Full factory reset: Level 1, cleared history, default economy. */
  resetGame: () => void;
  setLastCompletedWord: (word: WordObj) => void;
  setIsMusicPlaying: (playing: boolean) => void;
  setSelectedMusicTrack: (index: number) => void;
  setMusicVolume: (vol: number) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setSfxVolume: (vol: number) => void;
  sfxEnabled: boolean;
  sfxVolume: number;
  sfxSettings: SfxSettings;
  toggleSfxSetting: (key: keyof SfxSettings) => void;
  isMusicPlaying: boolean;
  selectedMusicTrack: number;
  musicVolume: number;
}

function makeActiveLevel(level: number, categoryId: string, playedWords: string[]): Level {
  const config = getLevelConfig(level);
  const pool = getCategoryPool(categoryId);
  return {
    levelName: `${config.tier} · Level ${level}`,
    targetWords: buildWordSetForLevelNumber(level, pool, playedWords),
  };
}

const DEFAULT_ECONOMY = {
  coins: 500,
  score: 0,
  energy: 5,
  hints: 0,
  streakShields: 0,
  chronoBoosters: 0,
};

const ALLOWED_CATEGORIES = ['space', 'animals', 'food', 'sports', 'anything'];

function sanitizePositiveInt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const truncated = Math.floor(value);
    return truncated > 0 ? truncated : fallback;
  }
  return fallback;
}

function sanitizeNonNegativeInt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const truncated = Math.floor(value);
    return truncated >= 0 ? truncated : fallback;
  }
  return fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 500,
      score: 0,
      energy: 5,
      hints: 0,
      streakShields: 0,
      chronoBoosters: 0,
      streak: 0,
      highestStreak: 0,
      claimedAchievements: [],
      currentLevel: 1,
      activeLevel: makeActiveLevel(1, 'space', []),
      currentWordIndex: 0,
      selectedCategoryId: 'space',
      gameCompleted: false,
      lastCompletedWord: null,
      playedWords: [],
      hasHydrated: false,
      isMusicPlaying: true,
      selectedMusicTrack: 0,
      musicVolume: 1.0,
      sfxEnabled: true,
      sfxVolume: 1.0,
      sfxSettings: {
        click: true,
        correct: true,
        wrong: true,
        streak: true,
        hint: true,
        warning: true,
        levelComplete: true,
        coinReward: true,
      },
      spendCoins: (amount: number) => {
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
          return false;
        }
        const cost = Math.floor(amount);
        const { coins } = get();
        if (coins >= cost) {
          set({ coins: coins - cost });
          return true;
        }
        return false;
      },
      addCoins: (amount: number) => {
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
          return;
        }
        const gain = Math.floor(amount);
        set((state) => ({ coins: state.coins + gain }));
      },
      addHints: (amount: number) => {
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
          return;
        }
        const gain = Math.floor(amount);
        set((state) => ({ hints: state.hints + gain }));
      },
      useHintCharge: () => {
        const { hints } = get();
        if (hints > 0) {
          set({ hints: hints - 1 });
          return true;
        }
        return false;
      },
      addStreakShields: (amount: number) => {
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
          return;
        }
        const gain = Math.floor(amount);
        set((state) => ({ streakShields: state.streakShields + gain }));
      },
      useStreakShield: () => {
        const { streakShields } = get();
        if (streakShields > 0) {
          set({ streakShields: streakShields - 1 });
          return true;
        }
        return false;
      },
      addChronoBoosters: (amount: number) => {
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
          return;
        }
        const gain = Math.floor(amount);
        set((state) => ({ chronoBoosters: state.chronoBoosters + gain }));
      },
      useChronoBooster: () => {
        const { chronoBoosters } = get();
        if (chronoBoosters > 0) {
          set({ chronoBoosters: chronoBoosters - 1 });
          return true;
        }
        return false;
      },
      restoreCredits: (amount = 500) => {
        const sanitized = sanitizePositiveInt(amount, 500);
        set((state) => ({
          coins: state.coins < 50 ? 500 : state.coins + sanitized,
          energy: 5,
        }));
      },
      addScore: (amount: number) => {
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
          return;
        }
        const points = Math.floor(amount);
        set((state) => ({ score: state.score + points }));
      },
      useEnergy: (amount = 1) => {
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
          return false;
        }
        const cost = Math.floor(amount);
        const { energy } = get();
        if (energy >= cost) {
          set({ energy: Math.max(0, energy - cost) });
          return true;
        }
        return false;
      },
      incrementStreak: () => {
        const next = get().streak + 1;
        const currentHighest = get().highestStreak || 0;
        set({
          streak: next,
          highestStreak: Math.max(currentHighest, next),
        });
        return next;
      },
      resetStreak: () => {
        set({ streak: 0 });
      },
      claimAchievement: (achievementId: string, coinReward: number) => {
        const { claimedAchievements, coins } = get();
        const safeClaimed = Array.isArray(claimedAchievements) ? claimedAchievements : [];
        if (safeClaimed.includes(achievementId)) {
          return false;
        }
        const safeReward = sanitizeNonNegativeInt(coinReward, 0);
        const safeCoins = sanitizeNonNegativeInt(coins, 0);
        set({
          claimedAchievements: [...safeClaimed, achievementId],
          coins: safeCoins + safeReward,
        });
        return true;
      },
      setCurrentWordIndex: (index: number) => {
        if (!Number.isFinite(index)) return;
        set((state) => ({
          currentWordIndex: clamp(
            Math.floor(index),
            0,
            Math.max(0, state.activeLevel.targetWords.length - 1),
          ),
        }));
      },
      setLevel: (level: Level) => {
        if (level && Array.isArray(level.targetWords)) {
          set({ activeLevel: level, currentWordIndex: 0 });
        }
      },
      markWordsAsPlayed: (words: string[]) => {
        if (!Array.isArray(words)) return;
        const validWords = words.filter((w) => typeof w === 'string' && w.trim().length > 0);
        set((state) => {
          const newPlayed = [...new Set([...state.playedWords, ...validWords])];
          return { playedWords: newPlayed };
        });
      },
      setSelectedCategoryId: (id: string) => {
        const validId = typeof id === 'string' && ALLOWED_CATEGORIES.includes(id) ? id : 'space';
        set({ selectedCategoryId: validId });
      },
      jumpToLevel: (level: number, categoryId?: string) => {
        const state = get();
        const targetLvl = clamp(level, 1, MAX_LEVEL);
        const targetCategory = categoryId && ALLOWED_CATEGORIES.includes(categoryId) ? categoryId : state.selectedCategoryId;
        const pool = getCategoryPool(targetCategory);
        const words = buildWordSetForLevelNumber(targetLvl, pool, state.playedWords);
        set({
          currentLevel: targetLvl,
          currentWordIndex: 0,
          selectedCategoryId: targetCategory,
          gameCompleted: false,
          activeLevel: {
            levelName: `${getLevelConfig(targetLvl).tier} · Level ${targetLvl}`,
            targetWords: words,
          },
          playedWords: [...new Set([...state.playedWords, ...words.map((w) => w.word)])],
        });
      },
      advanceLevel: () => {
        const state = get();
        if (state.currentLevel >= MAX_LEVEL) {
          set({ gameCompleted: true });
          return;
        }
        const nextLevel = clamp(state.currentLevel + 1, 1, MAX_LEVEL);
        const pool = getCategoryPool(state.selectedCategoryId);
        const nextWords = buildWordSetForLevelNumber(nextLevel, pool, state.playedWords);

        set({
          currentLevel: nextLevel,
          currentWordIndex: 0,
          activeLevel: {
            levelName: `${getLevelConfig(nextLevel).tier} · Level ${nextLevel}`,
            targetWords: nextWords,
          },
          playedWords: [...new Set([...state.playedWords, ...nextWords.map((w) => w.word)])],
        });
      },
      resetProgression: () => {
        set((state) => ({
          currentLevel: 1,
          currentWordIndex: 0,
          gameCompleted: false,
          streak: 0,
          lastCompletedWord: null,
          activeLevel: makeActiveLevel(1, state.selectedCategoryId, state.playedWords),
        }));
      },
      resetGame: () => {
        const state = get();
        set({
          ...DEFAULT_ECONOMY,
           currentLevel: 1,
           currentWordIndex: 0,
           streak: 0,
           highestStreak: 0,
          claimedAchievements: [],
          gameCompleted: false,
          lastCompletedWord: null,
          playedWords: [],
          activeLevel: makeActiveLevel(1, state.selectedCategoryId, []),
        });
        useGameStore.persist.clearStorage();
      },
      setLastCompletedWord: (word: WordObj) => {
        if (word && typeof word.word === 'string') {
          set({ lastCompletedWord: word });
        }
      },
      setIsMusicPlaying: (playing: boolean) => {
        set({ isMusicPlaying: Boolean(playing) });
      },
      setSelectedMusicTrack: (index: number) => {
        if (typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < 3) {
          set({ selectedMusicTrack: index });
        }
      },
      setMusicVolume: (vol: number) => {
        const validVol = typeof vol === 'number' && Number.isFinite(vol) ? clamp(vol, 0, 1) : 1.0;
        set({ musicVolume: validVol });
      },
      setSfxEnabled: (enabled: boolean) => {
        set({ sfxEnabled: Boolean(enabled) });
      },
      setSfxVolume: (vol: number) => {
        const validVol = typeof vol === 'number' && Number.isFinite(vol) ? clamp(vol, 0, 1) : 1.0;
        set({ sfxVolume: validVol });
      },
      toggleSfxSetting: (key: keyof SfxSettings) => {
        set((state) => {
          if (state.sfxSettings && key in state.sfxSettings) {
            return {
              sfxSettings: { ...state.sfxSettings, [key]: !state.sfxSettings[key] },
            };
          }
          return state;
        });
      },
    }),
    {
      name: 'wordexplorer-game-state',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({
        coins: state.coins,
        score: state.score,
        energy: state.energy,
        hints: state.hints,
        streakShields: state.streakShields,
        chronoBoosters: state.chronoBoosters,
        highestStreak: state.highestStreak,
        claimedAchievements: state.claimedAchievements,
         currentLevel: state.currentLevel,
         currentWordIndex: state.currentWordIndex,
         activeLevel: state.activeLevel,
        selectedCategoryId: state.selectedCategoryId,
        gameCompleted: state.gameCompleted,
        lastCompletedWord: state.lastCompletedWord,
        playedWords: state.playedWords,
        isMusicPlaying: state.isMusicPlaying,
        selectedMusicTrack: state.selectedMusicTrack,
        musicVolume: state.musicVolume,
        sfxEnabled: state.sfxEnabled,
        sfxVolume: state.sfxVolume,
        sfxSettings: state.sfxSettings,
      }),
      onRehydrateStorage: () => (state) => {
        // Sanitize and validate persisted state to protect against corrupted or tampered storage
        if (state) {
          const sanitizedCoins = sanitizeNonNegativeInt(state.coins, 500);
          const sanitizedScore = sanitizeNonNegativeInt(state.score, 0);
          const sanitizedEnergy = clamp(sanitizeNonNegativeInt(state.energy, 5), 0, 5);
          const sanitizedHints = sanitizeNonNegativeInt(state.hints, 0);
          const sanitizedShields = sanitizeNonNegativeInt(state.streakShields, 0);
          const sanitizedBoosters = sanitizeNonNegativeInt(state.chronoBoosters, 0);
          const sanitizedHighestStreak = sanitizeNonNegativeInt(state.highestStreak, 0);
          const sanitizedClaimedAchievements = Array.isArray(state.claimedAchievements)
            ? state.claimedAchievements.filter((id) => typeof id === 'string')
            : [];
          const sanitizedLevel = clamp(sanitizePositiveInt(state.currentLevel, 1), 1, MAX_LEVEL);
           const maxWordIndex = Math.max(0, (state.activeLevel?.targetWords?.length || 1) - 1);
           const sanitizedWordIndex = clamp(
             sanitizeNonNegativeInt(state.currentWordIndex, 0),
             0,
             maxWordIndex,
           );
           const sanitizedCategory = ALLOWED_CATEGORIES.includes(state.selectedCategoryId)
             ? state.selectedCategoryId
             : 'space';
           const sanitizedPlayedWords = Array.isArray(state.playedWords)
            ? state.playedWords.filter((w) => typeof w === 'string' && w.trim().length > 0)
            : [];
          const sanitizedMusicTrack =
            typeof state.selectedMusicTrack === 'number' &&
            Number.isInteger(state.selectedMusicTrack) &&
            state.selectedMusicTrack >= 0 &&
            state.selectedMusicTrack < 3
              ? state.selectedMusicTrack
              : 0;
          const sanitizedMusicVol =
            typeof state.musicVolume === 'number' && Number.isFinite(state.musicVolume)
              ? clamp(state.musicVolume, 0, 1)
              : 1.0;
          const sanitizedSfxVol =
            typeof state.sfxVolume === 'number' && Number.isFinite(state.sfxVolume)
              ? clamp(state.sfxVolume, 0, 1)
              : 1.0;

          useGameStore.setState({
            coins: sanitizedCoins < 50 ? 500 : sanitizedCoins,
            score: sanitizedScore,
            energy: sanitizedEnergy,
            hints: sanitizedHints,
            streakShields: sanitizedShields,
            chronoBoosters: sanitizedBoosters,
            highestStreak: sanitizedHighestStreak,
            claimedAchievements: sanitizedClaimedAchievements,
             currentLevel: sanitizedLevel,
             currentWordIndex: sanitizedWordIndex,
             selectedCategoryId: sanitizedCategory,
            playedWords: sanitizedPlayedWords,
            selectedMusicTrack: sanitizedMusicTrack,
            musicVolume: sanitizedMusicVol,
            sfxVolume: sanitizedSfxVol,
            hasHydrated: true,
          });
        } else {
          useGameStore.setState({ hasHydrated: true });
        }
      },
    }
  )
);

/**
 * Derived boolean: whether Undo is allowed for the current level.
 * Always in sync with config — no duplicated state to drift out of date.
 * Usage: const canUndo = useGameStore(selectCanUndo);
 */
export const selectCanUndo = (state: GameState): boolean =>
  getLevelConfig(state.currentLevel).undoAllowed;