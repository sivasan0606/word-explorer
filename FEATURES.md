# WordExplorer — Feature Guide

A word-unscrambling mobile game where players unscramble words across themed categories, earn coins, evolve a pet, and compete on leaderboards.

---

## Navigation

```
Bottom Navigation Bar (5 tabs):
┌─────────┬─────────┬─────────┬─────────┬──────────┐
│  Play   │  Shop   │ Awards  │Profile  │ Settings │
│  🎮     │  🛍️     │  🏆     │  👤     │  ⚙️      │
└─────────┴─────────┴─────────┴─────────┴──────────┘

Screen Flow:
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Category │────▶│  Game    │────▶│ Success  │
│ Selection│     │  Board   │     │  Modal   │
└──────────┘     └──────────┘     └──────────┘
      │                │                │
      ▼                ▼                ▼
  ┌──────┐       ┌──────────┐     ┌──────────┐
  │ Shop │       │ Energy   │     │  Saga &  │
  │      │       │  Modal   │     │ Level Lab│
  └──────┘       └──────────┘     └──────────┘
```

---

## Features

### 0. Level Progression System (8 Levels)

**Where:** `config/levelConfig.ts`, `data/levelWords.ts`, `store/gameStore.ts`

The game is a **strict, linear 8-level campaign**. You can't skip ahead — clear a level to unlock the next one.

**Words per level:** Level 1 starts with **6 words**, and each level adds **+1 more**:

| Level | Words | Word Length | Timer | Theme | Undo |
|-------|-------|-------------|-------|-------|------|
| 1  Explorer | 6  | 3 letters | 45s | Sunny Meadow | ✅ |
| 2  Explorer | 7  | 3 letters | 45s | Crystal Caves | ✅ |
| 3  Adventurer | 8  | 4-6 letters | 45s | Deep Ocean | ✅ |
| 4  Adventurer | 9  | 4-6 letters | 45s | Abyss | ✅ |
| 5  Challenger | 10 | 5-6 letters | 40s | Neon Grid | ✅ |
| 6  Challenger | 11 | 6-7 letters | 40s | Tundra | ✅ |
| 7  Master | 12 | 7-8 letters | 30s | Dark Forest | ✅ |
| 8  Master | 13 + **Boss** | 7-8 + 10 letters | 30s | Volcano (gold on boss) | ❌ |

**Difficulty ramps three ways:**
1. **Word count** — 6 → 13 words per level
2. **Word length** — 3-letter words up to 7-8 letter words
3. **Timer** — 45s → 30s per word

**Level 8 (crucial):** the **Undo button is disabled entirely**. After clearing Level 8's 13 words, a single **10-letter Boss Word** (ATMOSPHERE) appears as the finale. The screen shifts to a gold/space theme for the boss round. Completing it wins the game.

**On level clear:** the solved word is recorded, `advanceLevel()` preloads the next level's config (timer, lengths, theme, undo rule), and the Success modal is shown before the next level loads.

**On time-out:** if the timer hits 0 on the last word, the level is **retried from the start** (no fake win).

---

### 1. Core Gameplay — Game Board

**Where:** `app/index.tsx`

The main screen where players unscramble words.

**How it works:**
- A word is split into jumbled letter tiles (cyan boxes)
- Tap a jumbled letter → places it into the next empty target slot
- Tap a filled target slot → returns the letter to the jumbled bank
- Tap **CHECK WORD** to validate your answer

**Controls:**
- **Undo** — removes the last placed letter from its slot (enabled in Levels 1–7; disabled in Level 8)
- **Hint** — reveals the correct letter for the first empty slot (costs 10 coins). **Automatically disabled and dimmed** when no placeholder slots are empty, preventing accidental coin deductions.
- **Music toggle** — play/pause background music

**Game mechanics:**
| Action | Reward/Penalty |
|--------|----------------|
| Correct word | +10 score, +2 coins |
| Level cleared | **+20 coins bonus** + animated coin shower |
| Wrong answer | Streak reset, board shakes & returns letters |
| Hint used | -10 coins |
| Dynamic Streak | Multiplier updates live (`1X STREAK`, `2X COMBO!`, `3X COMBO!`, `6X COMBO!`, etc.) |
| 3x/6x/9x milestone | Fanfare sound + praise banner |
| Time < 10s | Warning sound plays |
| Time runs out | Auto-advances to next word; on last word, retries the level |

**Timer:** driven by the current level's config (45s → 40s → 30s across the campaign), not a fixed 45 seconds.

**Visual effects:**
- **Dynamic Combo Badge**: Live streak tracking with escalating visual fire tiers (`#FFC300` standard fire, `#FF6D00` blazing flame, `#00FFFF` ultra-cosmic fire)
- **Level Clear Coin Burst**: 16 animated gold coins bursting outward with radiant halo and rolling number counter (`CoinRewardEffect.tsx`)
- Firecracker celebration on correct answers (2.6s)
- Board shake on wrong answers
- Streak messages: "ON FIRE!", "UNSTOPPABLE!", "BRILLIANT!", "GENIUS!"

