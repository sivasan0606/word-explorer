# Word Explorer Mobile

A feature-rich React Native word puzzle game built with Expo and TypeScript where players unjumble letters to conquer themed categories, earn coins, build massive combo streaks, evolve a cosmic companion, and progress through an 8-level campaign.

---

## 🎮 Features Overview

### 1. Word Puzzle Gameplay & Mechanics
- **Letter Placement & Board**: Tap jumbled cyan letter tiles to place them into dashed target slots; tap filled slots to return letters to the bank.
- **Smart Validation**: Tap **CHECK WORD** to test your word. Correct solves award **+10 Score** and **+2 Coins** with vibrant firecracker particle celebrations.
- **Smart Hint System**: Spend 10 coins to auto-place the correct letter for the first empty slot. **Auto-disables and dims** when all placeholder slots are already occupied, preventing accidental coin deductions.
- **Undo Functionality**: Remove the last placed letter to adjust your guess (enabled in Levels 1–7, disabled in Level 8 for ultimate mastery).
- **Dynamic Board Timers**: Countdown timers adapt per level (45s → 40s → 30s). Time-outs auto-advance words or retry the level on the final word.

### 2. Real-Time Dynamic Combo & Streak System
- **Live Multiplier Badge**: Tracks consecutive correct solves in real time (`1X STREAK`, `2X COMBO!`, `3X COMBO!`, `6X COMBO!`, etc.).
- **Dynamic Visual Intensity**:
  - **1X–2X**: Classic golden fire outline (`#FFC300`).
  - **3X–5X**: Blazing intense orange fire (`#FF6D00` with fiery gold badge).
  - **6X+**: Ultra-cosmic cyan flame (`#00FFFF` with high-glow lighting).
- **Milestone Fanfare**: Every 3 consecutive correct words (3x, 6x, 9x...) triggers celebratory sound fanfare (`streak.mp3`) and praise banners (*"ON FIRE! 🔥"*, *"UNSTOPPABLE! ⚡️"*, *"BRILLIANT! 🌟"*, *"GENIUS! 🧠"*).
- **Session Persistence**: Maintains streak momentum across levels as long as mistakes are avoided.

### 3. Level Progression & Campaign (8 Levels)
- **Strict Linear Progression**: 8 progressive tiers with unique environments:
  - **Level 1 (Explorer)**: 6 words (3-letter) · 45s timer · Sunny Meadow
  - **Level 2 (Explorer)**: 7 words (3-letter) · 45s timer · Crystal Caves
  - **Level 3 (Adventurer)**: 8 words (4–6 letters) · 45s timer · Deep Ocean
  - **Level 4 (Adventurer)**: 9 words (4–6 letters) · 45s timer · Abyss
  - **Level 5 (Challenger)**: 10 words (5–6 letters) · 40s timer · Neon Grid
  - **Level 6 (Challenger)**: 11 words (6–7 letters) · 40s timer · Tundra
  - **Level 7 (Master)**: 12 words (7–8 letters) · 30s timer · Dark Forest
  - **Level 8 (Master Finale)**: 13 words + **10-letter Boss Word (ATMOSPHERE)** · 30s timer · Volcano · *Undo Disabled*

### 4. Level Clear Rewards & Economy
- **Level Clear Bonus**: **+20 Bonus Coins** awarded upon clearing each level.
- **Eye-Catching Coin Reward Effect**: 16 physics-driven gold coins burst and float with radiant golden halo lighting and smooth number counter roll-up (`+20 COINS`).
- **Copyright-Free Currency Sound**: 100% original synthesized cascading currency filling chime (`coin_reward.mp3`).
- **Explorer Treasury & Energy**: Coins and energy (stamina) displayed in top app bar.

### 5. In-Game Shop & Power-Ups (Explorer Vault)
- **Streak Guardian**: Protects against losing streak multipliers on a wrong submission.
- **Time Freeze**: Pauses countdown timer to give extra thinking time.
- **Super Clue**: Reveals multiple letters or definitions.
- **Energy Refills**: Restore stamina to keep playing.

### 6. Cosmic Pet Evolution
- **Pet Companion**: Level up and evolve your companion by solving puzzles, hitting streaks, and clearing levels.

