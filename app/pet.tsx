import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { useGameStore } from '../store/gameStore';
import { playSfx } from '../lib/soundManager';

interface Companion {
  id: string;
  name: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  requiredLevel: number;
  perk: string;
}

const COMPANIONS: Companion[] = [
  {
    id: 'astro_pup',
    name: 'Astro-Pup',
    title: 'Cosmic Tracker',
    icon: 'pets',
    color: '#4cd7f6',
    requiredLevel: 1,
    perk: '+5% Bonus Score on space words',
  },
  {
    id: 'nebula_owl',
    name: 'Nebula Owl',
    title: 'Sage of Words',
    icon: 'psychology',
    color: '#c084fc',
    requiredLevel: 3,
    perk: '+1 Free hint on Level 3+',
  },
  {
    id: 'solar_fox',
    name: 'Solar Fox',
    title: 'Speed Voyager',
    icon: 'flash-on',
    color: '#fbbf24',
    requiredLevel: 6,
    perk: '+10s Bonus time on boss levels',
  },
];

export default function SpellingPetEvolution() {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const score = useGameStore((state) => state.score);
  const coins = useGameStore((state) => state.coins);
  const spendCoins = useGameStore((state) => state.spendCoins);
  const addCoins = useGameStore((state) => state.addCoins);

  const [selectedCompanionId, setSelectedCompanionId] = useState('astro_pup');
  const [petExp, setPetExp] = useState(380);

  const activeCompanion = COMPANIONS.find((c) => c.id === selectedCompanionId) || COMPANIONS[0];
  const petLevel = Math.min(10, Math.floor(petExp / 100) + 1);
  const progressPercent = (petExp % 100);

  const handleFeedStardust = () => {
    if (spendCoins(50)) {
      setPetExp((prev) => prev + 40);
      playSfx('streak');
      Alert.alert(
        'Companion Fed! ✨',
        `${activeCompanion.name} gained +40 XP from Cosmic Stardust!`
      );
    } else {
      playSfx('wrong');
      Alert.alert(
        'Need More Coins',
        'You need 50 Coins to feed Cosmic Stardust to your companion.'
      );
    }
  };

  const handleSelectCompanion = (companion: Companion) => {
    if (currentLevel < companion.requiredLevel) {
      playSfx('wrong');
      Alert.alert(
        'Companion Locked 🔒',
        `Reach Campaign Level ${companion.requiredLevel} to unlock ${companion.name}!`
      );
      return;
    }
    setSelectedCompanionId(companion.id);
    playSfx('correct');
  };

  return (
    <View className="flex-1 bg-background">
      <TopAppBar />

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Companion Main Display Area */}
        <View style={styles.cosmicPanel} className="rounded-2xl p-6 items-center justify-center relative mb-6">
          <View className="absolute top-4 right-4 bg-background/60 rounded-full px-3 py-1 flex-row items-center gap-1 border border-primary/30">
            <MaterialIcons name="stars" size={16} color="#06B6D4" />
            <Text className="text-[#06B6D4] font-bold text-xs uppercase font-space">
              Lvl {petLevel}
            </Text>
          </View>

          <View
            style={[styles.cyanGlow, { borderColor: activeCompanion.color }]}
            className="w-40 h-40 rounded-full bg-background border-4 items-center justify-center mb-4"
          >
            <MaterialIcons name={activeCompanion.icon} size={84} color={activeCompanion.color} />
          </View>

          <Text className="text-2xl text-white font-bold font-space mb-1">
            {activeCompanion.name}
          </Text>
          <Text className="text-[#d2bbff] text-xs font-semibold uppercase tracking-wider font-space mb-4">
            {activeCompanion.title} &bull; {activeCompanion.perk}
          </Text>

          <View className="w-full max-w-sm">
            <View className="flex-row justify-between mb-2">
              <Text className="text-[#d2bbff] text-xs font-bold uppercase font-space">
                Evolution XP
              </Text>
              <Text className="text-[#d2bbff] text-xs font-bold uppercase font-space">
                {progressPercent}%
              </Text>
            </View>
            <View style={styles.progressTrack} className="w-full h-3.5 rounded-full overflow-hidden">
              <View
                style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: activeCompanion.color }]}
                className="h-full rounded-full"
              />
            </View>
          </View>
        </View>

        {/* Companion Selection */}
        <View className="mb-6">
          <Text className="text-xl text-white font-space font-bold border-b border-surface-variant pb-2 mb-3">
            Choose Mascot Companion
          </Text>

          <View className="flex-row gap-3">
            {COMPANIONS.map((companion) => {
              const isSelected = selectedCompanionId === companion.id;
              const isLocked = currentLevel < companion.requiredLevel;

              return (
                <TouchableOpacity
                  key={companion.id}
                  onPress={() => handleSelectCompanion(companion)}
                  style={[
                    styles.companionCard,
                    isSelected && { borderColor: companion.color, backgroundColor: `${companion.color}15` },
                    isLocked && { opacity: 0.5 },
                  ]}
                  activeOpacity={0.8}
                  className="flex-1 p-3 rounded-xl border items-center justify-center gap-1.5 relative"
                >
                  {isLocked && (
                    <View className="absolute top-1.5 right-1.5">
                      <MaterialIcons name="lock" size={14} color="#869397" />
                    </View>
                  )}
                  <MaterialIcons
                    name={companion.icon}
                    size={32}
                    color={isSelected ? companion.color : isLocked ? '#869397' : '#bcc9cd'}
                  />
                  <Text className="text-white font-bold text-xs font-space text-center">
                    {companion.name}
                  </Text>
                  <Text className="text-on-surface-variant text-[10px] font-space">
                    {isLocked ? `Lvl ${companion.requiredLevel}` : 'Unlocked'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-6 gap-3">
          <View style={styles.cosmicPanel} className="flex-1 rounded-xl p-4 items-center justify-center gap-1">
            <MaterialIcons name="auto-awesome" size={30} color="#06B6D4" />
            <Text className="text-[#d2bbff] text-[10px] font-bold uppercase font-space">Stardust Power</Text>
            <Text className="text-white text-lg font-bold font-space">{petExp} XP</Text>
          </View>
          <View style={styles.cosmicPanel} className="flex-1 rounded-xl p-4 items-center justify-center gap-1">
            <MaterialIcons name="military-tech" size={30} color="#FFC300" />
            <Text className="text-[#d2bbff] text-[10px] font-bold uppercase font-space">Explorer Rank</Text>
            <Text className="text-white text-lg font-bold font-space">Cosmic L{currentLevel}</Text>
          </View>
        </View>

        {/* CTA Action */}
        <View className="items-center">
          <TouchableOpacity
            onPress={handleFeedStardust}
            style={styles.orangeBtn}
            className="w-full max-w-sm rounded-2xl py-4 flex-row items-center justify-center gap-2 active:scale-95"
          >
            <MaterialIcons name="auto-awesome" size={24} color="#10131f" />
            <Text className="text-[#10131f] font-bold text-base uppercase tracking-wider font-space">
              Feed Stardust (50 Coins)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar activeTab="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  cosmicPanel: {
    backgroundColor: '#7C3AED',
    borderColor: 'rgba(210, 187, 255, 0.3)',
    borderWidth: 1.5,
  },
  cyanGlow: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  progressTrack: {
    backgroundColor: '#1A1C29',
    borderColor: '#7C3AED',
    borderWidth: 1,
  },
  progressFill: {
    backgroundColor: '#06B6D4',
  },
  companionCard: {
    backgroundColor: '#1d1f2c',
    borderColor: 'rgba(50, 52, 66, 0.8)',
  },
  orangeBtn: {
    backgroundColor: '#FFC300',
    shadowColor: '#FFC300',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  }
});
