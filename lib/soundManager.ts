import { createAudioPlayer, preload, AudioPlayer } from 'expo-audio';
import { useGameStore } from '../store/gameStore';

const sfxSources = {
  click: require('../assets/SFX/click.mp3'),
  correct: require('../assets/SFX/correct.mp3'),
  wrong: require('../assets/SFX/wrong.mp3'),
  streak: require('../assets/SFX/streak.mp3'),
  hint: require('../assets/SFX/hint.mp3'),
  warning: require('../assets/SFX/warning.mp3'),
  levelComplete: require('../assets/SFX/level_complete.mp3'),
  coinReward: require('../assets/SFX/coin_reward.mp3'),
};

export type SfxType = keyof typeof sfxSources;

// Lazy-initialized audio players to prevent top-level module load crashes
const players: Partial<Record<SfxType, AudioPlayer>> = {};

function getPlayer(type: SfxType): AudioPlayer | null {
  try {
    if (!players[type] && sfxSources[type]) {
      players[type] = createAudioPlayer(sfxSources[type]);
    }
    return players[type] ?? null;
  } catch {
    return null;
  }
}

export async function playSfx(type: SfxType) {
  try {
    if (!type || !(type in sfxSources)) return;
    const { sfxEnabled, sfxSettings, sfxVolume } = useGameStore.getState();

    if (!sfxEnabled || !sfxSettings || !sfxSettings[type]) return;

    const player = getPlayer(type);
    if (!player) return;

    const safeVolume = typeof sfxVolume === 'number' && Number.isFinite(sfxVolume)
      ? Math.min(1, Math.max(0, sfxVolume))
      : 1.0;
    player.volume = safeVolume;
    await player.seekTo(0);
    player.play();
  } catch {
    // Gracefully handle playback issues without unhandled rejections or crashes
  }
}
