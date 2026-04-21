// app/game/components/decorations/AnimatedCloud.tsx
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AnimatedCloudProps {
  size?: 'small' | 'medium' | 'large';
  x?: number | string;
  y?: number | string;
  opacity?: number;
  floatRange?: number; // How many pixels to float up/down
  floatSpeed?: number; // Speed of floating animation
}

export default function AnimatedCloud({ 
  size = 'medium', 
  x = 10, 
  y = 10, 
  opacity = 0.9,
  floatRange = 15,
  floatSpeed = 3000
}: AnimatedCloudProps) {
  
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: floatSpeed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: floatSpeed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -floatRange],
  });
  
  // Convert percentage strings to actual pixel values
  const getPosition = (position: number | string): number => {
    if (typeof position === 'number') return position;
    if (typeof position === 'string') {
      if (position.includes('%')) {
        const percentage = parseFloat(position) / 100;
        return screenWidth * percentage;
      }
      return parseFloat(position);
    }
    return 0;
  };
  
  // Pixel pattern for cloud
  const pixelSize = size === 'small' ? 8 : size === 'medium' ? 10 : 12;
  const cloudWidth = size === 'small' ? 80 : size === 'medium' ? 120 : 160;
  const cloudHeight = size === 'small' ? 50 : size === 'medium' ? 70 : 90;
  
  const cloudPattern = size === 'small' ? [
    [0,0,0,1,1,0,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,0,1,1,0,0,0],
  ] : size === 'medium' ? [
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,0,1,1,1,1,0,0,0],
  ] : [
    [0,0,0,0,0,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,1,1,1,1,0,0,0,0],
  ];

  const leftPosition = getPosition(x);
  const topPosition = getPosition(y);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          left: leftPosition,
          top: topPosition,
          opacity: opacity,
          width: cloudWidth,
          height: cloudHeight,
          transform: [{ translateY }],
        }
      ]}
      pointerEvents="none"
    >
      {cloudPattern.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((pixel, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={[
                styles.pixel,
                {
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: pixel === 1 ? '#FFFFFF' : 'transparent',
                }
              ]}
            />
          ))}
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 8,
  },
  row: {
    flexDirection: 'row',
  },
  pixel: {
    // Pixelated style - no border radius
  },
});