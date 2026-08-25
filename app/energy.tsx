import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { playSfx } from '../lib/soundManager';

export default function OutOfCredits() {
  const restoreCredits = useGameStore((state) => state.restoreCredits);

  const handleFreeRefill = () => {
    restoreCredits(500);
    playSfx('streak');
    Alert.alert(
      'Energy & Coins Restored! ⚡',
      'Your exploration energy has been recharged to full and 500 Coins added!',
      [{ text: 'Continue Quest', onPress: () => router.back() }]
    );
  };

  return (
    <View className="flex-1 bg-background justify-center items-center p-4 relative">
      <View style={styles.gridPattern} className="absolute inset-0 opacity-50" />
      
      {/* Modal Container */}
      <View style={styles.modalContainer} className="w-full max-w-sm bg-secondary-container rounded-[24px] p-8 items-center border border-[#d2bbff]/40 z-10">
        
        <View className="mb-6 items-center justify-center relative w-24 h-24">
          <View style={styles.glowPrimary} className="absolute inset-0 rounded-full" />
          <MaterialIcons name="battery-0-bar" size={80} color="#4cd7f6" />
          <View className="absolute top-1/2 left-1/2 -mt-4 -ml-4">
            <MaterialIcons name="sentiment-dissatisfied" size={32} color="#10131f" />
          </View>
        </View>

        <Text className="text-3xl text-white font-bold font-space mb-2 tracking-tight uppercase text-center">
          Energy Depleted
        </Text>
        
        <Text className="text-base text-[#c9aeff] font-space mb-8 text-center px-2 opacity-90">
          Your energy cell is depleted. Recharge your vessel to continue exploring the cosmos.
        </Text>

        <View className="w-full gap-3.5">
          <TouchableOpacity 
            style={styles.shopButton} 
            className="w-full bg-[#ff8440] py-4 px-6 rounded-xl flex-row items-center justify-center gap-2 active:translate-y-1"
            onPress={() => router.push('/shop')}
          >
            <MaterialIcons name="storefront" size={24} color="#682800" />
            <Text className="text-[#682800] font-bold text-sm tracking-wider uppercase font-space">
              Visit Explorer Vault
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full py-3.5 rounded-xl flex-row items-center justify-center gap-2 border border-[#ffb692]/30 active:bg-[#ffb692]/10"
            onPress={handleFreeRefill}
          >
            <MaterialIcons name="bolt" size={20} color="#ffb692" />
            <Text className="text-[#ffb692] font-bold text-xs tracking-wider uppercase font-space">
              Instant Stamina Recharge
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridPattern: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  modalContainer: {
    shadowColor: '#6001d1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  glowPrimary: {
    backgroundColor: 'rgba(76, 215, 246, 0.25)',
  },
  shopButton: {
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(104, 40, 0, 0.3)',
    shadowColor: '#ff8440',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  }
});
