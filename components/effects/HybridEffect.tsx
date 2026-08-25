import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedProps, withTiming, withSequence, withDelay, Easing, createAnimatedComponent } from 'react-native-reanimated';

const AnimatedCircle = createAnimatedComponent(Circle);

const CONFETTI_COLORS = ['#FFD700', '#FF2E63', '#00E5FF', '#7C3AED', '#00E676', '#FF6D00', '#FFFFFF', '#FFC400'];

const PIECES = Array.from({ length: 56 }, (_, i) => {
  const angle = -90 + ((i * 23) % 140) - 70;
  const rad = (angle * Math.PI) / 180;
  const spread = 55 + (i % 7) * 16;
  return {
    dx: Math.cos(rad) * spread,
    up: 80 + (i % 7) * 18,
    fall: 250 + (i % 5) * 34,
    rotSpeed: 360 + (i % 6) * 120,
    delay: (i % 5) * 16,
    w: 7 + (i % 3) * 2,
    h: 10 + (i % 4) * 3,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    circle: i % 3 === 1,
  };
});

function ConfettiPiece({ dx, up, fall, rotSpeed, delay, w, h, color, circle }: any) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 2200, easing: Easing.linear }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const y = -up * p.value + fall * p.value * p.value;
    let opacity = 1;
    if (p.value < 0.08) opacity = p.value / 0.08;
    if (p.value > 0.85) opacity = Math.max(0, 1 - (p.value - 0.85) / 0.15);
    return {
      transform: [
        { translateX: dx * p.value },
        { translateY: y },
        { rotate: `${rotSpeed * p.value}deg` },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: -w / 2,
          top: -h / 2,
          width: w,
          height: circle ? w : h,
          borderRadius: circle ? w / 2 : 1.5,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

function ConfettiBurst() {
  return (
    <View style={{ position: 'absolute', left: '50%', top: 210, width: 0, height: 0 }}>
      {PIECES.map((piece, i) => (
        <ConfettiPiece key={i} {...piece} />
      ))}
    </View>
  );
}

function WhiteFlash() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(0.85, { duration: 120 }),
      withTiming(0, { duration: 380 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          zIndex: 300,
        },
        animatedStyle,
      ]}
    />
  );
}

function FireFlash() {
  const r = useSharedValue(6);
  const opacity = useSharedValue(1);

  useEffect(() => {
    r.value = withTiming(74, { duration: 420, easing: Easing.out(Easing.quad) });
    opacity.value = withDelay(220, withTiming(0, { duration: 260 }));
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    r: r.value,
    opacity: opacity.value,
  }));

  return <AnimatedCircle cx={100} cy={100} r={6} fill="url(#hybridFire)" animatedProps={animatedProps} />;
}

function StreakText() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withDelay(150, withTiming(1.35, { duration: 180, easing: Easing.out(Easing.back(1.5)) })),
      withTiming(1, { duration: 160 })
    );
    opacity.value = withDelay(1700, withTiming(0, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ position: 'absolute', top: 40 }, animatedStyle]}>
      <Text
        style={{
          fontSize: 44,
          fontWeight: '900',
          fontStyle: 'italic',
          color: '#00FFFF',
          textShadowColor: '#FF007F',
          textShadowOffset: { width: 3, height: 3 },
          textShadowRadius: 5,
        }}
      >
        ON FIRE! 🔥
      </Text>
    </Animated.View>
  );
}

export default function HybridEffect() {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 200,
      }}
    >
      <WhiteFlash />
      <ConfettiBurst />
      <View style={{ position: 'absolute', left: '50%', top: 210, width: 0, height: 0 }}>
        <Svg width={200} height={200} style={{ left: -100, top: -100 }}>
          <Defs>
            <RadialGradient id="hybridFire" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="30%" stopColor="#FFD54F" stopOpacity="0.95" />
              <Stop offset="60%" stopColor="#FF6D00" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#FF3D00" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <FireFlash />
        </Svg>
      </View>
      <StreakText />
    </View>
  );
}
