import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Achievement } from '../config/awardsConfig';

interface AchievementCardProps {
  achievement: Achievement;
  current: number;
  target: number;
  percent: number;
  isCompleted: boolean;
  isClaimed: boolean;
  onClaim: () => void;
}

export default function AchievementCard({
  achievement,
  current,
  target,
  percent,
  isCompleted,
  isClaimed,
  onClaim,
}: AchievementCardProps) {
  if (!achievement) return null;

  const isReadyToClaim = Boolean(isCompleted && !isClaimed);
  const tierColor = achievement.tierColor || '#CD7F32';
  const status = isReadyToClaim ? 'Claim' : isClaimed ? 'Unlocked' : 'Locked';

  return (
    <View
      style={[styles.card, isReadyToClaim && styles.readyCardGlow]}
      className="bg-[#1D1F2C] rounded-2xl p-3.5 mb-3 border border-[#323442] flex-row items-center"
    >
      <View
        style={{
          backgroundColor: achievement.tierBg || 'rgba(205, 127, 50, 0.15)',
          borderColor: `${tierColor}60`,
        }}
        className="w-11 h-11 rounded-full border items-center justify-center mr-3"
      >
        <MaterialIcons
          name={achievement.icon || 'military-tech'}
          size={23}
          color={tierColor}
        />
      </View>

      <View className="flex-1 mr-2">
        <Text className="text-white font-bold text-base font-space">
          {achievement.title}
        </Text>
        <Text className="text-[#A5B4FC] text-xs font-space mt-0.5">
          {achievement.description}
        </Text>
      </View>

      {isReadyToClaim ? (
        <TouchableOpacity
          onPress={onClaim}
          style={styles.claimButton}
          activeOpacity={0.85}
          className="rounded-xl py-2 px-4"
        >
          <Text className="text-[#10131F] font-bold text-xs font-space uppercase">
            Claim
          </Text>
        </TouchableOpacity>
      ) : (
        <Text
          style={{ color: isClaimed ? '#10B981' : '#869397' }}
          className="text-xs font-bold font-space"
        >
          {status}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  readyCardGlow: {
    borderColor: '#FFD700',
    borderWidth: 1.5,
    backgroundColor: '#232115',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  claimedCard: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: '#161924',
  },
  claimButton: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  track: {
    backgroundColor: '#131520',
    borderColor: '#2A2D3D',
    borderWidth: 1,
  },
  fill: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});
