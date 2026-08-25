// Linear progression system: 8 strict levels.
// Each level pins down: how many words must be solved, the allowed word-length
// band, timer duration, visual theme and whether Undo is available.
//
// Difficulty ramps (user-requested fixed lengths):
//   - Words per level:  L1 starts at 6, then +1 each level (6,7,8,9,10,11,12,13).
//   - Word length:      exact lengths per band (no ranges, no random mixing):
//                         L1-2: 4 letters
//                         L3-5: 5 letters
//                         L6-8: 6 letters
//   - Timers:           Explorer/Adventurer 45s, Challenger 40s, Master 30s.
//   - Undo:             allowed everywhere except Level 8 (disabled entirely).
//   - Boss finale:      Level 8 ends with a single 10-letter Boss Word.

export type ThemeKey =
  | 'sunnyMeadow'
  | 'crystalCaves'
  | 'deepOcean'
  | 'abyss'
  | 'neonGrid'
  | 'tundra'
  | 'darkForest'
  | 'volcano'
  | 'cosmicGold';

export interface LevelTheme {
  /** Root screen background (kept dark-toned so existing light text stays readable). */
  background: string;
  /** Per-level accent color for highlights (timer, labels). */
  accent: string;
}

export const LEVEL_THEMES: Record<ThemeKey, LevelTheme> = {
  sunnyMeadow: { background: '#1E2A14', accent: '#A3E635' },
  crystalCaves: { background: '#0F2434', accent: '#67E8F9' },
  deepOcean: { background: '#04263B', accent: '#38BDF8' },
  abyss: { background: '#02141F', accent: '#22D3EE' },
  neonGrid: { background: '#160B2E', accent: '#E879F9' },
  tundra: { background: '#16232E', accent: '#94A3B8' },
  darkForest: { background: '#0C1D12', accent: '#4ADE80' },
  volcano: { background: '#2A0D0B', accent: '#F87171' },
  cosmicGold: { background: '#14100A', accent: '#FFC300' },
};

export interface LevelConfig {
  /** 1-indexed level number (1-8). */
  level: number;
  /** Rank tier shown in the UI. */
  tier: 'Explorer' | 'Adventurer' | 'Challenger' | 'Master';
  /** Countdown duration in seconds for this level. */
  timerSeconds: number;
  minWordLength: number;
  maxWordLength: number;
  theme: ThemeKey;
  /** Undo is enabled for every level except Level 8. */
  undoAllowed: boolean;
  /** Level 8 appends a single 10-letter Boss Word after its regular words. */
  appendBossWord: boolean;
  /** How many regular words must be solved (excluding the boss word). */
  requiredWordCount: number;
}

export const MAX_LEVEL = 8;

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    tier: 'Explorer',
    timerSeconds: 45,
    minWordLength: 4,
    maxWordLength: 4,
    theme: 'sunnyMeadow',
    undoAllowed: true,
    appendBossWord: false,
    requiredWordCount: 6,
  },
  {
    level: 2,
    tier: 'Explorer',
    timerSeconds: 45,
    minWordLength: 4,
    maxWordLength: 4,
    theme: 'crystalCaves',
    undoAllowed: true,
    appendBossWord: false,
    requiredWordCount: 7,
  },
  {
    level: 3,
    tier: 'Adventurer',
    timerSeconds: 45,
    minWordLength: 5,
    maxWordLength: 5,
    theme: 'deepOcean',
    undoAllowed: true,
    appendBossWord: false,
    requiredWordCount: 8,
  },
  {
    level: 4,
    tier: 'Adventurer',
    timerSeconds: 45,
    minWordLength: 5,
    maxWordLength: 5,
    theme: 'abyss',
    undoAllowed: true,
    appendBossWord: false,
    requiredWordCount: 9,
  },
  {
    level: 5,
    tier: 'Challenger',
    timerSeconds: 40,
    minWordLength: 5,
    maxWordLength: 5,
    theme: 'neonGrid',
    undoAllowed: true,
    appendBossWord: false,
    requiredWordCount: 10,
  },
  {
    level: 6,
    tier: 'Challenger',
    timerSeconds: 40,
    minWordLength: 6,
    maxWordLength: 6,
    theme: 'tundra',
    undoAllowed: true,
    appendBossWord: false,
    requiredWordCount: 11,
  },
  {
    level: 7,
    tier: 'Master',
    timerSeconds: 30,
    minWordLength: 6,
    maxWordLength: 6,
    theme: 'darkForest',
    undoAllowed: true,
    appendBossWord: false,
    requiredWordCount: 12,
  },
  {
    // Crucial: Undo feature entirely disabled on Level 8, which ends in the Boss Word.
    level: 8,
    tier: 'Master',
    timerSeconds: 30,
    minWordLength: 6,
    maxWordLength: 6,
    theme: 'volcano',
    undoAllowed: false,
    appendBossWord: true,
    requiredWordCount: 13,
  },
];

/** Fetches the configuration for a level, clamping to the valid 1..MAX_LEVEL range. */
export function getLevelConfig(level: number): LevelConfig {
  return LEVEL_CONFIGS[Math.min(Math.max(level, 1), MAX_LEVEL) - 1];
}

/** Converts '#RRGGBB' + alpha to an 'rgba(...)' string (used for themed overlays). */
export function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}