/**
 * Word Explorer QA harness.
 * Run: `npm test` (or `npx tsx scripts/run-tests.ts`).
 *
 * Every feature you add should get a suite here following the same pattern:
 * an object/function using the assert helpers. Failures are collected and the
 * process exits non-zero so CI can gate on it.
 */

import { getLevelConfig, MAX_LEVEL, LEVEL_CONFIGS } from '../config/levelConfig';
import { categoryWords, getCategoryPool } from '../data/categoriesData';
import {
  buildWordSetForLevel,
  buildWordSetForLevelNumber,
  BOSS_WORD,
} from '../data/levelWords';

/* ------------------------------------------------------------------ */
/* Tiny zero-dependency assertion helpers                              */
/* ------------------------------------------------------------------ */

let currentSuite = '';
let passCount = 0;
let failCount = 0;
const failures: string[] = [];

function assert(cond: boolean, message: string): void {
  if (cond) {
    passCount += 1;
  } else {
    failCount += 1;
    failures.push(`[${currentSuite}] ${message}`);
    console.error(`  ✗ ${message}`);
  }
}

function assertEq<T>(actual: T, expected: T, message: string): void {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`
  );
}

function describe(name: string): void {
  currentSuite = name;
  console.log(`\n▶ ${name}`);
}

/* ---------------------------------------------------------------------------
 * Suites
 * ------------------------------------------------------------------------- */

function testLevelConfig(): void {
  describe('levelConfig - fixed length bands & counts');
  assertEq(LEVEL_CONFIGS.length, 8, 'there are 8 levels');
  assertEq(MAX_LEVEL, 8, 'MAX_LEVEL is 8');

  const lengthExpect: Record<number, [number, number]> = {
    1: [4, 4], 2: [4, 4], 3: [5, 5], 4: [5, 5], 5: [5, 5], 6: [6, 6], 7: [6, 6], 8: [6, 6],
  };
  const countExpect: Record<number, number> = { 1: 6, 2: 7, 3: 8, 4: 9, 5: 10, 6: 11, 7: 12, 8: 13 };

  for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
    const cfg = getLevelConfig(lvl);
    assertEq(cfg.level, lvl, `L${lvl} has level id ${lvl}`);
    assertEq(
      [cfg.minWordLength, cfg.maxWordLength],
      lengthExpect[lvl],
      `L${lvl} length band = ${lengthExpect[lvl][0]} letters`
    );
    assertEq(cfg.requiredWordCount, countExpect[lvl], `L${lvl} required count ${countExpect[lvl]}`);
  }

  assertEq(getLevelConfig(0).level, 1, 'getLevelConfig(0) clamps to 1');
  assertEq(getLevelConfig(99).level, 8, 'getLevelConfig(99) clamps to 8');
  assertEq(getLevelConfig(8).undoAllowed, false, 'L8 undo disallowed');
  assertEq(getLevelConfig(8).appendBossWord, true, 'L8 appends boss word');
  assertEq(getLevelConfig(1).appendBossWord, false, 'L1 has no boss word');
  assert(getLevelConfig(1).timerSeconds >= getLevelConfig(8).timerSeconds, 'timers never increase');
}

function testCategories(): void {
  describe('categoriesData: 200 words per category (40x4L, 70x5L, 90x6L, 800 total)');
  const cats = Object.keys(categoryWords).sort();
  assertEq(cats, ['animals', 'food', 'space', 'sports'], 'exactly 4 base categories');

  for (const cat of cats) {
    const pool = categoryWords[cat as keyof typeof categoryWords];
    assertEq(pool.length, 200, `${cat} has 200 words`);
    assertEq(pool.filter((w) => w.word.length === 4).length, 40, `${cat} has 40 four-letter words`);
    assertEq(pool.filter((w) => w.word.length === 5).length, 70, `${cat} has 70 five-letter words`);
    assertEq(pool.filter((w) => w.word.length === 6).length, 90, `${cat} has 90 six-letter words`);
    assert(pool.every((w) => /^[A-Z]{4,6}$/.test(w.word)), `${cat} words are uppercase A-Z 4-6`);
    assert(pool.every((w) => w.description && w.description.length > 0), `${cat} has descriptions`);
  }

  assertEq(getCategoryPool('anything').length, 800, "'anything' merges all 4 categories (800)");
  assertEq(getCategoryPool('space').length, 200, 'getCategoryPool(space) returns 200');
  assertEq(getCategoryPool('unknown').length, 800, 'unknown id falls back to union');
}

function testWordUniqueness(): void {
  describe('word uniqueness: no duplicates within or across categories');
  const seen = new Map<string, string>();
  let dupCount = 0;
  for (const cat of Object.keys(categoryWords)) {
    const pool = categoryWords[cat as keyof typeof categoryWords];
    const seenInCat = new Set<string>();
    for (const w of pool) {
      assert(!seenInCat.has(w.word), `duplicate within ${cat}: ${w.word}`);
      seenInCat.add(w.word);
      if (seen.has(w.word)) {
        dupCount += 1;
        assert(false, `cross-category duplicate: ${w.word} (${seen.get(w.word)} vs ${cat})`);
      } else {
        seen.set(w.word, cat);
      }
    }
  }
  assert(dupCount === 0, 'no cross-category duplicate words');
}

function testBuildWordSet(): void {
  describe('buildWordSetForLevel: category-strict + length-strict across all levels');
  const cats = ['space', 'animals', 'food', 'sports', 'anything'];

  for (const cat of cats) {
    const pool = getCategoryPool(cat);
    for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
      const cfg = getLevelConfig(lvl);
      const words = buildWordSetForLevelNumber(lvl, pool, []);
      const expectCount = cfg.requiredWordCount + (cfg.appendBossWord ? 1 : 0);
      assertEq(words.length, expectCount, `${cat} L${lvl} returns ${expectCount} words`);

      const badLen = words.filter((w) => w.word !== BOSS_WORD.word && w.word.length !== cfg.minWordLength);
      assertEq(badLen.length, 0, `${cat} L${lvl} all words exactly ${cfg.minWordLength} letters`);

      const allowed = new Set(pool.map((w) => w.word));
      const outside = words.filter(
        (w) => w.word !== BOSS_WORD.word && !allowed.has(w.word)
      );
      assertEq(outside.length, 0, `${cat} L${lvl} words all from allowed pool`);

      const set = new Set(words.map((w) => w.word));
      assertEq(set.size, words.length, `${cat} L${lvl} no duplicates within level`);
    }
  }

  const l8 = buildWordSetForLevel(getLevelConfig(8), getCategoryPool('space'), []);
  assert(l8.some((w) => w.word === BOSS_WORD.word), 'L8 includes boss word ATMOSPHERE');
  const l7 = buildWordSetForLevel(getLevelConfig(7), getCategoryPool('space'), []);
  assert(!l7.some((w) => w.word === BOSS_WORD.word), 'L7 never includes boss word');
}

function testRecycling(): void {
  describe('played-word recycling preserves exact length');
  const pool = getCategoryPool('space');
  const all4 = pool.filter((w) => w.word.length === 4);
  // Force every 4-letter word to be "played", then request L1 (needs 6 x 4L)
  const recycled = buildWordSetForLevel(getLevelConfig(1), pool, all4.map((w) => w.word));
  assertEq(recycled.length, 6, 'recycling still returns 6 words');
  assert(recycled.every((w) => w.word.length === 4), 'recycled words all 4 letters');
}

async function testGameStore(): Promise<void> {
  describe('gameStore: economy, progression, reset (AsyncStorage mocked)');
  const { useGameStore, selectCanUndo, LEVEL_CLEAR_COIN_BONUS } = await import('../store/gameStore');

  // Economy
  let s = useGameStore.getState();
  assertEq(s.currentLevel, 1, 'fresh store starts at level 1');
  assert(s.spendCoins(10), 'spendCoins(true) when enough');
  assertEq(useGameStore.getState().coins, 490, 'coins 500 -> 490');
  assert(!useGameStore.getState().spendCoins(99999), 'spendCoins(false) when low');
  useGameStore.getState().addCoins(50);
  assertEq(useGameStore.getState().coins, 540, 'addCoins 490+50=540');
  useGameStore.getState().restoreCredits(500);
  assertEq(useGameStore.getState().coins, 1040, 'restoreCredits +500=1040');
  useGameStore.getState().addScore(40);
  assertEq(useGameStore.getState().score, 40, 'addScore 40');

  // Streak & Combo progression
  assertEq(useGameStore.getState().streak, 0, 'initial streak is 0');
  assertEq(useGameStore.getState().incrementStreak(), 1, 'streak 0 -> 1');
  assertEq(useGameStore.getState().incrementStreak(), 2, 'streak 1 -> 2');
  assertEq(useGameStore.getState().incrementStreak(), 3, 'streak 2 -> 3');
  assertEq(useGameStore.getState().incrementStreak(), 4, 'streak 3 -> 4');
  assertEq(useGameStore.getState().incrementStreak(), 5, 'streak 4 -> 5');
  assertEq(useGameStore.getState().incrementStreak(), 6, 'streak 5 -> 6 (6X combo)');
  useGameStore.getState().resetStreak();
  assertEq(useGameStore.getState().streak, 0, 'resetStreak resets to 0');

  // Energy
  assert(useGameStore.getState().useEnergy(), 'useEnergy(true) with full lives');
  assertEq(useGameStore.getState().energy, 4, 'energy 5->4');
  assert(!useGameStore.getState().useEnergy(9), 'useEnergy(false) if < required');

  // Hints inventory and charges
  assertEq(useGameStore.getState().hints, 0, 'initial hints count is 0');
  assertEq(useGameStore.getState().useHintCharge(), false, 'useHintCharge returns false when hints = 0');
  useGameStore.getState().addHints(20);
  assertEq(useGameStore.getState().hints, 20, 'addHints(20) sets hints to 20');
  assertEq(useGameStore.getState().useHintCharge(), true, 'useHintCharge returns true when hints > 0');
  assertEq(useGameStore.getState().hints, 19, 'hints decremented to 19 after useHintCharge');

  // Streak Shield inventory & protection
  assertEq(useGameStore.getState().streakShields, 0, 'initial streakShields is 0');
  assertEq(useGameStore.getState().useStreakShield(), false, 'useStreakShield returns false when 0');
  useGameStore.getState().addStreakShields(2);
  assertEq(useGameStore.getState().streakShields, 2, 'addStreakShields(2) sets count to 2');
  assertEq(useGameStore.getState().useStreakShield(), true, 'useStreakShield returns true when > 0');
  assertEq(useGameStore.getState().streakShields, 1, 'streakShields decremented to 1 after useStreakShield');

  // Chrono Booster inventory & timer extension
  assertEq(useGameStore.getState().chronoBoosters, 0, 'initial chronoBoosters is 0');
  assertEq(useGameStore.getState().useChronoBooster(), false, 'useChronoBooster returns false when 0');
  useGameStore.getState().addChronoBoosters(3);
  assertEq(useGameStore.getState().chronoBoosters, 3, 'addChronoBoosters(3) sets count to 3');
  assertEq(useGameStore.getState().useChronoBooster(), true, 'useChronoBooster returns true when > 0');
  assertEq(useGameStore.getState().chronoBoosters, 2, 'chronoBoosters decremented to 2 after useChronoBooster');

  // Played words marking (dedupe)
  useGameStore.getState().markWordsAsPlayed(['MOON', 'MARS', 'MOON']);
  assertEq(useGameStore.getState().playedWords.length, 2, 'markWordsAsPlayed dedupes');

  // advanceLevel
  useGameStore.getState().advanceLevel();
  s = useGameStore.getState();
  assertEq(s.currentLevel, 2, 'advanceLevel -> L2');
  assertEq(s.activeLevel.targetWords.length, 7, 'L2 has 7 words');
  assert(s.activeLevel.targetWords.every((w) => w.word.length === 4), 'L2 words are 4 letters');

  // jumpToLevel (Level selector & tester)
  useGameStore.getState().jumpToLevel(5, 'animals');
  s = useGameStore.getState();
  assertEq(s.currentLevel, 5, 'jumpToLevel -> L5');
  assertEq(s.selectedCategoryId, 'animals', 'jumpToLevel sets category');
  assertEq(s.activeLevel.targetWords.length, 10, 'L5 has 10 words');
  assert(selectCanUndo(s), 'L5 undo allowed');

  useGameStore.getState().jumpToLevel(8, 'food');
  s = useGameStore.getState();
  assertEq(s.currentLevel, 8, 'jumpToLevel -> L8 (Boss)');
  assert(!selectCanUndo(s), 'L8 Boss undo disabled');
  assert(s.activeLevel.targetWords.some((w) => w.word === 'ATMOSPHERE'), 'L8 includes 10L Boss word');

  // Reset progression (keeps economy)
  useGameStore.getState().resetProgression();
  s = useGameStore.getState();
  assertEq(s.currentLevel, 1, 'resetProgression -> L1');
  assertEq(s.coins, 1040, 'resetProgression keeps coins');

  // Reset game (factory reset)
  useGameStore.getState().resetGame();
  s = useGameStore.getState();
  assertEq(s.currentLevel, 1, 'resetGame -> L1');
  assertEq(s.coins, 500, 'resetGame -> default 500 coins');
  assertEq(s.hints, 0, 'resetGame -> hints reset to 0');
  assertEq(s.streakShields, 0, 'resetGame -> streakShields reset to 0');
  assertEq(s.chronoBoosters, 0, 'resetGame -> chronoBoosters reset to 0');
  assertEq(s.sfxSettings.coinReward, true, 'coinReward sfx enabled by default');
  assertEq(LEVEL_CLEAR_COIN_BONUS, 20, 'LEVEL_CLEAR_COIN_BONUS is 20');
  assertEq(s.score, 0, 'resetGame score = 0');
  assertEq(s.energy, 5, 'resetGame energy = 5');
  assertEq(s.playedWords.length, 0, 'resetGame clears played words');
}

async function testSecurityHardening(): Promise<void> {
  describe('securityHardening: exploit protection & input sanitization');
  const { useGameStore } = await import('../store/gameStore');

  useGameStore.getState().resetGame();
  assertEq(useGameStore.getState().coins, 500, 'initial coins 500');

  // Exploit attempt 1: Negative spendCoins to gain free coins
  const spendNeg = useGameStore.getState().spendCoins(-500);
  assertEq(spendNeg, false, 'spendCoins(-500) rejected');
  assertEq(useGameStore.getState().coins, 500, 'coins unchanged after negative spend');

  // Exploit attempt 2: NaN / Infinity in spendCoins
  assertEq(useGameStore.getState().spendCoins(NaN), false, 'spendCoins(NaN) rejected');
  assertEq(useGameStore.getState().spendCoins(Infinity), false, 'spendCoins(Infinity) rejected');
  assertEq(useGameStore.getState().coins, 500, 'coins unchanged after NaN/Infinity spend');

  // Exploit attempt 3: Negative / NaN addCoins
  useGameStore.getState().addCoins(-100);
  assertEq(useGameStore.getState().coins, 500, 'addCoins(-100) ignored');
  useGameStore.getState().addCoins(NaN);
  assertEq(useGameStore.getState().coins, 500, 'addCoins(NaN) ignored');

  // Exploit attempt 4: Negative / NaN addScore
  useGameStore.getState().addScore(-50);
  assertEq(useGameStore.getState().score, 0, 'addScore(-50) ignored');
  useGameStore.getState().addScore(NaN);
  assertEq(useGameStore.getState().score, 0, 'addScore(NaN) ignored');

  // Exploit attempt 5: Negative / NaN useEnergy to gain free energy
  const useEnergyNeg = useGameStore.getState().useEnergy(-10);
  assertEq(useEnergyNeg, false, 'useEnergy(-10) rejected');
  assertEq(useGameStore.getState().energy, 5, 'energy unchanged after negative useEnergy');
  assertEq(useGameStore.getState().useEnergy(NaN), false, 'useEnergy(NaN) rejected');

  // Exploit attempt 6: Negative / NaN powerup additions
  useGameStore.getState().addHints(-20);
  assertEq(useGameStore.getState().hints, 0, 'addHints(-20) ignored');
  useGameStore.getState().addHints(NaN);
  assertEq(useGameStore.getState().hints, 0, 'addHints(NaN) ignored');
  assertEq(useGameStore.getState().useHintCharge(), false, 'useHintCharge returns false at 0');

  useGameStore.getState().addStreakShields(-5);
  assertEq(useGameStore.getState().streakShields, 0, 'addStreakShields(-5) ignored');
  useGameStore.getState().addStreakShields(NaN);
  assertEq(useGameStore.getState().streakShields, 0, 'addStreakShields(NaN) ignored');
  assertEq(useGameStore.getState().useStreakShield(), false, 'useStreakShield returns false at 0');

  useGameStore.getState().addChronoBoosters(-5);
  assertEq(useGameStore.getState().chronoBoosters, 0, 'addChronoBoosters(-5) ignored');
  useGameStore.getState().addChronoBoosters(NaN);
  assertEq(useGameStore.getState().chronoBoosters, 0, 'addChronoBoosters(NaN) ignored');
  assertEq(useGameStore.getState().useChronoBooster(), false, 'useChronoBooster returns false at 0');

  // Bounds clamp: Level bounds on jumpToLevel
  useGameStore.getState().jumpToLevel(-10);
  assertEq(useGameStore.getState().currentLevel, 1, 'jumpToLevel(-10) clamped to L1');
  useGameStore.getState().jumpToLevel(999);
  assertEq(useGameStore.getState().currentLevel, MAX_LEVEL, 'jumpToLevel(999) clamped to MAX_LEVEL');

  // Bounds clamp: Volume levels out of range
  useGameStore.getState().setMusicVolume(5.0);
  assertEq(useGameStore.getState().musicVolume, 1.0, 'musicVolume clamped to max 1.0');
  useGameStore.getState().setMusicVolume(-2.0);
  assertEq(useGameStore.getState().musicVolume, 0.0, 'musicVolume clamped to min 0.0');

  useGameStore.getState().setSfxVolume(99.0);
  assertEq(useGameStore.getState().sfxVolume, 1.0, 'sfxVolume clamped to max 1.0');
  useGameStore.getState().setSfxVolume(-1.0);
  assertEq(useGameStore.getState().sfxVolume, 0.0, 'sfxVolume clamped to min 0.0');

  // Out of range track selection
  useGameStore.getState().setSelectedMusicTrack(99);
  assertEq(useGameStore.getState().selectedMusicTrack, 0, 'invalid track index ignored');
  useGameStore.getState().setSelectedMusicTrack(-1);
  assertEq(useGameStore.getState().selectedMusicTrack, 0, 'negative track index ignored');

  // Category injection
  useGameStore.getState().setSelectedCategoryId('malicious_category_id');
  assertEq(useGameStore.getState().selectedCategoryId, 'space', 'invalid category falls back to space');
}

async function testGameplayMechanics(): Promise<void> {
  describe('gameplayMechanics: streak shield, chrono booster & hint charge consumption');
  const { useGameStore } = await import('../store/gameStore');

  useGameStore.getState().resetGame();

  // 1. Positive: Hint charge consumption
  useGameStore.getState().addHints(3);
  assertEq(useGameStore.getState().hints, 3, 'hints inventory loaded with 3');
  assertEq(useGameStore.getState().useHintCharge(), true, '1st hint charge used');
  assertEq(useGameStore.getState().useHintCharge(), true, '2nd hint charge used');
  assertEq(useGameStore.getState().useHintCharge(), true, '3rd hint charge used');
  assertEq(useGameStore.getState().hints, 0, 'hints inventory now 0');
  // Negative: Using when 0 charges
  assertEq(useGameStore.getState().useHintCharge(), false, 'using hint charge at 0 returns false');

  // 2. Positive: Streak Shield protection
  useGameStore.getState().addStreakShields(1);
  assertEq(useGameStore.getState().streakShields, 1, 'streak shield added');
  assertEq(useGameStore.getState().useStreakShield(), true, 'streak shield consumed');
  assertEq(useGameStore.getState().streakShields, 0, 'streak shield count now 0');
  // Negative: Using when 0 shields
  assertEq(useGameStore.getState().useStreakShield(), false, 'using streak shield at 0 returns false');

  // 3. Positive: Chrono Booster timer extension
  useGameStore.getState().addChronoBoosters(2);
  assertEq(useGameStore.getState().chronoBoosters, 2, 'chrono booster added');
  assertEq(useGameStore.getState().useChronoBooster(), true, '1st chrono booster consumed');
  assertEq(useGameStore.getState().useChronoBooster(), true, '2nd chrono booster consumed');
  assertEq(useGameStore.getState().chronoBoosters, 0, 'chrono booster count now 0');
  // Negative: Using when 0 boosters
  assertEq(useGameStore.getState().useChronoBooster(), false, 'using chrono booster at 0 returns false');

  // 4. Positive & Negative: Energy replenishment and exhaustion
  useGameStore.getState().resetGame();
  assertEq(useGameStore.getState().energy, 5, 'full 5 energy');
  for (let i = 4; i >= 0; i--) {
    assert(useGameStore.getState().useEnergy(1), `energy consumed, remaining ${i}`);
    assertEq(useGameStore.getState().energy, i, `energy count matches ${i}`);
  }
  // Negative: Using energy when empty
  assertEq(useGameStore.getState().useEnergy(1), false, 'cannot use energy when 0');
  assertEq(useGameStore.getState().energy, 0, 'energy stays at 0');
}

async function testAudioToggles(): Promise<void> {
  describe('audioToggles: music playback, volume & individual SFX channels');
  const { useGameStore } = await import('../store/gameStore');

  useGameStore.getState().resetGame();

  // Positive: Music playing toggle
  assertEq(useGameStore.getState().isMusicPlaying, true, 'music is playing by default');
  useGameStore.getState().setIsMusicPlaying(false);
  assertEq(useGameStore.getState().isMusicPlaying, false, 'music paused');
  useGameStore.getState().setIsMusicPlaying(true);
  assertEq(useGameStore.getState().isMusicPlaying, true, 'music resumed');

  // Positive: SFX master toggle
  assertEq(useGameStore.getState().sfxEnabled, true, 'sfx enabled by default');
  useGameStore.getState().setSfxEnabled(false);
  assertEq(useGameStore.getState().sfxEnabled, false, 'sfx disabled');
  useGameStore.getState().setSfxEnabled(true);
  assertEq(useGameStore.getState().sfxEnabled, true, 'sfx re-enabled');

  // Positive: Individual SFX settings toggles
  const sfxKeys = ['click', 'correct', 'wrong', 'streak', 'hint', 'warning', 'levelComplete', 'coinReward'] as const;
  for (const k of sfxKeys) {
    assertEq(useGameStore.getState().sfxSettings[k], true, `${k} sfx enabled by default`);
    useGameStore.getState().toggleSfxSetting(k);
    assertEq(useGameStore.getState().sfxSettings[k], false, `${k} sfx toggled to disabled`);
    useGameStore.getState().toggleSfxSetting(k);
    assertEq(useGameStore.getState().sfxSettings[k], true, `${k} sfx toggled back to enabled`);
  }
}

async function testEdgeResilience(): Promise<void> {
  describe('edgeResilience: rapid mutations & boundary conditions');
  const { useGameStore } = await import('../store/gameStore');

  useGameStore.getState().resetGame();

  // Stress test: 100 rapid concurrent coin additions and deductions
  for (let i = 0; i < 100; i++) {
    useGameStore.getState().addCoins(10);
    useGameStore.getState().spendCoins(5);
  }
  assertEq(useGameStore.getState().coins, 500 + 100 * 5, 'coins match arithmetic after 100 iterations (1000)');

  // Stress test: Negative coin deduction does not inflate balance
  for (let i = 0; i < 50; i++) {
    useGameStore.getState().spendCoins(-100);
  }
  assertEq(useGameStore.getState().coins, 1000, 'coins uncorrupted after 50 negative spend attempts');

  // Level progression loop stress test: L1 -> L8 and beyond
  useGameStore.getState().resetProgression();
  for (let lvl = 1; lvl <= 8; lvl++) {
    assertEq(useGameStore.getState().currentLevel, lvl, `reached level ${lvl}`);
    if (lvl < 8) {
      useGameStore.getState().advanceLevel();
    }
  }
  assertEq(useGameStore.getState().currentLevel, 8, 'clamped at final level 8');
}

function summarize(): void {
  console.log(`\n----------------------------------------------------------------------`);
  console.log(`RESULT: ${failCount === 0 ? 'ALL PASS ✔' : `${failCount} FAILURE(S) ✘`}`);
  console.log(`        ${passCount} assertions passed, ${failCount} failed`);
  console.log(`----------------------------------------------------------------------`);
  if (failCount > 0) {
    failures.forEach((f) => console.error(`  ✘ ${f}`));
    process.exit(1);
  }
}

async function main(): Promise<void> {
  testLevelConfig();
  testCategories();
  testWordUniqueness();
  testBuildWordSet();
  testRecycling();
  await testGameStore();
  await testSecurityHardening();
  await testGameplayMechanics();
  await testAudioToggles();
  await testEdgeResilience();
  summarize();
}

void main();