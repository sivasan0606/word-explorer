import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_400Regular, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
// @ts-ignore
import '../global.css';

LogBox.ignoreAllLogs();
configureReanimatedLogger({ level: ReanimatedLogLevel.error, strict: false });

const MUSIC_TRACKS = [
  require('../assets/Music/The_Adventurers_Hub_2026-08-14T173908.mp4'),
  require('../assets/Music/Puzzle_Flow_2026-08-14T174135.mp4'),
  require('../assets/Music/Pixel_Rush_2026-08-14T174250.mp4'),
];

function BackgroundMusic() {
  const isMusicPlaying = useGameStore((state) => state.isMusicPlaying);
  const selectedMusicTrack = useGameStore((state) => state.selectedMusicTrack);
  const musicVolume = useGameStore((state) => state.musicVolume);
  const player = useAudioPlayer(MUSIC_TRACKS[0]);
  const prevTrack = useRef(selectedMusicTrack);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (prevTrack.current !== selectedMusicTrack) {
      const trackSource = MUSIC_TRACKS[selectedMusicTrack] || MUSIC_TRACKS[0];
      player.replace(trackSource);
      prevTrack.current = selectedMusicTrack;
    }
  }, [selectedMusicTrack, player]);

  useEffect(() => {
    const safeVolume = typeof musicVolume === 'number' && Number.isFinite(musicVolume)
      ? Math.min(1, Math.max(0, musicVolume))
      : 1.0;
    player.volume = safeVolume;
  }, [musicVolume, player]);

  useEffect(() => {
    if (isMusicPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isMusicPlaying, player]);

  return null;
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Space Grotesk': SpaceGrotesk_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded && Platform.OS !== 'web') {
    return null;
  }

  // NOTE: Do NOT wrap with <SafeAreaProvider> here.
  // expo-router already provides SafeAreaProvider in ExpoRoot.
  // A double SafeAreaProvider breaks the navigation context chain.
  return (
    <>
      {Platform.OS !== 'web' && <BackgroundMusic />}
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: '#10131f' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="category" />
        <Stack.Screen name="shop" />
        <Stack.Screen name="pet" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="saga" />
        <Stack.Screen name="journey" />
        <Stack.Screen name="energy" />
        <Stack.Screen name="success" />
      </Stack>
    </>
  );
}
