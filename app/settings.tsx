import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { useGameStore } from '../store/gameStore';
import { getLevelConfig, MAX_LEVEL } from '../config/levelConfig';
import { playSfx, SfxType } from '../lib/soundManager';

const TRACKS = [
  { name: 'The Adventurers Hub', icon: 'explore' as const, color: '#4cd7f6' },
  { name: 'Puzzle Flow', icon: 'psychology' as const, color: '#c084fc' },
  { name: 'Pixel Rush', icon: 'speed' as const, color: '#34d399' },
];

const SFX_LABELS: { key: SfxType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'click', label: 'Button Click', icon: 'touch-app' },
  { key: 'correct', label: 'Correct Answer', icon: 'check-circle' },
  { key: 'wrong', label: 'Wrong Answer', icon: 'cancel' },
  { key: 'streak', label: 'Streak Bonus', icon: 'local-fire-department' },
  { key: 'hint', label: 'Hint Used', icon: 'lightbulb' },
  { key: 'warning', label: 'Time Warning', icon: 'timer' },
  { key: 'levelComplete', label: 'Level Complete', icon: 'emoji-events' },
  { key: 'coinReward', label: 'Coin Bonus Sound', icon: 'toll' },
];

function VolumeSlider({
  value,
  onValueChange,
  disabled,
}: {
  value: number;
  onValueChange: (v: number) => void;
  disabled?: boolean;
}) {
  const steps = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <View className="flex-row items-center gap-3">
      <MaterialIcons name="volume-down" size={20} color={disabled ? '#869397' : '#bcc9cd'} />
      <View className="flex-1 flex-row items-center justify-between">
        {steps.map((step) => {
          const isActive = Math.abs(value - step) < 0.13;
          return (
            <TouchableOpacity
              key={step}
              disabled={disabled}
              onPress={() => onValueChange(step)}
              style={[
                styles.volumeDot,
                isActive && !disabled && styles.volumeDotActive,
                disabled && styles.volumeDotDisabled,
              ]}
            >
              <View
                style={[
                  styles.volumeDotInner,
                  isActive && !disabled && styles.volumeDotInnerActive,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <MaterialIcons name="volume-up" size={20} color={disabled ? '#869397' : '#bcc9cd'} />
      <Text
        className={`text-sm font-bold font-space w-10 text-right ${disabled ? 'text-outline' : 'text-on-surface-variant'}`}
      >
        {Math.round(value * 100)}%
      </Text>
    </View>
  );
}

function ToggleSwitch({
  value,
  onToggle,
  disabled,
}: {
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onToggle}
      activeOpacity={0.7}
      style={[
        styles.toggleTrack,
        value && styles.toggleTrackOn,
        disabled && styles.toggleTrackDisabled,
      ]}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </TouchableOpacity>
  );
}

export default function Settings() {
  const selectedMusicTrack = useGameStore((s) => s.selectedMusicTrack);
  const setSelectedMusicTrack = useGameStore((s) => s.setSelectedMusicTrack);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);
  const isMusicPlaying = useGameStore((s) => s.isMusicPlaying);
  const setIsMusicPlaying = useGameStore((s) => s.setIsMusicPlaying);

  const sfxEnabled = useGameStore((s) => s.sfxEnabled);
  const setSfxEnabled = useGameStore((s) => s.setSfxEnabled);
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const setSfxVolume = useGameStore((s) => s.setSfxVolume);
  const sfxSettings = useGameStore((s) => s.sfxSettings);
  const toggleSfxSetting = useGameStore((s) => s.toggleSfxSetting);

  const currentLevel = useGameStore((s) => s.currentLevel);
  const score = useGameStore((s) => s.score);
  const coins = useGameStore((s) => s.coins);
  const energy = useGameStore((s) => s.energy);
  const hints = useGameStore((s) => s.hints);
  const streakShields = useGameStore((s) => s.streakShields);
  const chronoBoosters = useGameStore((s) => s.chronoBoosters);
  const restoreCredits = useGameStore((s) => s.restoreCredits);
  const resetGame = useGameStore((s) => s.resetGame);

  const handleTestSfx = (type: SfxType) => {
    playSfx(type);
  };

  const handleRefillCredits = () => {
    restoreCredits(500);
    playSfx('streak');
    Alert.alert('Credits Restored! ⚡', `Restored 500 Credits and recharged Energy!\n\nCurrent Balance: 🪙 ${coins + 500} Coins`);
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset Game Progress?',
      `This will start you back at Level 1, clear your word history, and reset your coins, score, and energy to defaults. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetGame(),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <TopAppBar />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl text-on-background font-bold tracking-tight font-space">
            Sound Settings
          </Text>
          <Text className="text-on-surface-variant text-base mt-1 text-center font-space opacity-80">
            Customize your music and sound experience
          </Text>
        </View>

        {/* Background Music Section */}
        <View style={styles.sectionCard} className="rounded-2xl p-5 mb-6">
          <View className="flex-row items-center gap-3 mb-5">
            <View style={styles.sectionIcon} className="w-10 h-10 rounded-xl items-center justify-center">
              <MaterialIcons name="music-note" size={22} color="#4cd7f6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg text-white font-bold font-space">Background Music</Text>
              <Text className="text-on-surface-variant text-xs font-space">
                {isMusicPlaying ? 'Playing' : 'Paused'} &bull; {TRACKS[selectedMusicTrack].name}
              </Text>
            </View>
            <ToggleSwitch value={isMusicPlaying} onToggle={() => setIsMusicPlaying(!isMusicPlaying)} />
          </View>

          {/* Track Picker */}
          <View className="gap-3 mb-5">
            {TRACKS.map((track, index) => {
              const isSelected = selectedMusicTrack === index;
              return (
                <TouchableOpacity
                  key={track.name}
                  onPress={() => setSelectedMusicTrack(index)}
                  activeOpacity={0.8}
                  style={[
                    styles.trackCard,
                    isSelected && { borderColor: track.color, backgroundColor: `${track.color}10` },
                  ]}
                  className="flex-row items-center gap-3 p-3 rounded-xl border"
                >
                  <View
                    style={{
                      backgroundColor: isSelected ? track.color : 'rgba(50, 52, 66, 0.7)',
                    }}
                    className="w-10 h-10 rounded-xl items-center justify-center"
                  >
                    <MaterialIcons
                      name={track.icon}
                      size={20}
                      color={isSelected ? '#10131f' : track.color}
                    />
                  </View>
                  <Text
                    className={`flex-1 font-semibold font-space ${isSelected ? 'text-white' : 'text-on-surface-variant'}`}
                  >
                    {track.name}
                  </Text>
                  <View
                    style={{
                      borderColor: isSelected ? track.color : 'rgba(134, 147, 151, 0.4)',
                      backgroundColor: isSelected ? track.color : 'transparent',
                    }}
                    className="w-5 h-5 rounded-full border-2 items-center justify-center"
                  >
                    {isSelected && <MaterialIcons name="check" size={12} color="#10131f" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Music Volume */}
          <View>
            <Text className="text-on-surface-variant text-xs font-bold uppercase font-space mb-3">
              Music Volume
            </Text>
            <VolumeSlider
              value={musicVolume}
              onValueChange={setMusicVolume}
              disabled={!isMusicPlaying}
            />
          </View>
        </View>

        {/* Sound Effects Section */}
        <View style={styles.sectionCard} className="rounded-2xl p-5 mb-6">
          <View className="flex-row items-center gap-3 mb-5">
            <View style={styles.sectionIcon} className="w-10 h-10 rounded-xl items-center justify-center">
              <MaterialIcons name="surround-sound" size={22} color="#c084fc" />
            </View>
            <View className="flex-1">
              <Text className="text-lg text-white font-bold font-space">Sound Effects</Text>
              <Text className="text-on-surface-variant text-xs font-space">
                {sfxEnabled ? 'Enabled' : 'Disabled'} &bull; {Object.values(sfxSettings).filter(Boolean).length} of {Object.keys(sfxSettings).length} active
              </Text>
            </View>
            <ToggleSwitch value={sfxEnabled} onToggle={() => setSfxEnabled(!sfxEnabled)} />
          </View>

          {/* Individual SFX Toggles */}
          <View className="gap-2 mb-5">
            {SFX_LABELS.map((sfx) => {
              const isOn = sfxSettings[sfx.key];
              return (
                <View
                  key={sfx.key}
                  style={[styles.sfxRow, !sfxEnabled && { opacity: 0.4 }]}
                  className="flex-row items-center gap-3 p-3 rounded-xl"
                >
                  <MaterialIcons
                    name={sfx.icon}
                    size={20}
                    color={isOn && sfxEnabled ? '#c084fc' : '#869397'}
                  />
                  <Text
                    className={`flex-1 font-semibold font-space text-sm ${isOn && sfxEnabled ? 'text-white' : 'text-outline'}`}
                  >
                    {sfx.label}
                  </Text>
                  <TouchableOpacity
                    disabled={!sfxEnabled}
                    onPress={() => handleTestSfx(sfx.key)}
                    style={styles.testBtn}
                    className="px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-xs font-bold font-space text-on-surface-variant">
                      TEST
                    </Text>
                  </TouchableOpacity>
                  <ToggleSwitch
                    value={isOn}
                    onToggle={() => toggleSfxSetting(sfx.key)}
                    disabled={!sfxEnabled}
                  />
                </View>
              );
            })}
          </View>

          {/* SFX Volume */}
          <View>
            <Text className="text-on-surface-variant text-xs font-bold uppercase font-space mb-3">
              Effects Volume
            </Text>
            <VolumeSlider
              value={sfxVolume}
              onValueChange={setSfxVolume}
              disabled={!sfxEnabled}
            />
          </View>
        </View>

        {/* Game Progress Section */}
        <View style={styles.sectionCard} className="rounded-2xl p-5 mb-6">
          <View className="flex-row items-center gap-3 mb-5">
            <View style={styles.sectionIcon} className="w-10 h-10 rounded-xl items-center justify-center">
              <MaterialIcons name="emoji-events" size={22} color="#FFC300" />
            </View>
            <View className="flex-1">
              <Text className="text-lg text-white font-bold font-space">Game Progress</Text>
              <Text className="text-on-surface-variant text-xs font-space">
                Your progress is saved automatically on this device
              </Text>
            </View>
          </View>

          <View className="gap-2 mb-5">
            <View style={styles.sfxRow} className="flex-row items-center justify-between p-3 rounded-xl">
              <Text className="text-sm font-semibold font-space text-white">
                Current Level
              </Text>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="flag" size={16} color="#FFC300" />
                <Text className="text-sm font-bold font-space text-primary">
                  {currentLevel} of {MAX_LEVEL} · {getLevelConfig(currentLevel).tier}
                </Text>
              </View>
            </View>
            <View style={styles.sfxRow} className="flex-row items-center justify-between p-3 rounded-xl">
              <Text className="text-sm font-semibold font-space text-white">
                Total Score
              </Text>
              <Text className="text-sm font-bold font-space text-primary">
                {score}
              </Text>
            </View>
            <View style={styles.sfxRow} className="flex-row items-center justify-between p-3 rounded-xl">
              <Text className="text-sm font-semibold font-space text-white">
                Credits / Coins
              </Text>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="toll" size={16} color="#FFC300" />
                <Text className="text-sm font-bold font-space text-primary">
                  🪙 {coins}
                </Text>
              </View>
            </View>
            <View style={styles.sfxRow} className="flex-row items-center justify-between p-3 rounded-xl">
              <Text className="text-sm font-semibold font-space text-white">
                Hint Charges
              </Text>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="lightbulb" size={16} color="#FFD700" />
                <Text className="text-sm font-bold font-space text-[#FFD700]">
                  💡 {hints}
                </Text>
              </View>
            </View>
            <View style={styles.sfxRow} className="flex-row items-center justify-between p-3 rounded-xl">
              <Text className="text-sm font-semibold font-space text-white">
                Streak Shields
              </Text>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="shield" size={16} color="#c084fc" />
                <Text className="text-sm font-bold font-space text-[#c084fc]">
                  🛡️ {streakShields}
                </Text>
              </View>
            </View>
            <View style={styles.sfxRow} className="flex-row items-center justify-between p-3 rounded-xl">
              <Text className="text-sm font-semibold font-space text-white">
                Chrono Boosters
              </Text>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="timer" size={16} color="#34d399" />
                <Text className="text-sm font-bold font-space text-[#34d399]">
                  ⏱️ {chronoBoosters}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/saga')}
            style={styles.labBtn}
            className="w-full py-3.5 rounded-xl flex-row items-center justify-center gap-2 mb-3 active:scale-95"
          >
            <MaterialIcons name="science" size={20} color="#FFD700" />
            <Text className="text-[#FFD700] font-bold uppercase tracking-wider text-sm font-space">
              Level Testing Lab & Selector
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRefillCredits}
            style={styles.refillBtn}
            className="w-full py-3.5 rounded-xl flex-row items-center justify-center gap-2 mb-3 active:scale-95"
          >
            <MaterialIcons name="bolt" size={20} color="#4cd7f6" />
            <Text className="text-[#4cd7f6] font-bold uppercase tracking-wider text-sm font-space">
              Instant Stamina Recharge
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmReset}
            style={styles.dangerBtn}
            className="w-full py-3.5 rounded-xl flex-row items-center justify-center gap-2"
          >
            <MaterialIcons name="restart-alt" size={20} color="#ff7b7b" />
            <Text className="text-[#ff7b7b] font-bold uppercase tracking-wider text-sm font-space">
              Reset Game Progress
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Footer */}
        <View className="items-center mt-2 mb-4">
          <View className="flex-row items-center gap-2 bg-surface-container/50 px-4 py-3 rounded-xl border border-surface-variant/40">
            <MaterialIcons name="verified" size={18} color="#4cd7f6" />
            <Text className="text-on-surface-variant text-xs font-space opacity-80">
              Word Explorer Mobile v1.0.0 &bull; Offline Ready
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar activeTab="Settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#1d1f2c',
    borderColor: 'rgba(50, 52, 66, 0.8)',
    borderWidth: 1.5,
  },
  sectionIcon: {
    backgroundColor: 'rgba(76, 215, 246, 0.1)',
  },
  trackCard: {
    backgroundColor: '#191b28',
    borderColor: 'rgba(50, 52, 66, 0.6)',
  },
  sfxRow: {
    backgroundColor: 'rgba(25, 27, 40, 0.6)',
  },
  testBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderColor: 'rgba(192, 132, 252, 0.3)',
    borderWidth: 1,
  },
  dangerBtn: {
    backgroundColor: 'rgba(255, 123, 123, 0.12)',
    borderColor: 'rgba(255, 123, 123, 0.35)',
    borderWidth: 1.5,
  },
  labBtn: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: 'rgba(255, 215, 0, 0.5)',
    borderWidth: 1.5,
  },
  refillBtn: {
    backgroundColor: 'rgba(76, 215, 246, 0.12)',
    borderColor: 'rgba(76, 215, 246, 0.4)',
    borderWidth: 1.5,
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#323442',
    borderWidth: 2,
    borderColor: '#3d494c',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleTrackOn: {
    backgroundColor: '#06B6D4',
    borderColor: '#4cd7f6',
  },
  toggleTrackDisabled: {
    opacity: 0.5,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#bcc9cd',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffffff',
  },
  volumeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#323442',
    borderWidth: 2,
    borderColor: '#3d494c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeDotActive: {
    borderColor: '#4cd7f6',
    backgroundColor: 'rgba(76, 215, 246, 0.15)',
  },
  volumeDotDisabled: {
    opacity: 0.4,
  },
  volumeDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  volumeDotInnerActive: {
    backgroundColor: '#4cd7f6',
  },
});
