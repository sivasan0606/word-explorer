import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { router } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { getLevelConfig, MAX_LEVEL } from '../config/levelConfig';
import { buildWordSetForLevel } from '../data/levelWords';
import { getCategoryPool } from '../data/categoriesData';

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bgColor: string;
  borderColor: string;
}

const categories: CategoryItem[] = [
  {
    id: 'space',
    title: 'Space',
    subtitle: 'Cosmos & Nebulae',
    icon: 'rocket-launch',
    color: '#4cd7f6',
    bgColor: 'rgba(76, 215, 246, 0.08)',
    borderColor: '#4cd7f6',
  },
  {
    id: 'animals',
    title: 'Animals',
    subtitle: 'Wildlife & Oceans',
    icon: 'pets',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.08)',
    borderColor: '#34d399',
  },
  {
    id: 'food',
    title: 'Food',
    subtitle: 'Gourmet & Delights',
    icon: 'restaurant',
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.08)',
    borderColor: '#fbbf24',
  },
  {
    id: 'sports',
    title: 'Sports',
    subtitle: 'Athletics & Arenas',
    icon: 'sports-soccer',
    color: '#c084fc',
    bgColor: 'rgba(192, 132, 252, 0.08)',
    borderColor: '#c084fc',
  },
  {
    id: 'anything',
    title: 'Anything',
    subtitle: 'Mix of All Realms',
    icon: 'shuffle',
    color: '#FB923C',
    bgColor: 'rgba(251, 146, 60, 0.08)',
    borderColor: '#FB923C',
  },
];

export default function ChooseCategory() {
  const [selected, setSelected] = useState('space');
  const setLevel = useGameStore((state) => state.setLevel);
  const currentLevel = useGameStore((state) => state.currentLevel);
  const setSelectedCategoryId = useGameStore((state) => state.setSelectedCategoryId);
  const playedWords = useGameStore((state) => state.playedWords);
  const markWordsAsPlayed = useGameStore((state) => state.markWordsAsPlayed);

  const selectedCategory = categories.find((c) => c.id === selected) || categories[0];
  const levelConfig = getLevelConfig(currentLevel);

  const handleStart = () => {
    const allCategoryWords = getCategoryPool(selected);
    setSelectedCategoryId(selected);

    // The level config constrains word lengths and count; the realm is flavor.
    const selectedWords = buildWordSetForLevel(levelConfig, allCategoryWords, playedWords);

    // Mark as played
    markWordsAsPlayed(selectedWords.map(w => w.word));

    setLevel({
      levelName: `${levelConfig.tier} · Level ${currentLevel}`,
      targetWords: selectedWords
    });

    router.push('/');
  };

  const totalWords = (levelConfig.requiredWordCount + (levelConfig.appendBossWord ? 1 : 0));

  return (
    <View className="flex-1 bg-background">
      <TopAppBar />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="items-center mb-6">
          <Text className="text-3xl text-center text-on-background font-bold tracking-tight font-space">
            Choose Your Adventure
          </Text>
          <Text className="text-on-surface-variant text-base mt-1 text-center font-space opacity-80">
            Pick a realm to unscramble words and earn rewards
          </Text>
          <View className="mt-3 bg-surface-container-high px-4 py-1.5 rounded-full border border-surface-variant/50">
            <Text className="text-primary font-semibold font-space">
              Level {levelConfig.level} of {MAX_LEVEL} · {levelConfig.tier} · {levelConfig.minWordLength}-{levelConfig.maxWordLength} letters · {totalWords} words · {levelConfig.timerSeconds}s{levelConfig.undoAllowed ? '' : ' · No Undo'}
            </Text>
          </View>
        </View>

        {/* Categories Grid / Cards */}
        <View className="gap-3.5 w-full">
          {categories.map((cat) => {
            const isSelected = selected === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelected(cat.id)}
                activeOpacity={0.85}
                style={[
                  styles.cardBase,
                  isSelected && {
                    borderColor: cat.borderColor,
                    backgroundColor: cat.bgColor,
                    shadowColor: cat.color,
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 5,
                  }
                ]}
                className="flex-row items-center justify-between p-4 rounded-2xl border"
              >
                <View className="flex-row items-center gap-4 flex-1">
                  {/* Icon Badge */}
                  <View
                    style={{ backgroundColor: isSelected ? cat.color : 'rgba(50, 52, 66, 0.7)' }}
                    className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
                  >
                    <MaterialIcons
                      name={cat.icon}
                      size={26}
                      color={isSelected ? '#10131f' : cat.color}
                    />
                  </View>

                  {/* Text Details */}
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xl font-bold text-white font-space">
                        {cat.title}
                      </Text>
                      <View className="bg-surface-container-high px-2 py-0.5 rounded-md border border-surface-variant/40">
                        <Text className="text-xs font-semibold text-primary font-space">
                          {levelConfig.appendBossWord ? `${levelConfig.requiredWordCount} + Boss` : `${levelConfig.requiredWordCount} Words`}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-on-surface-variant mt-0.5 font-space">
                      {cat.subtitle}
                    </Text>
                  </View>
                </View>

                {/* Selection Indicator */}
                <View
                  style={{
                    borderColor: isSelected ? cat.color : 'rgba(134, 147, 151, 0.4)',
                    backgroundColor: isSelected ? cat.color : 'transparent',
                  }}
                  className="w-6 h-6 rounded-full border-2 items-center justify-center ml-2"
                >
                  {isSelected && (
                    <MaterialIcons name="check" size={14} color="#10131f" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Realm Banner & Action */}
        <View className="mt-8 items-center">
          <View className="bg-surface-container/80 border border-surface-variant/50 w-full p-4 rounded-2xl items-center mb-5">
            <Text className="text-on-surface text-center font-space text-sm opacity-90">
              Ready to explore <Text className="font-bold text-primary">{selectedCategory.title}</Text>? Unscramble words against the clock!
            </Text>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            className="flex-row items-center justify-center gap-3 w-full py-4 rounded-2xl active:scale-98 mb-3"
            activeOpacity={0.85}
            onPress={handleStart}
          >
            <Text className="text-[#10131f] font-bold text-lg uppercase tracking-wider font-space">
              Start Quest
            </Text>
            <MaterialIcons name="play-arrow" size={26} color="#10131f" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/saga')}
            className="flex-row items-center justify-center gap-2 w-full py-3 rounded-xl bg-surface-variant/30 border border-surface-variant active:scale-98"
            activeOpacity={0.85}
          >
            <MaterialIcons name="science" size={20} color="#FFD700" />
            <Text className="text-[#FFD700] font-bold text-sm uppercase tracking-wide font-space">
              Select Any Level (Testing Lab)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar activeTab="Play" />
    </View>
  );
}

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: '#1d1f2c',
    borderColor: 'rgba(50, 52, 66, 0.8)',
    borderWidth: 1.5,
  },
  startButton: {
    backgroundColor: '#4cd7f6',
    borderBottomWidth: 4,
    borderBottomColor: '#00839b',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  }
});