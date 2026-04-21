// Updated CloudsGroup.tsx (using numbers for positions)
// app/game/components/decorations/CloudsGroup.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import AnimatedCloud from './AnimatedCloud';
import Cloud from './cloud';

interface CloudsGroupProps {
  sceneIndex?: number;
  animated?: boolean;
}

export default function CloudsGroup({ sceneIndex = 0, animated = false }: CloudsGroupProps) {
  // Different cloud arrangements based on scene
  const getCloudsForScene = () => {
    switch(sceneIndex) {
      case 0:
        return [
          { size: 'large', x: -20, y: 20, opacity: 0.8 },
          { size: 'medium', x: 120, y: 50, opacity: 0.7 },
          { size: 'small', x: 250, y: 30, opacity: 0.9 },
          { size: 'medium', x: 320, y: 60, opacity: 0.6 },
        ];
      case 1:
        return [
          { size: 'medium', x: 40, y: 30, opacity: 0.7 },
          { size: 'large', x: 200, y: 10, opacity: 0.8 },
          { size: 'small', x: 320, y: 40, opacity: 0.9 },
        ];
      default:
        return [
          { size: 'medium', x: 80, y: 40, opacity: 0.8 },
          { size: 'small', x: 240, y: 60, opacity: 0.7 },
          { size: 'large', x: 300, y: 20, opacity: 0.6 },
        ];
    }
  };

  const clouds = getCloudsForScene();
  const CloudComponent = animated ? AnimatedCloud : Cloud;

  return (
    <View style={styles.container} pointerEvents="none">
      {clouds.map((cloud, index) => (
        <CloudComponent
          key={index}
          size={cloud.size as any}
          x={cloud.x}
          y={cloud.y}
          opacity={cloud.opacity}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 700,
    right: 0,
    bottom: 0,
    zIndex: 8,

  },
});