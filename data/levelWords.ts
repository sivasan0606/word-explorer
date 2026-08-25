// Curated word bank — now category-strict.
// When a user picks a category (e.g. Animals), ONLY words from that category
// are used. No generic fallback pool is mixed in, per product requirement.
// The length filter from levelConfig still applies; if the category has too
// few words at that length we fill from the same category ignoring length
// (never leaking other categories).

import { getLevelConfig, LevelConfig } from '../config/levelConfig';

export interface WordEntry {
  word: string;
  description: string;
}

// 3-letter words (Levels 1-2). Plenty so a fresh set is always available.
const SHORT: WordEntry[] = [
  { word: 'BEE', description: 'A buzzing insect that makes honey.' },
  { word: 'OWL', description: 'A nocturnal bird with huge eyes.' },
  { word: 'FOX', description: 'A cunning wild dog with a bushy tail.' },
  { word: 'EGG', description: 'An oval object that a bird lays.' },
  { word: 'MAP', description: 'A drawing that shows where places are.' },
  { word: 'JET', description: 'A fast airplane with powerful engines.' },
  { word: 'KEY', description: 'A metal tool that opens locks.' },
  { word: 'FAN', description: 'A device that makes a cooling breeze.' },
  { word: 'JAR', description: 'A glass container with a wide mouth.' },
  { word: 'PEN', description: 'A tool used to write with ink.' },
  { word: 'HAT', description: 'A covering worn on the head.' },
  { word: 'CUP', description: 'A small open container for drinking.' },
  { word: 'SUN', description: 'The star around which the earth orbits.' },
  { word: 'MUD', description: 'Soft wet earth.' },
  { word: 'NET', description: 'A mesh used for catching fish.' },
  { word: 'COW', description: 'A farm animal that gives milk.' },
  { word: 'PIG', description: 'A farm animal with a curly tail.' },
  { word: 'LID', description: 'The removable top of a container.' },
  { word: 'BOW', description: 'A knot with two loops, or a weapon for arrows.' },
  { word: 'STAR', description: 'A fixed glowing point of light in the sky.' },
];

// Mid-length words (Levels 3-6).
const MEDIUM: WordEntry[] = [
  { word: 'RIVER', description: 'A long stream of water flowing to the sea.' },
  { word: 'CLOUD', description: 'Floating vapor visible in the sky.' },
  { word: 'TIGER', description: 'A large striped jungle cat.' },
  { word: 'HORSE', description: 'A swift four-legged animal people ride.' },
  { word: 'SNAKE', description: 'A long legless reptile that slithers.' },
  { word: 'EAGLE', description: 'A powerful bird of prey with keen eyes.' },
  { word: 'SHARK', description: 'A fearsome ocean predator with fins.' },
  { word: 'WHALE', description: 'The largest animal living in the sea.' },
  { word: 'MANGO', description: 'A sweet tropical fruit with a large pit.' },
  { word: 'PEACH', description: 'A soft fuzzy fruit with a stone inside.' },
  { word: 'BREAD', description: 'A baked staple made from flour.' },
  { word: 'HONEY', description: 'Sweet syrup made by bees from nectar.' },
  { word: 'STORM', description: 'Violent weather with wind and rain.' },
  { word: 'FLAME', description: 'The glowing gas of a fire.' },
  { word: 'AMBER', description: 'Fossilized tree resin, often golden yellow.' },
  { word: 'CORAL', description: 'Colorful sea life that builds reefs.' },
  { word: 'MAPLE', description: 'A tree whose syrup sweetens pancakes.' },
  { word: 'PEARL', description: 'A gem formed inside an oyster shell.' },
  { word: 'RAVEN', description: 'A large glossy black bird known for intelligence.' },
  { word: 'GHOST', description: 'The spirit of a departed soul.' },
  { word: 'ISLAND', description: 'Land completely surrounded by water.' },
  { word: 'BRIDGE', description: 'A structure spanning a river or gap.' },
  { word: 'CASTLE', description: 'A fortified royal residence.' },
  { word: 'DRAGON', description: 'A mythical winged beast breathing fire.' },
  { word: 'ROCKET', description: 'A vehicle that blasts off into space.' },
  { word: 'VIOLET', description: 'A color at the far end of the rainbow.' },
  { word: 'WINTER', description: 'The coldest season of the year.' },
  { word: 'GARDEN', description: 'A plot where flowers and vegetables grow.' },
  { word: 'WIZARD', description: 'A wielder of magical powers.' },
  { word: 'TEMPLE', description: 'A sacred building used for worship.' },
  { word: 'SHADOW', description: 'A dark shape cast by blocking light.' },
  { word: 'FALCON', description: 'A swift hunting bird that dives at great speed.' },
];

