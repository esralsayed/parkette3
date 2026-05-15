// Updated Cloud.tsx (non-animated version)
// app/game/components/decorations/Cloud.tsx
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface CloudProps {
  size?: 'small' | 'medium' | 'large';
  x?: number | string; // position from left (percentage or absolute)
  y?: number | string; // position from top (percentage or absolute)
  opacity?: number;
}

export default function Cloud({ 
  size = 'medium', 
  x = '10%', 
  y = '10%', 
  opacity = 0.9
}: CloudProps) {
  
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
  
  // Define pixel sizes based on cloud size
  const pixelSize = size === 'small' ? 8 : size === 'medium' ? 10 : 12;
  const cloudWidth = size === 'small' ? 80 : size === 'medium' ? 120 : 160;
  const cloudHeight = size === 'small' ? 50 : size === 'medium' ? 70 : 90;
  
  // Pixel pattern for cloud (1 = white pixel, 0 = transparent)
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
    <View 
      style={[
        styles.container, 
        { 
          left: leftPosition,
          top: topPosition,
          opacity: opacity,
          width: cloudWidth,
          height: cloudHeight,
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
    </View>
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
    // No border radius for pixelated look
  },
});