---

### 2. Category Selection

**Where:** `app/category.tsx`

Choose which word theme to play before starting a level.

**Categories:**
| Category | Theme | Words |
|----------|-------|-------|
| 🚀 Space | Cosmos & Nebulae | 15 words (COSMIC, GALAXY, NEBULA...) |
| 🐾 Animals | Wildlife & Oceans | 15 words (TIGER, ELEPHANT, PENGUIN...) |
| 🍕 Food | Gourmet & Delights | 15 words (PIZZA, BURGER, SUSHI...) |
| ⚽ Sports | Athletics & Arenas | 15 words (SOCCER, TENNIS, CRICKET...) |

**Total: 60 words across all categories**

**How it works:**
1. Select a category (tap to highlight)
2. Tap **Start Quest**
3. System randomly picks 10 words from that category
4. Previously played words are skipped (deduplication)
5. If fewer than 10 words remain, the pool resets

---

### 3. Level Completion — Success Modal

**Where:** `app/success.tsx`

Displayed after completing all words in a level.

**Shows:**
- Solved word displayed letter-by-letter with glow effects
- Word definition
- Coins earned (+15)
- Energy gained (+1)
- **Next Level** button → returns to category selection

---

### 4. Progress Persistence & Reset

**Where:** `store/gameStore.ts` (Zustand `persist` + AsyncStorage), `app/settings.tsx`

The game **remembers where you left off** across app restarts:

- Saved automatically: current level, active word set, played-word history, coins, score, energy, selected realm, and audio preferences
- Stored locally on-device via `@react-native-async-storage/async-storage` (storage key: `wordexplorer-game-state`)
- On launch the persisted level loads (with a brief hydration phase to avoid a "Level 1" flash)

**Reset anytime:**
- **Settings → Game Progress → Reset Game Progress** — full factory reset (Level 1, empty word history, coins 500 / score 0 / energy 5), behind a confirmation dialog
- **Success modal "Play Again"** (after clearing all 8 levels) — restarts the campaign at Level 1 while keeping your coins/score/energy

---

### 5. Sound & Music Settings

**Where:** `app/settings.tsx`

Full audio control for background music and sound effects.

**Background Music:**
- Master on/off toggle
- 3 selectable tracks:
  - The Adventurers Hub (cyan)
  - Puzzle Flow (purple)
  - Pixel Rush (green)
- Volume slider (0%, 25%, 50%, 75%, 100%)

**Sound Effects:**
- Master SFX on/off toggle
- 7 individually toggleable effects:
  - Button Click (tap sounds)
  - Correct Answer (success chime)
  - Wrong Answer (error buzz)
  - Streak Bonus (combo fanfare)
  - Hint Used (reveal sound)
  - Time Warning (countdown alert)
  - Level Complete (celebration)
- Each effect has a **TEST** button for preview
- Volume slider (0%, 25%, 50%, 75%, 100%)

**Sound files location:** `assets/SFX/` (MP3 format)

---

### 6. In-App Shop ("Parent's Corner")

**Where:** `app/shop.tsx`

Monetization screen for purchasing subscriptions and credit packs.

**Current balance display:** Dynamic live credit balance (`useGameStore`) with instant free refill button

**Subscription plans:**
| Plan | Price | Features |
|------|-------|----------|
| Monthly Pass | $4.99/mo | Unlimited Words + Daily Rewards + 2,000 Bonus Credits |
| Annual Voyage | $49.99/yr | Everything in Monthly + Exclusive Avatar + 2 Months Free + 2,000 Bonus Credits |

**Credit packs:**
| Pack | Price | Bonus |
|------|-------|-------|
| 500 Credits | $4.99 | Instant +500 Credits (active in app) |
| 1100 Credits | $9.99 | +10% bonus / +1100 Credits (active in app) |

---

### 7. Pet / Profile

**Where:** `app/pet.tsx`

Virtual pet companion that evolves as you play.

**Current pet:** Astro-Pup (Level 12)

**Stats:**
- Evolution progress: 84% to next stage
- Star Dust: 1,450 (secondary currency)
- Rank: Cosmic (prestige tier)

**Evolution Items:**
- Bolt (x3) — owned
- Diamond (x1) — owned
- 3 locked items (unlock through gameplay)

**Modify Pet** button for customization (coming soon)

---

### 8. Awards Hub, Top 3 Podium & Medals

**Where:** `app/leaderboard.tsx`, `components/AchievementCard.tsx`, `components/ClaimRewardModal.tsx`, `config/awardsConfig.ts`

Kid- and parent-friendly dual-tab awards and competition destination.

