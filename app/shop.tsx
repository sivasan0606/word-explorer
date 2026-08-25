import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { useGameStore } from '../store/gameStore';
import { playSfx } from '../lib/soundManager';

interface PowerUpItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  badge?: string;
  action: (store: any) => { success: boolean; message: string };
}

export default function Shop() {
  const coins = useGameStore((state) => state.coins);
  const energy = useGameStore((state) => state.energy);
  const hints = useGameStore((state) => state.hints);
  const streakShields = useGameStore((state) => state.streakShields);
  const chronoBoosters = useGameStore((state) => state.chronoBoosters);
  const spendCoins = useGameStore((state) => state.spendCoins);
  const addCoins = useGameStore((state) => state.addCoins);
  const addHints = useGameStore((state) => state.addHints);
  const addStreakShields = useGameStore((state) => state.addStreakShields);
  const addChronoBoosters = useGameStore((state) => state.addChronoBoosters);
  const restoreCredits = useGameStore((state) => state.restoreCredits);

  const [claimedDaily, setClaimedDaily] = useState(false);

  const powerUps: PowerUpItem[] = [
    {
      id: 'energy_pack',
      title: 'Cosmic Energy Capsule',
      description: 'Fully restores all 5 exploration energy units.',
      cost: 100,
      icon: 'bolt',
      iconColor: '#4cd7f6',
      action: () => {
        if (spendCoins(100)) {
          useGameStore.setState({ energy: 5 });
          return { success: true, message: 'Energy fully restored to 5 units!' };
        }
        return { success: false, message: 'Not enough coins. Complete word quests to earn more!' };
      },
    },
    {
      id: 'mega_hint',
      title: 'Super Scout Hint Pack',
      description: 'Grants +20 free letter hints to instantly reveal difficult letter placements.',
      cost: 150,
      icon: 'lightbulb',
      iconColor: '#FFC300',
      badge: 'POPULAR',
      action: () => {
        if (spendCoins(150)) {
          addHints(20);
          return { success: true, message: 'Super Scout Hint Pack activated! +20 hints added to your inventory.' };
        }
        return { success: false, message: 'Not enough coins. Unscramble more words to earn coins!' };
      },
    },
    {
      id: 'time_warp',
      title: 'Chrono Booster',
      description: 'Grants +3 Chrono Boosters (+30s timer extension each) on difficult words.',
      cost: 200,
      icon: 'timer',
      iconColor: '#34d399',
      action: () => {
        if (spendCoins(200)) {
          addChronoBoosters(3);
          return { success: true, message: 'Chrono Booster pack activated! +3 Boosters added to your inventory.' };
        }
        return { success: false, message: 'Not enough coins to acquire Chrono Booster.' };
      },
    },
    {
      id: 'streak_shield',
      title: 'Streak Guardian',
      description: 'Prevents combo streak loss on an incorrect word submission.',
      cost: 250,
      icon: 'shield',
      iconColor: '#c084fc',
      badge: 'SPECIAL',
      action: () => {
        if (spendCoins(250)) {
          addStreakShields(1);
          return { success: true, message: 'Streak Guardian shield acquired! +1 Shield active to protect your combo.' };
        }
        return { success: false, message: 'Not enough coins to acquire Streak Guardian.' };
      },
    },
  ];

  const handleClaimDailyDrop = () => {
    if (claimedDaily) {
      Alert.alert('Daily Drop Claimed', 'You already claimed today\'s supply drop! Come back tomorrow for more rewards.');
      return;
    }
    addCoins(250);
    useGameStore.setState({ energy: 5 });
    setClaimedDaily(true);
    playSfx('streak');
    Alert.alert(
      'Daily Explorer Supply Drop! 🎁',
      'You received +250 Coins and full Energy recharge!'
    );
  };

  const handleExchange = (item: PowerUpItem) => {
    const result = item.action(useGameStore);
    if (result.success) {
      playSfx('correct');
      Alert.alert('Perk Activated! ✨', result.message);
    } else {
      playSfx('wrong');
      Alert.alert('Insufficient Coins', result.message);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <TopAppBar />

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Treasury Summary Card */}
        <View style={styles.treasuryCard} className="rounded-2xl p-4 mb-5 border">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-white font-bold text-base font-space">
                Vault Treasury
              </Text>
              <Text className="text-on-surface-variant text-xs font-space">
                Equip perks for your word quests
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleClaimDailyDrop}
              activeOpacity={0.8}
              disabled={claimedDaily}
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border ${
                claimedDaily
                  ? 'bg-surface-variant/40 border-outline-variant/30 opacity-60'
                  : 'bg-primary-container/20 border-primary/50 active:scale-95'
              }`}
            >
              <MaterialIcons name={claimedDaily ? 'check' : 'card-giftcard'} size={15} color="#FFC300" />
              <Text className="text-white font-bold text-xs font-space">
                {claimedDaily ? 'CLAIMED' : 'DAILY DROP'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tokens Row */}
          <View className="flex-row items-center gap-2 flex-wrap">
            <View className="flex-row items-center gap-1.5 bg-surface-variant/40 px-3 py-1.5 rounded-full border border-outline-variant/30">
              <MaterialIcons name="toll" size={16} color="#FFC300" />
              <Text className="text-xs text-[#FFC300] font-bold font-space">{coins} 🪙</Text>
            </View>
            <View className="flex-row items-center gap-1.5 bg-surface-variant/40 px-3 py-1.5 rounded-full border border-outline-variant/30">
              <MaterialIcons name="lightbulb" size={15} color="#FFD700" />
              <Text className="text-xs text-white font-bold font-space">{hints} Hints</Text>
            </View>
            {streakShields > 0 && (
              <View className="flex-row items-center gap-1.5 bg-surface-variant/40 px-3 py-1.5 rounded-full border border-outline-variant/30">
                <MaterialIcons name="shield" size={15} color="#c084fc" />
                <Text className="text-xs text-[#c084fc] font-bold font-space">{streakShields} Shield{streakShields > 1 ? 's' : ''}</Text>
              </View>
            )}
            {chronoBoosters > 0 && (
              <View className="flex-row items-center gap-1.5 bg-surface-variant/40 px-3 py-1.5 rounded-full border border-outline-variant/30">
                <MaterialIcons name="timer" size={15} color="#34d399" />
                <Text className="text-xs text-[#34d399] font-bold font-space">{chronoBoosters} Booster{chronoBoosters > 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Section Title */}
        <View className="flex-row items-center justify-between mb-3 px-1">
          <Text className="text-lg text-white font-space font-bold">
            Power-Up Exchange
          </Text>
          <Text className="text-xs text-primary font-space">
            Instant Activation
          </Text>
        </View>

        {/* Power-Up Exchange List */}
        <View className="gap-3 mb-5">
          {powerUps.map((item) => (
            <View
              key={item.id}
              style={styles.cardBase}
              className="rounded-2xl p-3.5 flex-row items-center justify-between border"
            >
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View
                  style={{ backgroundColor: `${item.iconColor}15`, borderColor: `${item.iconColor}35` }}
                  className="w-11 h-11 rounded-xl items-center justify-center border"
                >
                  <MaterialIcons name={item.icon} size={24} color={item.iconColor} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-white font-bold text-sm font-space">
                      {item.title}
                    </Text>
                    {item.badge && (
                      <View className="bg-[#FFC300] px-1.5 py-0.5 rounded-full">
                        <Text className="text-[#001f26] font-bold text-[9px] font-space">
                          {item.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-on-surface-variant text-xs mt-0.5 font-space opacity-90" numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleExchange(item)}
                style={styles.buyBtn}
                activeOpacity={0.85}
                className="px-3.5 py-2 rounded-xl flex-row items-center gap-1 active:scale-95"
              >
                <MaterialIcons name="toll" size={14} color="#10131f" />
                <Text className="text-[#10131f] font-bold text-xs font-space">
                  {item.cost}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Quests & Earnings Tips */}
        <View style={styles.tipCard} className="rounded-2xl p-3.5 border flex-row items-center gap-3">
          <MaterialIcons name="emoji-events" size={24} color="#FFC300" />
          <View className="flex-1">
            <Text className="text-white font-bold text-xs font-space">Earn More Coins</Text>
            <Text className="text-on-surface-variant text-[11px] mt-0.5 font-space opacity-80">
              Solve anagram puzzles quickly and maintain combo streaks to earn bonus coins every round!
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar activeTab="Shop" />
    </View>
  );
}

const styles = StyleSheet.create({
  treasuryCard: {
    backgroundColor: '#151b28',
    borderColor: 'rgba(76, 215, 246, 0.25)',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardBase: {
    backgroundColor: '#161926',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  buyBtn: {
    backgroundColor: '#FFC300',
    shadowColor: '#FFC300',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tipCard: {
    backgroundColor: 'rgba(255, 195, 0, 0.05)',
    borderColor: 'rgba(255, 195, 0, 0.15)',
  }
});

