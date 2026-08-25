import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { router } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { LEVEL_CONFIGS, MAX_LEVEL, getLevelConfig } from '../config/levelConfig';

const CATEGORY_OPTIONS = [
  { id: 'space', label: '🚀 Space', color: '#4cd7f6' },
  { id: 'animals', label: '🐾 Animals', color: '#34d399' },
  { id: 'food', label: '🍕 Food', color: '#fbbf24' },
  { id: 'sports', label: '⚽ Sports', color: '#c084fc' },
  { id: 'anything', label: '✨ Anything', color: '#f472b6' },
];

export default function SagaLevelSelector() {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const selectedCategoryId = useGameStore((state) => state.selectedCategoryId);
  const jumpToLevel = useGameStore((state) => state.jumpToLevel);
  const restoreCredits = useGameStore((state) => state.restoreCredits);
  const resetGame = useGameStore((state) => state.resetGame);

  const [activeCategory, setActiveCategory] = useState(selectedCategoryId || 'space');

  const handleLaunchLevel = (lvlNum: number) => {
    jumpToLevel(lvlNum, activeCategory);
    router.push('/');
  };

  const handleAddTestingCoins = () => {
    restoreCredits(500);
    Alert.alert('Tester Bonus', '🪙 +500 Coins added to your treasury balance!');
  };

  const handleResetForTesting = () => {
    Alert.alert(
      'Reset Progression',
      'Reset game to Level 1 and default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetGame();
            Alert.alert('Reset Complete', 'Game reset to Level 1.');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <TopAppBar />

      <ScrollView className="flex-1 px-4 py-5" contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Header */}
        <View className="items-center mb-5">
          <View className="flex-row items-center gap-2 mb-1">
            <MaterialIcons name="science" size={26} color="#4cd7f6" />
            <Text className="text-3xl text-white font-bold font-space">
              Level Testing Lab
            </Text>
          </View>
          <Text className="text-on-surface-variant text-center font-space text-sm px-2">
            Jump freely into any of the {MAX_LEVEL} campaign levels with custom categories & test all game mechanics.
          </Text>
        </View>

        {/* Quick Testing Bar */}
        <View style={styles.quickBarCard} className="p-4 rounded-2xl mb-5 border">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-[#4cd7f6] font-space">
              🧪 Quick Level Jump
            </Text>
            <Text className="text-xs text-on-surface-variant font-space">
              Active: Level {currentLevel}
            </Text>
          </View>

          {/* Quick Jump Buttons */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {LEVEL_CONFIGS.map((config) => {
              const isSelected = config.level === currentLevel;
              const isBoss = config.appendBossWord;
              return (
                <TouchableOpacity
                  key={config.level}
                  onPress={() => handleLaunchLevel(config.level)}
                  activeOpacity={0.7}
                  style={[
                    styles.jumpPill,
                    isSelected && styles.jumpPillSelected,
                    isBoss && styles.jumpPillBoss,
                  ]}
                  className="px-3 py-2 rounded-xl flex-row items-center gap-1"
                >
                  <Text
                    className={`font-bold text-xs font-space ${
                      isBoss
                        ? 'text-[#FF6D00]'
                        : isSelected
                        ? 'text-[#003640]'
                        : 'text-white'
                    }`}
                  >
                    L{config.level} {isBoss ? '🔥' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Testing Category Selector */}
          <Text className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-space mb-2">
            Select Category For Test:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-3">
            {CATEGORY_OPTIONS.map((cat) => {
              const isCatActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.catPill,
                    isCatActive && { borderColor: cat.color, backgroundColor: `${cat.color}25` },
                  ]}
                  className="px-3.5 py-1.5 rounded-full border mr-2"
                >
                  <Text
                    style={{ color: isCatActive ? cat.color : '#bcc9cd' }}
                    className="font-bold text-xs font-space"
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Economy Helper Buttons */}
          <View className="flex-row gap-2 pt-2 border-t border-outline-variant/30">
            <TouchableOpacity
              onPress={handleAddTestingCoins}
              style={styles.toolBtn}
              className="flex-1 py-2 rounded-xl flex-row items-center justify-center gap-1.5 active:scale-95"
            >
              <MaterialIcons name="monetization-on" size={16} color="#FFD700" />
              <Text className="text-[#FFD700] text-xs font-bold font-space">
                +500 Coins
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResetForTesting}
              style={styles.toolBtnDanger}
              className="px-3 py-2 rounded-xl flex-row items-center justify-center gap-1 active:scale-95"
            >
              <MaterialIcons name="refresh" size={16} color="#ff7b7b" />
              <Text className="text-[#ff7b7b] text-xs font-bold font-space">
                Reset
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Detailed Level Cards */}
        <View className="gap-3.5 max-w-md mx-auto w-full">
          {LEVEL_CONFIGS.map((config) => {
            const isCurrent = config.level === currentLevel;
            const isBoss = config.appendBossWord;

            return (
              <TouchableOpacity
                key={config.level}
                onPress={() => handleLaunchLevel(config.level)}
                activeOpacity={0.85}
                style={[
                  styles.nodeCard,
                  isCurrent && styles.nodeCurrent,
                  isBoss && styles.nodeBoss,
                ]}
                className="p-4 rounded-2xl border flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View
                    style={{
                      backgroundColor: isBoss
                        ? '#FF6D00'
                        : isCurrent
                        ? '#4cd7f6'
                        : 'rgba(76, 215, 246, 0.15)',
                    }}
                    className="w-12 h-12 rounded-xl items-center justify-center"
                  >
                    <MaterialIcons
                      name={isBoss ? 'military-tech' : isCurrent ? 'play-arrow' : 'explore'}
                      size={26}
                      color={isBoss || isCurrent ? '#10131f' : '#4cd7f6'}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-bold font-space text-base text-white">
                        Level {config.level}: {config.tier}
                      </Text>
                      {isBoss && (
                        <View className="bg-error-container px-2 py-0.5 rounded-full">
                          <Text className="text-on-error-container text-[10px] font-bold font-space">
                            BOSS ROUND
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-on-surface-variant text-xs mt-0.5 font-space">
                      {config.requiredWordCount} Words &bull; {config.minWordLength} Letters &bull; {config.timerSeconds}s Timer
                    </Text>

                    <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
                      <View className="bg-surface-variant/40 px-2 py-0.5 rounded-md">
                        <Text className="text-[10px] text-primary font-semibold font-space">
                          {config.theme.toUpperCase()}
                        </Text>
                      </View>
                      <View
                        className={`px-2 py-0.5 rounded-md ${
                          config.undoAllowed ? 'bg-emerald-950/50' : 'bg-red-950/60'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold font-space ${
                            config.undoAllowed ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {config.undoAllowed ? 'UNDO ALLOWED' : 'UNDO DISABLED'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="items-end pl-2">
                  <View
                    style={{
                      backgroundColor: isBoss ? '#FF6D00' : isCurrent ? '#4cd7f6' : '#FFD700',
                    }}
                    className="px-3.5 py-2 rounded-xl flex-row items-center gap-1 active:scale-95 shadow-sm"
                  >
                    <Text className="text-[#10131f] font-bold text-xs uppercase font-space">
                      {isCurrent ? 'RESUME' : 'PLAY'}
                    </Text>
                    <MaterialIcons name="arrow-forward" size={14} color="#10131f" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <BottomNavBar activeTab="Play" />
    </View>
  );
}

const styles = StyleSheet.create({
  quickBarCard: {
    backgroundColor: '#191b28',
    borderColor: 'rgba(76, 215, 246, 0.25)',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  jumpPill: {
    backgroundColor: '#26293b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  jumpPillSelected: {
    backgroundColor: '#4cd7f6',
    borderColor: '#4cd7f6',
  },
  jumpPillBoss: {
    borderColor: '#FF6D00',
    backgroundColor: 'rgba(255, 109, 0, 0.15)',
  },
  catPill: {
    backgroundColor: '#26293b',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolBtn: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  toolBtnDanger: {
    backgroundColor: 'rgba(255, 123, 123, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 123, 123, 0.3)',
  },
  nodeCard: {
    backgroundColor: '#1d1f2c',
    borderColor: 'rgba(50, 52, 66, 0.8)',
    borderWidth: 1.5,
  },
  nodeCurrent: {
    borderColor: '#4cd7f6',
    backgroundColor: 'rgba(76, 215, 246, 0.12)',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  nodeBoss: {
    borderColor: '#FF6D00',
    backgroundColor: 'rgba(255, 109, 0, 0.12)',
    shadowColor: '#FF6D00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});
