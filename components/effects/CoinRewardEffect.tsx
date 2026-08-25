import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const COIN_COUNT = 16;
const COIN_PARTICLES = Array.from({ length: COIN_COUNT }, (_, i) => {
  const angle = (i * (360 / COIN_COUNT) * Math.PI) / 180;
  const distance = 70 + (i % 3) * 35;
  return {
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance - 20,
    delay: (i % 4) * 45,
    size: 20 + (i % 3) * 6,
    rot: (i % 2 === 0 ? 1 : -1) * (360 + (i % 5) * 90),
  };
});

function FlyingCoin({ dx, dy, delay, size, rot }: { dx: number; dy: number; delay: number; size: number; rot: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 1200, easing: Easing.out(Easing.back(1.4)) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const currentX = dx * p;
    const currentY = dy * p + (p > 0.6 ? (p - 0.6) * 50 : 0);
    const opacity = p < 0.1 ? p / 0.1 : p > 0.75 ? Math.max(0, 1 - (p - 0.75) / 0.25) : 1;
    const scale = p < 0.2 ? p / 0.2 : p > 0.8 ? Math.max(0.2, 1 - (p - 0.8) / 0.2) : 1;

    return {
      transform: [
        { translateX: currentX },
        { translateY: currentY },
        { rotate: `${rot * p}deg` },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#FFD700',
          borderWidth: 2,
          borderColor: '#FFF59D',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#FFC107',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 8,
          elevation: 6,
        },
        animatedStyle,
      ]}
    >
      <Text style={{ fontSize: size * 0.55, fontWeight: '900', color: '#B78103' }}>🪙</Text>
    </Animated.View>
  );
}

interface CoinRewardEffectProps {
  bonusAmount?: number;
}

export default function CoinRewardEffect({ bonusAmount = 20 }: CoinRewardEffectProps) {
  const badgeScale = useSharedValue(0.4);
  const badgeOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);

  useEffect(() => {
    // Animate glow and badge pop-in
    glowOpacity.value = withSequence(
      withDelay(100, withTiming(1, { duration: 400 })),
      withTiming(0.7, { duration: 800 })
    );

    badgeOpacity.value = withDelay(150, withTiming(1, { duration: 250 }));
    badgeScale.value = withDelay(
      150,
      withSpring(1, { damping: 10, stiffness: 120 })
    );

    // Number counting roll-up effect
    const stepDuration = 35;
    const totalSteps = 20;
    let step = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        step += 1;
        const currentVal = Math.min(bonusAmount, Math.round((step / totalSteps) * bonusAmount));
        setDisplayedCoins(currentVal);
        if (step >= totalSteps) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, 250);

    return () => clearTimeout(timer);
  }, [bonusAmount]);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Radiant Glow Behind Badge */}
      <Animated.View style={[styles.glowRing, glowAnimatedStyle]} />

      {/* Particle Coin Shower */}
      <View style={styles.particleOrigin}>
        {COIN_PARTICLES.map((particle, i) => (
          <FlyingCoin key={i} {...particle} />
        ))}
      </View>

      {/* Bouncy Reward Badge */}
      <Animated.View style={[styles.rewardCard, badgeAnimatedStyle]}>
        <View style={styles.badgeHeader}>
          <MaterialIcons name="stars" size={24} color="#FFD700" />
          <Text style={styles.rewardLabel}>LEVEL CLEAR BONUS</Text>
          <MaterialIcons name="stars" size={24} color="#FFD700" />
        </View>

        <View style={styles.coinRow}>
          <View style={styles.coinIconWrapper}>
            <MaterialIcons name="monetization-on" size={32} color="#FFD700" />
          </View>
          <Text style={styles.coinText}>
            +{displayedCoins} <Text style={styles.coinSubtext}>COINS</Text>
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  particleOrigin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 0,
    height: 0,
    zIndex: 10,
  },
  glowRing: {
    position: 'absolute',
    width: 240,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFD700',
    opacity: 0.35,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 12,
  },
  rewardCard: {
    width: '100%',
    backgroundColor: '#2A1B4E',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 20,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  rewardLabel: {
    color: '#FFE082',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: 'Space Grotesk',
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinIconWrapper: {
    backgroundColor: '#FFD70025',
    borderRadius: 16,
    padding: 2,
  },
  coinText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    fontFamily: 'Space Grotesk',
    letterSpacing: 1,
    textShadowColor: '#B78103',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  coinSubtext: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8E1',
    letterSpacing: 1.5,
  },
});
