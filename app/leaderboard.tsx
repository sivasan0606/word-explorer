import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import AchievementCard from '../components/AchievementCard';
import ClaimRewardModal from '../components/ClaimRewardModal';
import { useGameStore } from '../store/gameStore';
import { ACHIEVEMENTS, computeAchievementProgress, Achievement } from '../config/awardsConfig';
import { playSfx } from '../lib/soundManager';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  badge: string;
  avatarIcon: keyof typeof MaterialIcons.glyphMap;
  avatarColor: string;
  avatarBg: string;
}

const TOP_EXPLORERS: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'StarGazer99',
    score: 24500,
    badge: 'GRAND MASTER',
    avatarIcon: 'rocket-launch',
    avatarColor: '#FFC300',
    avatarBg: 'rgba(255, 195, 0, 0.25)',
  },
  {
    rank: 2,
    name: 'LexiconPro',
    score: 23120,
    badge: 'MASTER',
    avatarIcon: 'psychology',
    avatarColor: '#C0C0C0',
    avatarBg: 'rgba(192, 192, 192, 0.25)',
  },
  {
    rank: 3,
    name: 'WordNinja_X',
    score: 22850,
    badge: 'EXPERT',
    avatarIcon: 'military-tech',
    avatarColor: '#CD7F32',
    avatarBg: 'rgba(205, 127, 50, 0.25)',
  },
  {
    rank: 4,
    name: 'CosmicSolver',
    score: 21400,
    badge: 'VOYAGER',
    avatarIcon: 'auto-awesome',
    avatarColor: '#4cd7f6',
    avatarBg: 'rgba(76, 215, 246, 0.15)',
  },
  {
    rank: 5,
    name: 'AstroScholar',
    score: 19800,
    badge: 'VOYAGER',
    avatarIcon: 'school',
    avatarColor: '#c084fc',
    avatarBg: 'rgba(192, 132, 252, 0.15)',
  },
  {
    rank: 6,
    name: 'StarSeeker_07',
    score: 18200,
    badge: 'EXPLORER',
    avatarIcon: 'explore',
    avatarColor: '#34D399',
    avatarBg: 'rgba(52, 211, 153, 0.15)',
  },
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'medals'>('leaderboard');
  const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null);

  // Store state with safe defaults
  const userScore = useGameStore((state) => state.score) ?? 0;
  const currentLevel = useGameStore((state) => state.currentLevel) ?? 1;

   const streak = useGameStore((state) => state.streak) ?? 0;
   const highestStreak = useGameStore((state) => state.highestStreak) ?? 0;

  const playedWords = useGameStore((state) => state.playedWords) || [];
  const coins = useGameStore((state) => state.coins) ?? 500;
  const gameCompleted = Boolean(useGameStore((state) => state.gameCompleted));
  const claimedAchievements = useGameStore((state) => state.claimedAchievements) || [];
  const claimAchievement = useGameStore((state) => state.claimAchievement);

  const safeClaimed = Array.isArray(claimedAchievements) ? claimedAchievements : [];
  const safePlayedWords = Array.isArray(playedWords) ? playedWords : [];

  const dynamicUserScore = Math.max(userScore, 14250);
  const userRank = dynamicUserScore > 24500 ? 1 : dynamicUserScore > 23120 ? 2 : dynamicUserScore > 22850 ? 3 : dynamicUserScore > 21400 ? 4 : 42;

  // Compute achievements status
  const evaluatedAchievements = ACHIEVEMENTS.map((ach) => {
    const progress = computeAchievementProgress(ach, {
      currentLevel,
      playedWords: safePlayedWords,
      highestStreak,
      streak,
      coins,
      gameCompleted,
    });
    const isClaimed = safeClaimed.includes(ach.id);
    return {
      achievement: ach,
      ...progress,
      isClaimed,
    };
  });

  const totalUnlocked = evaluatedAchievements.filter((a) => a.isCompleted).length;
  const totalUnclaimed = evaluatedAchievements.filter((a) => a.isCompleted && !a.isClaimed).length;

  const orderedAchievements = [...evaluatedAchievements].sort((a, b) => {
    const aReady = a.isCompleted && !a.isClaimed;
    const bReady = b.isCompleted && !b.isClaimed;
    return Number(bReady) - Number(aReady);
  });

  const handleClaim = (ach: Achievement) => {
    if (!ach || !claimAchievement) return;
    const success = claimAchievement(ach.id, ach.coinReward);
    if (success) {
      playSfx('coinReward');
      setCelebrationAchievement(ach);
    }
  };

  return (
    <View className="flex-1 bg-[#1A1C29]">
      <TopAppBar />

      {/* Top Segmented Tab Switcher */}
      <View className="px-4 pt-3 pb-2">
        <View className="bg-[#131520] p-1.5 rounded-2xl flex-row border border-[#2A2D3D]">
          <TouchableOpacity
            onPress={() => {
              setActiveTab('leaderboard');
              playSfx('click');
            }}
            activeOpacity={0.8}
            style={activeTab === 'leaderboard' ? styles.activeTab : null}
            className="flex-1 py-2.5 rounded-xl items-center justify-center flex-row gap-1.5"
          >
            <MaterialIcons
              name="leaderboard"
              size={18}
              color={activeTab === 'leaderboard' ? '#FFFFFF' : '#869397'}
            />
            <Text
              style={activeTab === 'leaderboard' ? styles.activeTabText : null}
              className="font-bold text-xs font-space uppercase tracking-wider text-[#869397]"
            >
              Leaderboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setActiveTab('medals');
              playSfx('click');
            }}
            activeOpacity={0.8}
            style={activeTab === 'medals' ? styles.activeTab : null}
            className="flex-1 py-2.5 rounded-xl items-center justify-center flex-row gap-1.5 relative"
          >
            <MaterialIcons
              name="military-tech"
              size={18}
              color={activeTab === 'medals' ? '#FFD700' : '#869397'}
            />
            <Text
              style={activeTab === 'medals' ? styles.activeTabText : null}
              className="font-bold text-xs font-space uppercase tracking-wider text-[#869397]"
            >
              My Medals
            </Text>
            {totalUnclaimed > 0 && (
              <View className="bg-[#FF6D00] px-1.5 py-0.5 rounded-full border border-white/40">
                <Text className="text-white text-[9px] font-bold font-space">
                  {totalUnclaimed}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-2" contentContainerStyle={{ paddingBottom: 120 }}>
        {activeTab === 'leaderboard' ? (
          <>
            <View className="mb-4 mt-1">
              <Text className="text-2xl text-white font-bold font-space">
                Leaderboard
              </Text>
              <Text className="text-[#A5B4FC] text-sm font-space mt-1">
                See how you rank against other explorers
              </Text>
            </View>

            <View className="bg-[#7C3AED] rounded-2xl p-4 mb-4">
              <Text className="text-[#E0E7FF] text-xs font-bold font-space uppercase">Your position</Text>
              <View className="flex-row items-end justify-between mt-2">
                <View>
                  <Text className="text-white text-3xl font-bold font-space">#{userRank}</Text>
                  <Text className="text-[#E9DDFF] text-xs font-space">Rank</Text>
                </View>
                <View className="items-end">
                  <Text className="text-white text-xl font-bold font-space">{dynamicUserScore.toLocaleString()}</Text>
                  <Text className="text-[#E9DDFF] text-xs font-space">points</Text>
                </View>
              </View>
            </View>

            {/* DIRECT RANKED EXPLORERS LIST */}
            <View className="mb-2">
               <Text className="text-white text-base font-bold font-space mb-2 px-1">
                 Top Explorers
               </Text>

               {TOP_EXPLORERS.map((item) => {
                 return (
                   <View
                     key={item.rank}
                     style={styles.standardRankCard}
                     className="rounded-2xl p-3 flex-row items-center gap-3 mb-2 border"
                   >
                     <Text className="text-[#A5B4FC] font-bold text-sm font-space w-8">
                       #{item.rank}
                     </Text>


                    {/* Avatar */}
                    <View
                      style={{ backgroundColor: item.avatarBg, borderColor: item.avatarColor }}
                      className="w-11 h-11 rounded-full border-2 items-center justify-center"
                    >
                      <MaterialIcons name={item.avatarIcon} size={22} color={item.avatarColor} />
                    </View>

                     <View className="flex-1">
                       <Text className="text-white text-sm font-bold font-space">
                         {item.name}
                       </Text>
                       <Text className="text-[#A5B4FC] text-xs font-space mt-0.5">
                         {item.badge}
                       </Text>
                     </View>

                     <View className="items-end">
                       <Text className="text-[#4CD7F6] text-sm font-bold font-space">
                         {item.score.toLocaleString()}
                       </Text>
                       <Text className="text-[#869397] text-[10px] font-space">points</Text>
                     </View>
                  </View>
                );
              })}


            </View>
          </>
        ) : (
          /* MY MEDALS VIEW */
          <>
            <View className="mb-4">
              <Text className="text-2xl text-white font-bold font-space">My Medals</Text>
              <Text className="text-[#A5B4FC] text-sm font-space mt-1">
                {totalUnlocked} of {ACHIEVEMENTS.length} unlocked
              </Text>
            </View>

            {orderedAchievements.map((item) => (
              <AchievementCard
                key={item.achievement.id}
                achievement={item.achievement}
                current={item.current}
                target={item.target}
                percent={item.percent}
                isCompleted={item.isCompleted}
                isClaimed={item.isClaimed}
                onClaim={() => handleClaim(item.achievement)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Celebratory Reward Modal */}
      <ClaimRewardModal
        visible={celebrationAchievement !== null}
        achievement={celebrationAchievement}
        onClose={() => setCelebrationAchievement(null)}
      />

      <BottomNavBar activeTab="Awards" />
    </View>
  );
}

const styles = StyleSheet.create({
  glowCyan: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  glowGold: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 8,
  },
  firstPlaceCard: {
    backgroundColor: '#261F10',
    borderColor: '#FFD700',
    borderWidth: 1.5,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  secondPlaceCard: {
    backgroundColor: '#1E212D',
    borderColor: '#C0C0C0',
    borderWidth: 1,
    shadowColor: '#C0C0C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  thirdPlaceCard: {
    backgroundColor: '#231B16',
    borderColor: '#CD7F32',
    borderWidth: 1,
    shadowColor: '#CD7F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  standardRankCard: {
    backgroundColor: '#161826',
    borderColor: '#26293A',
    borderWidth: 1,
  },
  standingsCard: {
    backgroundColor: '#7C3AED',
    borderColor: '#8B5CF6',
    borderWidth: 1,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  medalsHeader: {
    backgroundColor: '#261F3D',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  overallTrack: {
    backgroundColor: '#131520',
    borderColor: '#323442',
    borderWidth: 1,
  },
  overallFill: {
    backgroundColor: '#FFD700',
  },
  actionOrange: {
    backgroundColor: '#FF6D00',
    shadowColor: '#FF6D00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#CC5800',
    elevation: 8,
  },
  activeTab: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  filterActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#8B5CF6',
  },
  filterActiveText: {
    color: '#FFFFFF',
  },
});