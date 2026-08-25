import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import TopAppBar from '../components/TopAppBar';
import CoinRewardEffect from '../components/effects/CoinRewardEffect';
import { useGameStore, LEVEL_CLEAR_COIN_BONUS } from '../store/gameStore';
import { getLevelConfig, MAX_LEVEL } from '../config/levelConfig';
import { playSfx } from '../lib/soundManager';

export default function WordSolved() {
  const lastCompletedWord = useGameStore((state) => state.lastCompletedWord);
  const currentLevel = useGameStore((state) => state.currentLevel);
  const gameCompleted = useGameStore((state) => state.gameCompleted);
  const resetProgression = useGameStore((state) => state.resetProgression);
  const addCoins = useGameStore((state) => state.addCoins);

  const hasAwardedCoins = useRef(false);

  useEffect(() => {
    if (!hasAwardedCoins.current) {
      hasAwardedCoins.current = true;
      addCoins(LEVEL_CLEAR_COIN_BONUS);
      const timer = setTimeout(() => {
        playSfx('coinReward');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [addCoins]);

  const solvedWord = lastCompletedWord ?? {
    word: 'GALAXY',
    description: 'A system of millions or billions of stars.',
  };

  const completedLevel = gameCompleted ? MAX_LEVEL : Math.max(1, currentLevel - 1);
  const clearedConfig = getLevelConfig(completedLevel);
  const letters = solvedWord.word.split('');

  const handleContinue = () => {
    if (gameCompleted) {
      resetProgression();
    }
    router.push('/category');
  };

  return (
    <View className="flex-1 bg-background relative">
      {/* Background (blurred game board feel) */}
      <View className="absolute inset-0 bg-surface-container-lowest opacity-50 z-0" />
      <View className="absolute top-0 w-full z-10">
        <TopAppBar />
      </View>

      {/* Background fake board */}
      <View className="absolute inset-0 items-center justify-center z-0 opacity-30">
        <View className="flex-row gap-2 flex-wrap justify-center px-4">
          {letters.map((letter, i) => (
            <View key={i} className="w-12 h-12 rounded-lg bg-surface-variant border-2 border-primary items-center justify-center">
              <Text className="text-primary font-bold text-xl">{letter}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Success Modal Overlay */}
      <View className="flex-1 bg-background/80 justify-center items-center p-4 z-20">

        {/* Modal Container */}
        <View style={styles.pulseGlow} className="relative bg-[#7C3AED] rounded-[24px] border-4 border-[#4cd7f6] w-full max-w-sm items-center p-8 mt-12">

          {/* Icon/Star */}
          <View style={styles.starShadow} className="absolute -top-12 bg-background rounded-full p-2 border-4 border-[#FFC300] items-center justify-center">
            <MaterialIcons name={gameCompleted ? 'emoji-events' : 'star'} size={48} color="#FFC300" />
          </View>

          {/* Success Text */}
          <Text className="text-3xl text-[#FFC300] font-bold font-space mt-6 mb-2 uppercase tracking-wider text-center shadow-sm shadow-black">
            {gameCompleted ? 'GAME COMPLETE!' : 'LEVEL CLEARED!'}
          </Text>
          <Text className="text-white text-base mb-6 font-space opacity-90 text-center">
            {gameCompleted
              ? `All ${MAX_LEVEL} levels conquered. You are a Word Explorer legend!`
              : `${clearedConfig.tier} · Level ${completedLevel}`}
          </Text>

          {/* Word Display */}
          <View className="flex-row gap-2 mb-8 flex-wrap justify-center">
            {letters.map((letter, i) => (
              <View key={i} style={styles.letterGlow} className="w-11 h-11 sm:w-12 sm:h-12 bg-[#4cd7f6] rounded-xl items-center justify-center">
                <Text className="text-3xl sm:text-4xl text-[#003640] font-bold font-space">{letter}</Text>
              </View>
            ))}
          </View>

          {/* Definition */}
          <View className="bg-[#323442]/30 rounded-xl p-4 mb-4 w-full border border-surface-variant/50">
            <Text className="text-white text-base leading-relaxed font-space italic text-center">
              "{solvedWord.description}"
            </Text>
          </View>

          {/* Level Clear Coin Reward Bonus */}
          <CoinRewardEffect bonusAmount={LEVEL_CLEAR_COIN_BONUS} />

          {/* Progress Badge */}
          <View className="flex-row items-center gap-2 mb-6 mt-2 bg-[#323442]/40 px-4 py-2 rounded-full border border-surface-variant/50">
            <MaterialIcons name={gameCompleted ? 'military-tech' : 'flag'} size={20} color="#FFC300" />
            <Text className="text-white font-semibold font-space">
              {gameCompleted ? `Final Boss · Level ${MAX_LEVEL} defeated` : `Level ${completedLevel} of ${MAX_LEVEL} complete`}
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.orangeBtn}
            className="w-full rounded-xl py-4 flex-row items-center justify-center gap-2 active:translate-y-1"
            onPress={handleContinue}
          >
            <Text className="text-[#1A1C29] font-bold text-xl uppercase tracking-wide font-space">
              {gameCompleted ? 'Play Again' : 'Next Level'}
            </Text>
            <MaterialIcons name="arrow-forward" size={24} color="#1A1C29" />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pulseGlow: {
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  starShadow: {
    shadowColor: '#FFC300',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  letterGlow: {
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  orangeBtn: {
    backgroundColor: '#FF6D00',
    shadowColor: '#CC5500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    borderBottomWidth: 4,
    borderBottomColor: '#CC5500',
  }
});