// Long words (Levels 7-8). Generous count because L7(12)+L8(13) need 25 total.
const LONG: WordEntry[] = [
  { word: 'JOURNEY', description: 'A long trip from one place to another.' },
  { word: 'MYSTERY', description: 'Something strange and unexplained.' },
  { word: 'DIAMOND', description: 'The hardest, most brilliant gemstone.' },
  { word: 'EMERALD', description: 'A precious green gemstone.' },
  { word: 'CAPTAIN', description: 'The leader of a ship or team.' },
  { word: 'PYRAMID', description: 'An ancient Egyptian tomb shaped like a triangle.' },
  { word: 'THUNDER', description: 'The boom that follows lightning.' },
  { word: 'PHANTOM', description: 'An apparition seen but not touched.' },
  { word: 'HORIZON', description: 'Where the sky appears to meet the earth.' },
  { word: 'KINGDOM', description: 'A realm ruled by a king or queen.' },
  { word: 'GRAVITY', description: 'The force that pulls objects toward each other.' },
  { word: 'TWILIGHT', description: 'The soft light right after sunset.' },
  { word: 'FIREBALL', description: 'A bright sphere of burning gas.' },
  { word: 'SUNSHINE', description: 'Bright light and warmth from the sun.' },
  { word: 'MIDNIGHT', description: 'The middle of the night, twelve o\'clock.' },
  { word: 'MOUNTAIN', description: 'A tall natural rise of the earth\'s surface.' },
  { word: 'TREASURE', description: 'A hoard of gold, gems, and riches.' },
  { word: 'UNIVERSE', description: 'Everything that exists, all of space and time.' },
  { word: 'SOLSTICE', description: 'The longest or shortest day of the year.' },
  { word: 'ASTEROID', description: 'A rocky body orbiting the sun.' },
  { word: 'EXPLORER', description: 'One who ventures into the unknown.' },
  { word: 'GALAXIES', description: 'Vast systems of billions of stars.' },
  { word: 'STARDUST', description: 'Tiny particles of matter drifting in space.' },
  { word: 'SKYFALL', description: 'Something falling from the heavens.' },
  { word: 'DISCOVERY', description: 'Finding something for the very first time.' },
  { word: 'LIGHTNING', description: 'A giant electric spark in the sky.' },
  { word: 'TELESCOPE', description: 'A tool for viewing distant objects in space.' },
  { word: 'ASTRONAUT', description: 'A person trained to travel into space.' },
  { word: 'LABYRINTH', description: 'A maze of winding passageways.' },
  { word: 'WATERFALL', description: 'A river plunging over a cliff edge.' },
  { word: 'MOONLIGHT', description: 'Silver light borrowed from the moon.' },
  { word: 'STARLIGHT', description: 'Glimmering rays emitted by distant stars.' },
];

// Level 8 Boss Word: exactly one 10-letter word.
export const BOSS_WORD: WordEntry = {
  word: 'ATMOSPHERE',
  description: 'The envelope of gases surrounding a planet and held by its gravity.',
};

/** @deprecated kept for length reference but NOT used for category-strict selection */
export const LEVEL_WORDS: WordEntry[] = [...SHORT, ...MEDIUM, ...LONG];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  let i = copy.length - 1;
  while (i > 0) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
    i -= 1;
  }
  return copy;
}

/**
 * Builds the exact word set for a level — STRICT to the selected category
 * and STRICT to the exact length band (no random mixing).
 * - ONLY words from `categoryPool` are ever returned (no LEVEL_WORDS mixing).
 * - ONLY words whose length equals the level's band are returned, e.g. L1-2 =4,
 *   L3-5 =5, L6-8 =6 (except Boss ATMOSPHERE).
 * - Prefers unplayed words; if not enough fresh same-length words, recycles
 *   already-played same-length words (still exact length) so the player never
 *   sees a 4-letter word in a 6-letter level.
 * - Only as an absolute last resort (category has < required distinct words of
 *   that exact length) will it fall back to any length from the same category.
 * - Appends the single 10-letter boss word for Level 8 as the only exception.
 */
export function buildWordSetForLevel(
  config: LevelConfig,
  categoryPool: WordEntry[],
  playedWords: string[],
): WordEntry[] {
  const matchesLength = (entry: WordEntry) => {
    const len = entry.word.length;
    return len >= config.minWordLength && len <= config.maxWordLength;
  };
  const isUnplayed = (entry: WordEntry) => !playedWords.includes(entry.word);
  const dedupe = (entries: WordEntry[]) => {
    const seen = new Set<string>();
    return entries.filter((entry) => {
      if (seen.has(entry.word)) return false;
      seen.add(entry.word);
      return true;
    });
  };

  const freshLengthMatched = dedupe(categoryPool.filter((e) => matchesLength(e) && isUnplayed(e)));
  const recycledLengthMatched = dedupe(categoryPool.filter(matchesLength));

  let picked: WordEntry[];
  if (freshLengthMatched.length >= config.requiredWordCount) {
    picked = shuffle(freshLengthMatched).slice(0, config.requiredWordCount);
  } else if (recycledLengthMatched.length >= config.requiredWordCount) {
    // Not enough fresh, but enough total same-length words -> recycle same-length
    // Fresh first, then already-played same-length, still exact length.
    const combined = dedupe([...freshLengthMatched, ...recycledLengthMatched]);
    picked = shuffle(combined).slice(0, config.requiredWordCount);
  } else {
    // Category truly has fewer distinct words of this length than required
    // (should not happen after enrichment, but handle gracefully): fill with
    // any length from same category as last resort, never other categories.
    const freshAnyLength = dedupe(categoryPool.filter(isUnplayed));
    const allCategory = dedupe(categoryPool);
    const recycled = dedupe([
      ...freshLengthMatched,
      ...recycledLengthMatched,
      ...freshAnyLength,
      ...allCategory,
    ]);
    picked = shuffle(recycled).slice(0, config.requiredWordCount);
  }

  if (config.appendBossWord) {
    picked = [...picked, { ...BOSS_WORD }];
  }

  return picked;
}

/** Convenience helper: build the set for any level number directly. */
export function buildWordSetForLevelNumber(
  level: number,
  categoryPool: WordEntry[],
  playedWords: string[],
): WordEntry[] {
  return buildWordSetForLevel(getLevelConfig(level), categoryPool, playedWords);
}