**Features:**
- **Top Tab Switcher**: Switch effortlessly between `🏅 Leaderboard` and `🏆 My Medals`.
- **Top 3 Champions Podium Stage**:
  - 🥇 1st Place (Center / Tallest): Gold Crown 👑, glowing pedestal, top points
  - 🥈 2nd Place (Left): Silver medal & pedestal
  - 🥉 3rd Place (Right): Bronze medal & pedestal
- **Numbered Remaining Positions**: Big rank badges (`#4`, `#5`, `#6`...) with avatars and score details.
- **"Where You Stand" Personal Card**:
  - Shows current rank (`RANK #4 (YOU)`), level, score, and active flame streak.
  - Encouraging gap goal: *"⭐ Great effort! Only X pts to overtake Rank #3!"*.
- **"My Medals" Trophy Case**:
  - 10 collectible achievement badges with simple `Locked`, `Unlocked`, or `Claim` statuses.
  - Each medal card shows a short subtitle explaining how to earn it.
  - Ready-to-claim medals appear first for easy discovery.
  - One-tap **`CLAIM`** adds the medal's bonus coins to the player's wallet, saves the claimed state, plays the coin reward sound, and shows a simple confirmation modal.

**Medal goals and claim rewards:**

| Medal | Goal | Reward |
|-------|------|--------|
| First Flight | Reach Level 1 | 50 coins |
| Word Speller | Solve 10 words | 40 coins |
| 3x Combo Spark | Solve 3 words in a row | 50 coins |
| Cave Adventurer | Reach Level 3 | 60 coins |
| Word Explorer | Solve 25 words | 75 coins |
| 6x Blazing Streak | Solve 6 words in a row | 80 coins |
| Neon Challenger | Reach Level 5 | 100 coins |
| Lexicon Master | Solve 50 words | 120 coins |
| Treasure Hunter | Collect 750 coins | 80 coins |
| Cosmic Legend | Defeat the Level 8 boss | 200 coins |
- **Daily Duel Countdown**: Live timer until today's competition cycle resets.
- **"Play Today's Duel" CTA**: Jump directly into puzzle gameplay.

---

### 9. Journey Path

**Where:** `app/journey.tsx`

A player-facing progression screen opened by tapping the current level on the Play screen.

**Design:**
- A winding river path moves from the bottom of the screen to the top.
- Level cards zig-zag along both sides of the river.
- The player starts at Level 1 and climbs toward the Level 8 Volcano Boss.
- The cosmic color system uses green for completed levels, gold for the current level, gray for locked levels, and orange for the boss.
- The current level includes a **Continue** button to return to the game.

**Progression:** Complete levels in order to unlock the next ones. The existing `app/saga.tsx` remains available as the level testing screen.

---

### 10. Energy System

**Where:** `app/energy.tsx`

Energy gates how much you can play.

**How it works:**
- Start with 5 energy lives
- Energy consumed when starting a play session
- When energy runs out → "Out of Credits" modal appears

**Recovery options:**
- **Visit The Shop** — purchase more credits/energy
- **Wait for Daily Refill** — energy refills over time

---

## Game Economy

| Resource | Starting Value | How to Earn | How to Spend |
|----------|----------------|-------------|--------------|
| **Score** | 0 | +10 per correct word | Never |
| **Coins** | 500 | +2 per correct word | -10 per hint |
| **Energy** | 5 | Daily refill | -1 per play session |
| **Star Dust** | 1,450 | Unknown | Unknown |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Expo SDK 57 | Mobile framework |
| React Native | Cross-platform UI |
| NativeWind | TailwindCSS styling |
| Zustand | State management + persistence |
| @react-native-async-storage/async-storage | On-device progress saving |
| expo-audio | Background music + SFX |
| React Native Reanimated | Animations |
| Expo Router | File-based navigation |
| ElevenLabs | Sound effect creation |

---

## Sound Effects Reference

| Sound | File | Trigger |
|-------|------|---------|
| Click | `click.mp3` | Tile tap, slot tap, undo |
| Correct | `correct.mp3` | Correct word answer |
| Wrong | `wrong.mp3` | Wrong answer, incomplete submission |
| Streak | `streak.mp3` | 3 consecutive correct answers |
| Hint | `hint.mp3` | Hint button used |
| Time Warning | `warning.mp3` | Timer reaches 10 seconds |
| Level Complete | `level_complete.mp3` | All words in level completed |
| Coin Reward | `coin_reward.mp3` | Level clear +20 coin bonus awarded (100% original synthesis) |

**Music Tracks:**
| Track | File |
|-------|------|
| The Adventurers Hub | `The_Adventurers_Hub_2026-08-14T173908.mp4` |
| Puzzle Flow | `Puzzle_Flow_2026-08-14T174135.mp4` |
| Pixel Rush | `Pixel_Rush_2026-08-14T174250.mp4` |

---

*Feature guide for WordExplorer v1.0*