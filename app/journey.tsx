import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import { router } from 'expo-router';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { useGameStore } from '../store/gameStore';
import { LEVEL_CONFIGS, MAX_LEVEL } from '../config/levelConfig';

export default function Journey() {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const pathLevels = [...LEVEL_CONFIGS].reverse();

  return (
    <View className="flex-1 bg-[#090D1A]">
      <TopAppBar />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 130 }}>
        <View className="px-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mt-4 mb-5"
            activeOpacity={0.75}
          >
            <MaterialIcons name="arrow-back" size={24} color="#4CD7F6" />
            <Text className="text-[#4CD7F6] text-sm font-bold font-space ml-2">Back to Game</Text>
          </TouchableOpacity>

          <View className="items-center mb-5">
            <Text className="text-white text-3xl font-bold font-space">Your Journey</Text>
            <Text className="text-[#A5B4FC] text-sm font-space mt-1">
              Climb from Level 1 to the Volcano Boss
            </Text>
            <View className="bg-[#261F3D] rounded-full px-4 py-2 mt-3 border border-[#7C3AED]">
              <Text className="text-[#E9DDFF] text-xs font-bold font-space">
                LEVEL {currentLevel} OF {MAX_LEVEL}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.map}>
          <Svg style={styles.river} viewBox="0 0 360 720" preserveAspectRatio="none">
            <Defs>
              <SvgLinearGradient id="riverGradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#F97316" />
                <Stop offset="0.45" stopColor="#A855F7" />
                <Stop offset="1" stopColor="#22D3EE" />
              </SvgLinearGradient>
            </Defs>
            <Path
              d="M 180 720 C 35 665, 325 610, 180 540 C 35 470, 325 410, 180 340 C 35 270, 325 205, 180 0"
              stroke="#171D38"
              strokeWidth="34"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 180 720 C 35 665, 325 610, 180 540 C 35 470, 325 410, 180 340 C 35 270, 325 205, 180 0"
              stroke="url(#riverGradient)"
              strokeWidth="18"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 180 720 C 35 665, 325 610, 180 540 C 35 470, 325 410, 180 340 C 35 270, 325 205, 180 0"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="1 22"
              opacity={0.7}
            />
          </Svg>
          {pathLevels.map((level, index) => {
            const isCompleted = level.level < currentLevel;
            const isCurrent = level.level === currentLevel;
            const isLocked = level.level > currentLevel;
            const isBoss = level.appendBossWord;
            const isLeft = index % 2 === 0;

            return (
              <View key={level.level} style={[styles.pathRow, isLeft ? styles.leftRow : styles.rightRow]}>
                <View style={[styles.connector, isLeft ? styles.leftConnector : styles.rightConnector]} />
                <View style={styles.levelCardWrap}>
                  <View
                    style={[
                      styles.levelCard,
                      isCompleted && styles.completedCard,
                      isCurrent && styles.currentCard,
                      isLocked && styles.lockedCard,
                      isBoss && styles.bossCard,
                    ]}
                    className="rounded-2xl p-3 border"
                  >
                    <View className="flex-row items-center gap-2">
                      <View
                        style={[
                          styles.node,
                          isCompleted && styles.completedNode,
                          isCurrent && styles.currentNode,
                          isBoss && styles.bossNode,
                        ]}
                        className="w-10 h-10 rounded-full items-center justify-center"
                      >
                        <MaterialIcons
                          name={isCompleted ? 'check' : isBoss ? 'military-tech' : isCurrent ? 'play-arrow' : 'lock'}
                          size={20}
                          color={isCompleted || isCurrent || isBoss ? '#10131F' : '#869397'}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{ color: isLocked ? '#869397' : '#FFFFFF' }}
                          className="text-sm font-bold font-space"
                        >
                          Level {level.level} · {level.tier}
                        </Text>
                        <Text className="text-[#A5B4FC] text-xs font-space mt-0.5">
                          {isBoss ? 'Volcano Boss' : `${level.requiredWordCount} words`}
                        </Text>
                      </View>
                    </View>
                    {isCurrent && (
                      <TouchableOpacity
                        onPress={() => router.replace('/')}
                        style={styles.continueButton}
                        className="rounded-lg px-3 py-1.5 mt-2 self-start"
                        activeOpacity={0.8}
                      >
                        <Text className="text-[#10131F] text-xs font-bold font-space">CONTINUE</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View className="flex-row justify-center items-center gap-4 mt-3 px-5">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
            <Text className="text-[#A5B4FC] text-xs font-space">Complete</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-[#4CD7F6]" />
            <Text className="text-[#A5B4FC] text-xs font-space">Current</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-[#3A3D4D]" />
            <Text className="text-[#A5B4FC] text-xs font-space">Locked</Text>
          </View>
        </View>
      </ScrollView>
      <BottomNavBar activeTab="Play" />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    minHeight: 720,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  river: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 720,
  },
  pathRow: {
    minHeight: 82,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  leftRow: {
    alignItems: 'flex-start',
  },
  rightRow: {
    alignItems: 'flex-end',
  },
  levelCardWrap: {
    width: '78%',
    zIndex: 2,
  },
  connector: {
    position: 'absolute',
    top: '50%',
    height: 3,
    width: '25%',
    backgroundColor: '#303447',
  },
  leftConnector: {
    left: '50%',
  },
  rightConnector: {
    right: '50%',
  },
  levelCard: {
    backgroundColor: 'rgba(23, 29, 56, 0.96)',
    borderColor: '#30395E',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  completedCard: {
    borderColor: '#34D399',
    backgroundColor: 'rgba(16, 55, 61, 0.96)',
  },
  currentCard: {
    backgroundColor: 'rgba(73, 44, 111, 0.98)',
    borderColor: '#FACC15',
    borderWidth: 2,
    shadowColor: '#FACC15',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  lockedCard: {
    opacity: 0.6,
  },
  bossCard: {
    backgroundColor: 'rgba(91, 38, 21, 0.98)',
    borderColor: '#FB923C',
  },
  node: {
    backgroundColor: '#252B49',
    borderWidth: 2,
    borderColor: '#59658E',
  },
  completedNode: {
    backgroundColor: '#34D399',
    borderColor: '#A7F3D0',
  },
  currentNode: {
    backgroundColor: '#FACC15',
    borderColor: '#FEF08A',
    shadowColor: '#FACC15',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  bossNode: {
    backgroundColor: '#F97316',
    borderColor: '#FDBA74',
  },
  continueButton: {
    backgroundColor: '#FACC15',
  },
});
