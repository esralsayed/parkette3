// app/game/components/Confetti.tsx

import { AppColors } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const CONFETTI_COUNT = 25;

// Only your theme colors
const COLORS = [AppColors.blue, AppColors.lilac];

export default function Confetti({ trigger }: { trigger: boolean }) {
  const pieces = useRef(
    Array.from({ length: CONFETTI_COUNT }).map(() => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(-20),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.8 + Math.random() * 0.6), // adds variation
    }))
  ).current;

  useEffect(() => {
    if (!trigger) return;

    pieces.forEach((p, i) => {
      p.y.setValue(-20);
      p.opacity.setValue(1);

      Animated.parallel([
        Animated.timing(p.y, {
          toValue: height + 50,
          duration: 1800 + Math.random() * 800,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 2000,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [trigger]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const rotate = p.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.piece,
              {
                backgroundColor: COLORS[i % COLORS.length],
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { rotate },
                  { scale: p.scale },
                ],
                opacity: p.opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    width: 10,
    height: 14,
    borderRadius: 3,
  },
});