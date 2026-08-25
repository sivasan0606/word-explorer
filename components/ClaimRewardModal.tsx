import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Achievement } from '../config/awardsConfig';

interface ClaimRewardModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

export default function ClaimRewardModal({
  visible,
  achievement,
  onClose,
}: ClaimRewardModalProps) {
  if (!visible || !achievement) return null;

  const safeIcon = achievement.icon || 'military-tech';
  const safeTierColor = achievement.tierColor || '#FFD700';
  const safeTierBg = achievement.tierBg || 'rgba(255, 215, 0, 0.15)';
  const safeTitle = achievement.title || 'Medal Unlocked';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop} className="flex-1 items-center justify-center px-6">
        <View
          style={[styles.modalCard, { borderColor: safeTierColor }]}
          className="w-full max-w-sm bg-[#1A1C29] rounded-3xl p-6 items-center border-2"
        >
          <View
            style={[styles.avatarGlow, { borderColor: safeTierColor, backgroundColor: safeTierBg }]}
            className="w-20 h-20 rounded-full border-4 items-center justify-center mb-4"
          >
            <MaterialIcons name={safeIcon} size={40} color={safeTierColor} />
          </View>
          <Text className="text-white text-2xl font-bold font-space text-center mb-5">
            {safeTitle}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.collectBtn, { backgroundColor: safeTierColor }]}
            activeOpacity={0.85}
            className="w-full py-3.5 rounded-2xl items-center justify-center"
          >
            <Text className="text-[#10131F] font-bold text-base font-space uppercase">
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(10, 12, 20, 0.85)',
  },
  modalCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  avatarGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  collectBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});