### 7. Player Journey Path
- **Winding River Map**: Shows progression from the bottom of the screen toward the Level 8 Volcano Boss.
- **Zig-Zag Level Cards**: Levels alternate from side to side along the river for a game-like path.
- **Clear Status Colors**: Green completed levels, gold current level, gray locked levels, and orange boss level.
- **Resume Action**: The current level includes a **CONTINUE** button to return directly to gameplay.
- **Entry Point**: Tap the current level information on the Play screen to open `app/journey.tsx`.

### 8. Audio & Customization System
- **Background Music**: 3 curated tracks (*The Adventurers Hub*, *Puzzle Flow*, *Pixel Rush*) with volume sliders and quick mute toggle.
- **Original Copyright-Free SFX**: 8 custom synthesized sound effects (Click, Correct, Wrong, Streak Bonus, Hint, Time Warning, Level Complete, Coin Reward) with individual toggle settings.

### 9. Kid-Friendly Awards Hub & Top 3 Podium Leaderboard
- **Visual Top 3 Podium**: Side-by-side podium stage featuring #1 Gold Crown 👑 (center/tallest pedestal), #2 Silver 🥈, and #3 Bronze 🥉 so kids immediately understand who is leading.
- **Clear Position Rankings**: Unambiguous numbered list for remaining explorers (`#4`, `#5`, `#6`...) with avatars and score tags.
- **"Where You Stand" Card**: Highlights child's current standing with a bright `YOU` badge, score, active streak, and motivating goal lines (*"⭐ Only 250 pts to overtake Rank #3!"*).
- **"My Medals" Trophy Case**:
  - 10 collectible medals with simple `Locked`, `Unlocked`, or `Claim` statuses.
  - Each medal shows a short subtitle explaining how to earn it.
  - Ready-to-claim medals appear first.
  - Tapping **`CLAIM`** adds the medal's bonus coins to the player's balance, plays the coin reward sound, shows a confirmation modal, and persists the claimed state across app restarts.
  - Rewards range from 40 to 200 coins depending on the medal.

---

## 🛠️ Tech Stack

- **Framework**: React Native with Expo (SDK 52)
- **Routing**: Expo Router
- **State Management**: Zustand with persistent storage (`AsyncStorage`)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Animations & FX**: React Native Reanimated, SVG gradients
- **Typography**: Google Fonts (Space Grotesk)
- **Audio Engine**: `expo-audio`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd word-explorer-mobile
npm install
```

### Running Locally
```bash
# Start Metro bundler
npm run start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android

# Run Web build
npm run web
```

### Running Tests
```bash
npm test
```

---

## 📁 Project Structure

```
word-explorer-mobile/
├── app/                     # Screens (Expo Router)
│   ├── _layout.tsx         # Root layout with providers & fonts
│   ├── index.tsx           # Main game board & puzzle solver
│   ├── category.tsx        # Category & realm selector
│   ├── success.tsx         # Level cleared celebration & coin bonus
│   ├── settings.tsx        # Audio, track & gameplay settings
│   ├── shop.tsx            # Explorer Vault power-up shop
│   ├── pet.tsx             # Cosmic pet evolution screen
│   ├── energy.tsx          # Energy & stamina management
│   └── leaderboard.tsx     # Awards Hub (Top 3 Podium, Ranks & Medals)
├── components/              # UI components & effects
│   ├── TopAppBar.tsx       # Score, coins & energy header
│   ├── BottomNavBar.tsx    # 5-tab persistent navigation
│   ├── AchievementCard.tsx # Simple medal card with goal subtitle and claim action
│   ├── ClaimRewardModal.tsx# Celebratory medal claim reward pop-up
│   └── effects/            
│       ├── HybridEffect.tsx    # Confetti & streak fanfare overlay
│       └── CoinRewardEffect.tsx# Animated bursting coins & reward card
├── config/                 # Level, progression & awards configurations
│   ├── levelConfig.ts
│   └── awardsConfig.ts
├── data/                   # Categorized word pools & dictionaries
│   ├── categoriesData.ts
│   └── levelWords.ts
├── store/                  # Zustand global game state & economy
│   └── gameStore.ts
├── lib/                    # Audio & sound manager
│   └── soundManager.ts
└── assets/                 # Audio files, icons & fonts
    └── SFX/
```

---

## 📄 License & Audio Rights

- Code: MIT License
- Audio Assets: 100% original, copyright-free sound effects created specifically for Word Explorer Mobile (see [`LICENSES.md`](LICENSES.md)).