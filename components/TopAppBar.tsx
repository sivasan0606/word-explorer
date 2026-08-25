import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';

export default function TopAppBar() {
  const insets = useSafeAreaInsets();
  const score = useGameStore((state) => state.score);
  const coins = useGameStore((state) => state.coins);
  const energy = useGameStore((state) => state.energy);

  const handleOpenTreasury = () => {
    Alert.alert(
      'Explorer Treasury',
      `Current Balance: 🪙 ${coins} Coins | 🔥 ${energy} Energy\n\nVisit the Explorer Vault to exchange coins for power-ups and stamina!`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Visit Vault',
          onPress: () => {
            router.push('/shop');
          },
        },
      ]
    );
  };

  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 12) + 4,
        paddingBottom: 10,
      }}
      className="bg-background border-b border-surface-variant flex-row justify-between items-center w-full px-4 shadow-[0_0_15px_rgba(76,215,246,0.1)] z-50"
    >
      <TouchableOpacity className="flex-row items-center gap-2 active:scale-95">
        <MaterialIcons name="rocket-launch" size={24} color="#4cd7f6" />
        <Text className="font-bold text-primary tracking-tight text-xl" style={{ fontFamily: 'Space Grotesk' }}>
          Score: {score}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={handleOpenTreasury}
        activeOpacity={0.7}
        className="flex-row items-center active:scale-95 bg-surface-variant/30 px-3 py-1.5 rounded-full"
      >
        <Text className="text-primary text-lg font-semibold mr-2">🔥 {energy}</Text>
        <Text className="text-primary text-lg font-semibold">•</Text>
        <Text className="text-primary text-lg font-semibold ml-2">🪙 {coins}</Text>
      </TouchableOpacity>
    </View>
  );
}
