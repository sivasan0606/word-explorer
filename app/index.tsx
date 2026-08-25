import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore, selectCanUndo } from '../store/gameStore';
import { getLevelConfig, LEVEL_THEMES, hexToRgba } from '../config/levelConfig';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat, withSpring } from 'react-native-reanimated';
import { playSfx } from '../lib/soundManager';
import HybridEffect from '../components/effects/HybridEffect';

interface JumbledLetter {
  id: string;
  letter: string;
  placedSlotIndex: number | null;
}

export default function JumbleBoard() {
  const insets = useSafeAreaInsets();

  const activeLevel = useGameStore((state) => state.activeLevel);
  const levelNumber = useGameStore((state) => state.currentLevel);
  const currentWordIndex = useGameStore((state) => state.currentWordIndex);
  const setCurrentWordIndex = useGameStore((state) => state.setCurrentWordIndex);
  const advanceLevel = useGameStore((state) => state.advanceLevel);
  const setLastCompletedWord = useGameStore((state) => state.setLastCompletedWord);
  const canUndo = useGameStore(selectCanUndo);
  const addScore = useGameStore((state) => state.addScore);
  const addCoins = useGameStore((state) => state.addCoins);
  const spendCoins = useGameStore((state) => state.spendCoins);

  const score = useGameStore((state) => state.score);
  const coins = useGameStore((state) => state.coins);
  const energy = useGameStore((state) => state.energy);
  const hints = useGameStore((state) => state.hints);
  const streakShields = useGameStore((state) => state.streakShields);
  const chronoBoosters = useGameStore((state) => state.chronoBoosters);
  const streak = useGameStore((state) => state.streak);
  const incrementStreak = useGameStore((state) => state.incrementStreak);
  const resetStreak = useGameStore((state) => state.resetStreak);

  const levelConfig = getLevelConfig(levelNumber);
  const theme = LEVEL_THEMES[levelConfig.theme];

  const [isWordSolved, setIsWordSolved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(levelConfig.timerSeconds);
  const [streakMessage, setStreakMessage] = useState<string | null>(null);
  const [showFirecracker, setShowFirecracker] = useState(false);
  const currentTargetWordObj = activeLevel.targetWords[currentWordIndex];
  const currentTargetWord = currentTargetWordObj ? currentTargetWordObj.word : '';

  const [targetSlots, setTargetSlots] = useState<(string | null)[]>(Array(currentTargetWord.length).fill(null));
  const [jumbledLetters, setJumbledLetters] = useState<JumbledLetter[]>([]);

  const isPlaying = useGameStore((state) => state.isMusicPlaying);
  const setIsPlaying = useGameStore((state) => state.setIsMusicPlaying);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  const shakeOffset = useSharedValue(0);

  useEffect(() => {
    if (!currentTargetWord) return;

    setTimeLeft(levelConfig.timerSeconds);
    const letters = currentTargetWord.split('');
    // Shuffle letters until they don't match the original word (or fallback after 10 tries)
    let shuffled = [...letters];
    let attempts = 0;
    do {
      shuffled.sort(() => Math.random() - 0.5);
      attempts++;
    } while (shuffled.join('') === currentTargetWord && attempts < 10);
    setJumbledLetters(
      shuffled.map((letter, index) => ({
        id: `${letter}-${index}`,
        letter,
        placedSlotIndex: null,
      }))
    );
    setTargetSlots(Array(currentTargetWord.length).fill(null));
  }, [currentTargetWord]);

  useEffect(() => {
    if (isWordSolved) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timerId);
  }, [isWordSolved]);

  useEffect(() => {
    if (timeLeft === 10 && !isWordSolved) {
      playSfx('warning');
    }
  }, [timeLeft, isWordSolved]);

  useEffect(() => {
    if (timeLeft !== 0 || isWordSolved) return;

    resetStreak();
    if (currentWordIndex < activeLevel.targetWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setIsWordSolved(false);
      return;
    }

    playSfx('wrong');
    setStreakMessage("TIME'S UP! RETRYING LEVEL");
    setTimeout(() => setStreakMessage(null), 2000);
    setCurrentWordIndex(0);
    setIsWordSolved(false);
    setTimeLeft(levelConfig.timerSeconds);
    clearBoard();
  }, [
    timeLeft,
    isWordSolved,
    currentWordIndex,
    activeLevel.targetWords.length,
    levelConfig.timerSeconds,
    resetStreak,
  ]);

  const handleLetterTap = (letterObj: JumbledLetter, letterIndex: number) => {
    if (letterObj.placedSlotIndex !== null) return; // Already placed

    const emptySlotIndex = targetSlots.findIndex((slot) => slot === null);
    if (emptySlotIndex === -1) return; // No empty slots

    playSfx('click');

    const newSlots = [...targetSlots];
    newSlots[emptySlotIndex] = letterObj.id;
    setTargetSlots(newSlots);

    const newJumbled = [...jumbledLetters];
    newJumbled[letterIndex].placedSlotIndex = emptySlotIndex;
    setJumbledLetters(newJumbled);
  };

  const handleSlotTap = (slotIndex: number) => {
    const letterId = targetSlots[slotIndex];
    if (!letterId) return;

    playSfx('click');

    const newSlots = [...targetSlots];
    newSlots[slotIndex] = null;
    setTargetSlots(newSlots);

    const newJumbled = [...jumbledLetters];
    const letterIndex = newJumbled.findIndex((l) => l.id === letterId);
    if (letterIndex !== -1) {
      newJumbled[letterIndex].placedSlotIndex = null;
      setJumbledLetters(newJumbled);
    }
  };

  const triggerShake = () => {
    shakeOffset.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 100 }), 3, true),
      withTiming(0, { duration: 50 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeOffset.value }],
    };
  });

  const clearBoard = () => {
    setJumbledLetters(prev => prev.map(l => ({ ...l, placedSlotIndex: null })));
    setTargetSlots(Array(currentTargetWord.length).fill(null));
  };

  const checkWord = () => {
    // Prevent multiple submissions while transitioning
    if (isWordSolved) return;

    // Make sure all slots are filled
    if (targetSlots.includes(null)) {
      playSfx('wrong');
      triggerShake();
      setTimeout(clearBoard, 400);
      return;
    }

    const formedWord = targetSlots
      .map((id) => jumbledLetters.find((l) => l.id === id)?.letter)
      .join('');

    if (formedWord === currentTargetWord) {
      addScore(10);
      addCoins(2);
      setIsWordSolved(true);
      setShowFirecracker(true);

      const newStreak = incrementStreak();

      if (newStreak > 0 && newStreak % 3 === 0) {
        playSfx('streak');
        const messages = ["ON FIRE! 🔥", "UNSTOPPABLE! ⚡️", "BRILLIANT! 🌟", "GENIUS! 🧠"];
        setStreakMessage(`${newStreak}X! ${messages[Math.floor(Math.random() * messages.length)]}`);
      } else {
        playSfx('correct');
      }

      setTimeout(() => {
        setShowFirecracker(false);
      }, 2600);

      setTimeout(() => {
        setStreakMessage(null);
        if (currentWordIndex < activeLevel.targetWords.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setIsWordSolved(false);
        } else {
          // Level cleared: record the solved word, advance progression
          // (preloading the next level's config), then show the success modal.
          playSfx('levelComplete');
          if (currentTargetWordObj) {
            setLastCompletedWord(currentTargetWordObj);
          }
          advanceLevel();
          router.push('/success');
        }
      }, 2000);
    } else {
      const shieldUsed = useGameStore.getState().useStreakShield();
      if (shieldUsed) {
        playSfx('streak');
        Alert.alert(
          '🛡️ Streak Guardian Shield Activated!',
          `Your active ${streak >= 1 ? `${streak}X combo streak` : 'streak'} was protected from resetting to 0! (1 shield used)`
        );
        triggerShake();
        setTimeout(clearBoard, 400);
      } else {
        playSfx('wrong');
        resetStreak();
        triggerShake();
        setTimeout(clearBoard, 400);
      }
    }
  };

  const useHint = () => {
    if (isWordSolved) return;
    const emptySlotIndex = targetSlots.findIndex((slot) => slot === null);
    if (emptySlotIndex === -1) {
      return;
    }

    // Use free hint from inventory if available, otherwise pay 10 coins
    const usedInventoryCharge = useGameStore.getState().useHintCharge();
    let paidWithCoins = false;
    if (!usedInventoryCharge) {
      paidWithCoins = spendCoins(10); // Cost of hint is 10 coins
    }

    if (usedInventoryCharge || paidWithCoins) {
      playSfx('hint');
      const correctLetter = currentTargetWord[emptySlotIndex];
      // Find this letter in jumbled bank that isn't placed yet
      const availableLetterIdx = jumbledLetters.findIndex((l) => l.letter === correctLetter && l.placedSlotIndex === null);

      if (availableLetterIdx !== -1) {
        handleLetterTap(jumbledLetters[availableLetterIdx], availableLetterIdx);
      } else {
        // Find it in placed but wrong position, remove it, then place it
        const misplacedLetterIdx = jumbledLetters.findIndex((l) => l.letter === correctLetter && l.placedSlotIndex !== null && l.placedSlotIndex !== emptySlotIndex);
        if (misplacedLetterIdx !== -1) {
           const lObj = jumbledLetters[misplacedLetterIdx];
           const currentSlot = lObj.placedSlotIndex!;

           // clear from current slot
           const newSlots = [...targetSlots];
           newSlots[currentSlot] = null;

           // put in new slot
           newSlots[emptySlotIndex] = lObj.id;
           setTargetSlots(newSlots);

           const newJumbled = [...jumbledLetters];
           newJumbled[misplacedLetterIdx].placedSlotIndex = emptySlotIndex;
           setJumbledLetters(newJumbled);
        }
      }
    } else {
      Alert.alert(
        'Insufficient Coins / Hints',
        'You need 10 coins or a Hint Pack from the Explorer Vault to reveal a letter hint. Visit the Vault or keep solving words!',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Explorer Vault',
            onPress: () => {
              router.push('/shop');
            },
          },
        ]
      );
    }
  };

  const handleUseChronoBooster = () => {
    if (isWordSolved) return;
    const usedCharge = useGameStore.getState().useChronoBooster();
    let usedCoins = false;
    if (!usedCharge) {
      usedCoins = spendCoins(20); // Fallback: 20 coins for quick +30s
    }

    if (usedCharge || usedCoins) {
      playSfx('streak');
      setTimeLeft((prev) => prev + 30);
      Alert.alert('⏱️ Chrono Booster Activated!', '+30 Seconds added to your countdown timer!');
    } else {
      Alert.alert(
        'Insufficient Chrono Boosters',
        'You need 20 coins or a Chrono Booster pack from the Explorer Vault to extend the timer.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Explorer Vault',
            onPress: () => {
              router.push('/shop');
            },
          },
        ]
      );
    }
  };

  const handleUndo = () => {
    // Find the last filled slot
    let lastFilledSlotIndex = -1;
    for (let i = targetSlots.length - 1; i >= 0; i--) {
      if (targetSlots[i] !== null) {
        lastFilledSlotIndex = i;
        break;
      }
    }

    if (lastFilledSlotIndex !== -1) {
      const letterId = targetSlots[lastFilledSlotIndex];
      // clear the slot
      const newSlots = [...targetSlots];
      newSlots[lastFilledSlotIndex] = null;
      setTargetSlots(newSlots);

      // mark letter as unplaced
      const newJumbled = [...jumbledLetters];
      const jumbledIdx = newJumbled.findIndex((l) => l.id === letterId);
      if (jumbledIdx !== -1) {
        newJumbled[jumbledIdx].placedSlotIndex = null;
        setJumbledLetters(newJumbled);
      }
    }
  };

  const isBossWordActive = currentTargetWordObj?.word === 'ATMOSPHERE';
  const activeTheme = isBossWordActive ? LEVEL_THEMES.cosmicGold : theme;

  return (
    <View className="flex-1" style={{ backgroundColor: activeTheme.background }}>
      <View
        className="flex-row items-center justify-between w-full px-4 pt-12 pb-4 z-50 border-b border-surface-variant/30"
        style={{ backgroundColor: hexToRgba(activeTheme.background, 0.8) }}
      >
        <TouchableOpacity onPress={() => { router.push('/category'); }} className="p-2">
          <MaterialIcons name="arrow-back" size={28} color={activeTheme.accent} />
        </TouchableOpacity>

        <View className="flex-row items-center flex-1 justify-center">
          <Text className="font-bold text-xl tracking-wide font-space" style={{ color: activeTheme.accent }}>
            Score: {score}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Explorer Treasury',
              `Current Balance: 🪙 ${coins} Coins | 🔥 ${energy} Energy\n\nVisit the Explorer Vault for power-ups and stamina.`,
              [
                { text: 'Close', style: 'cancel' },
                {
                  text: 'Open Vault',
                  onPress: () => {
                    router.push('/shop');
                  },
                },
              ]
            )
          }
          activeOpacity={0.7}
          className="flex-row items-center bg-surface-variant/50 px-3 py-1.5 rounded-full mr-2 active:scale-95"
        >
          <Text className="text-primary text-base font-semibold mr-1">🔥 {energy}</Text>
          <Text className="text-primary text-base font-semibold mx-1">•</Text>
          <Text className="text-primary text-base font-semibold ml-1">🪙 {coins}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleMusic}
          style={isPlaying ? styles.musicToggleOn : styles.musicToggleOff}
          className="items-center justify-center rounded-full active:scale-95"
        >
          <MaterialIcons
            name={isPlaying ? "music-note" : "music-off"}
            size={22}
            color={isPlaying ? "#4cd7f6" : "#869397"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Firecracker Effect Overlay */}
        {showFirecracker && <HybridEffect />}

        {/* Streak Indicator & Active Shield */}
        <View className="flex-row items-center justify-center gap-3 mb-8 mt-4">
          <View
            style={[
              styles.streakBadge,
              streak >= 6
                ? styles.streakBadgeUltra
                : streak >= 3
                ? styles.streakBadgeFire
                : null,
            ]}
            className="flex-row items-center gap-2 px-4 py-2 rounded-full"
          >
            <MaterialIcons
              name="local-fire-department"
              size={24}
              color={
                streak >= 6
                  ? "#00FFFF"
                  : streak >= 3
                  ? "#FF6D00"
                  : streak > 0
                  ? "#FFC300"
                  : "#869397"
              }
            />
            <Text
              style={[
                styles.trophyGoldText,
                streak >= 6
                  ? styles.trophyUltraText
                  : streak >= 3
                  ? styles.trophyFireText
                  : streak === 0
                  ? styles.trophyMutedText
                  : null,
              ]}
              className="text-xl font-bold italic font-space"
            >
              {streak >= 2 ? `${streak}X COMBO!` : streak === 1 ? '1X STREAK' : 'START COMBO'}
            </Text>
          </View>

          {streakShields > 0 && (
            <View
              style={styles.shieldBadge}
              className="flex-row items-center gap-1.5 px-3 py-2 rounded-full"
            >
              <MaterialIcons name="shield" size={18} color="#c084fc" />
              <Text className="text-xs font-bold font-space text-[#c084fc]">
                {streakShields} SHIELD{streakShields > 1 ? 'S' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Level Info */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.push('/journey')}
          className="items-center mb-8"
        >
          <View className="flex-row items-center gap-1">
            <Text className="text-on-surface-variant text-xl uppercase tracking-widest font-space font-semibold">
              {activeLevel.levelName}
            </Text>
            <MaterialIcons name="tune" size={18} color="#4cd7f6" />
          </View>
          <Text className="text-on-surface-variant text-xs mt-1 opacity-75">
            Word {currentWordIndex + 1} of {activeLevel.targetWords.length}
            {isBossWordActive ? ' · BOSS WORD' : ''} &bull; <Text className="text-primary font-semibold">Tap to Change Level</Text>
          </Text>

          <View className="flex-row items-center justify-center gap-3 mt-3">
            <View className="flex-row items-center bg-surface-variant/30 px-4 py-2 rounded-full border border-surface-variant">
              <MaterialIcons name="timer" size={22} color={timeLeft <= 10 ? "#ef4444" : activeTheme.accent} />
              <Text
                className="font-bold text-lg ml-2 font-space"
                style={{ color: timeLeft <= 10 ? '#ef4444' : activeTheme.accent }}
              >
                0:{timeLeft.toString().padStart(2, '0')}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleUseChronoBooster}
              activeOpacity={0.8}
              style={styles.chronoBtn}
              className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-full active:scale-95 border"
            >
              <MaterialIcons name="add-alarm" size={18} color="#34d399" />
              <Text className="text-xs font-bold text-[#34d399] font-space">
                +30s{chronoBoosters > 0 ? ` (${chronoBoosters})` : ''}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="w-full bg-surface-variant h-2 rounded-full mt-4 overflow-hidden border border-outline-variant">
            <View className="bg-primary-container h-full rounded-full" style={{ width: `${((currentWordIndex + 1) / activeLevel.targetWords.length) * 100}%` }} />
          </View>
        </TouchableOpacity>

        {/* Dedicated Space for Streak Message */}
        <View className="h-16 items-center justify-center w-full mb-4">
          {streakMessage && (
            <Animated.View pointerEvents="none" className="items-center justify-center" style={{ elevation: 10 }}>
              <Text className="text-4xl sm:text-5xl font-black italic text-center font-space" style={{ textShadowColor: '#FF007F', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 5, color: '#00FFFF' }}>
                {streakMessage}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Spelling Line Area */}
        <Animated.View style={[animatedStyle]} className="flex-1 items-center justify-center gap-12 mt-2">
          {/* Target Slots */}
          <View className="flex-row flex-wrap justify-center gap-3 w-full px-2">
            {targetSlots.map((letterId, index) => {
              const letterObj = letterId ? jumbledLetters.find((l) => l.id === letterId) : null;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => handleSlotTap(index)}
                  style={styles.targetSlot}
                  className="w-12 h-16 sm:w-14 sm:h-16 rounded-xl items-center justify-center relative"
                >
                  {letterObj ? (
                    <View style={[styles.tileCyan, { position: 'absolute', top: 4, bottom: 8, left: 4, right: 4 }]} className="rounded-lg items-center justify-center">
                      <Text className="font-bold text-2xl sm:text-3xl font-space text-[#1A1C29]">
                        {letterObj.letter}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.spellingLine, { opacity: 0.5 }]} className="absolute bottom-1 w-8" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Jumbled Tiles Bank */}
          <View className="flex-row flex-wrap justify-center gap-4 w-full px-2 mt-8">
            {jumbledLetters.map((letterObj, i) => {
              const placed = letterObj.placedSlotIndex !== null;
              return (
                <TouchableOpacity
                  key={letterObj.id}
                  onPress={() => handleLetterTap(letterObj, i)}
                  style={[styles.tileCyan, { width: 60, height: 60, opacity: placed ? 0.3 : 1 }]}
                  className="rounded-xl items-center justify-center"
                  disabled={placed}
                  activeOpacity={0.7}
                >
                  <Text className="font-bold text-2xl font-space text-[#1A1C29]">{letterObj.letter}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Bottom Actions */}
        <View className="flex-row gap-4 w-full mt-12 mb-8 items-center justify-center px-4">
          <TouchableOpacity
            onPress={handleUndo}
            disabled={!canUndo}
            activeOpacity={canUndo ? 0.7 : 1}
            style={canUndo ? styles.hintGold : styles.actionDisabled}
            className="w-16 h-16 rounded-2xl items-center justify-center"
          >
            <MaterialIcons name="undo" size={32} color={canUndo ? "#FFC300" : "#565B6B"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={useHint}
            disabled={!targetSlots.includes(null) || isWordSolved}
            activeOpacity={targetSlots.includes(null) && !isWordSolved ? 0.7 : 1}
            style={[
              targetSlots.includes(null) && !isWordSolved ? styles.hintGold : styles.actionDisabled,
              styles.hintBtnContainer,
            ]}
            className="w-16 h-16 rounded-2xl items-center justify-center relative"
          >
            <MaterialIcons
              name="lightbulb"
              size={32}
              color={targetSlots.includes(null) && !isWordSolved ? "#FFC300" : "#565B6B"}
            />
            {hints > 0 && (
              <View style={styles.hintBadge}>
                <Text style={styles.hintBadgeText}>
                  {hints > 99 ? '99+' : hints}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={checkWord}
            style={styles.actionOrange}
            className="flex-1 h-16 rounded-2xl items-center justify-center"
          >
            <Text className="font-bold text-[#1A1C29] text-xl tracking-wide uppercase font-space">
              CHECK WORD
            </Text>
          </TouchableOpacity>
        </View>

        {/* Solved Word & Description Revealed on Success */}
        {currentTargetWordObj && isWordSolved && (
          <View className="items-center px-4 mb-8">
            <View
              className="w-full rounded-2xl p-4 items-center border border-primary/40"
              style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)' }}
            >
              <Text
                className="font-bold text-2xl tracking-widest font-space mb-1 uppercase"
                style={{ color: activeTheme.accent }}
              >
                {currentTargetWordObj.word}
              </Text>
              <Text className="text-on-surface text-center font-space italic text-base opacity-90">
                "{currentTargetWordObj.description}"
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNavBar activeTab="Play" />
    </View>
  );
}

const styles = StyleSheet.create({
  streakBadge: {
    backgroundColor: '#1A1C29',
    borderColor: '#FFC300',
    borderWidth: 1,
    shadowColor: '#FFC300',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  streakBadgeFire: {
    backgroundColor: '#2A1400',
    borderColor: '#FF6D00',
    borderWidth: 1.5,
    shadowColor: '#FF6D00',
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 6,
  },
  streakBadgeUltra: {
    backgroundColor: '#002B36',
    borderColor: '#00FFFF',
    borderWidth: 2,
    shadowColor: '#00FFFF',
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 8,
  },
  shieldBadge: {
    backgroundColor: '#1E1435',
    borderColor: '#c084fc',
    borderWidth: 1.5,
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  trophyGoldText: {
    color: '#FFC300',
  },
  trophyFireText: {
    color: '#FF9100',
  },
  trophyUltraText: {
    color: '#00FFFF',
  },
  trophyMutedText: {
    color: '#869397',
  },
  targetSlot: {
    borderColor: '#7C3AED',
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  tileCyan: {
    backgroundColor: '#06B6D4',
    borderBottomWidth: 4,
    borderBottomColor: '#00839B',
  },
  spellingLine: {
    borderBottomWidth: 4,
    borderBottomColor: '#06B6D4',
  },
  hintGold: {
    backgroundColor: 'rgba(255, 195, 0, 0.15)',
    borderColor: '#FFC300',
    borderWidth: 2,
  },
  hintBtnContainer: {
    position: 'relative',
  },
  hintBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFC300',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#101322',
  },
  hintBadgeText: {
    color: '#101322',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Space Grotesk',
  },
  actionDisabled: {
    backgroundColor: 'rgba(50, 52, 66, 0.5)',
    borderColor: 'rgba(134, 147, 151, 0.3)',
    borderWidth: 2,
  },
  actionOrange: {
    backgroundColor: '#FF6D00',
    borderBottomWidth: 4,
    borderBottomColor: '#CC5800',
  },
  chronoBtn: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: '#34d399',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  musicToggleOn: {
    backgroundColor: 'rgba(76, 215, 246, 0.15)',
    borderWidth: 1.5,
    borderColor: '#4cd7f6',
    width: 40,
    height: 40,
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  musicToggleOff: {
    backgroundColor: 'rgba(50, 52, 66, 0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(134, 147, 151, 0.3)',
    width: 40,
    height: 40,
  }
});