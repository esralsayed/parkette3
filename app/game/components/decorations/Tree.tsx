// app/game/components/decorations/Tree.tsx
import { AppColors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

interface TreeProps {
  size?: number;
  color?: string;
  x?: number;
  y?: number;
  variant?: 'oak' | 'pine' | 'cherry';
  opacity?: number;
}

export default function Tree({ size = 100, color, x = 0, y = 0, variant = 'oak', opacity = 1 }: TreeProps) {
  console.log('Rendering Tree:', { size, x, y, variant, opacity });
  
  // Ensure size is a valid number
  const treeSize = size;
  
  const trees = {
oak: (
  <G>
    {/* 🌳 Trunk (chunky) */}
    <Rect 
      x={treeSize * 0.43} 
      y={treeSize * 0.5} 
      width={treeSize * 0.14} 
      height={treeSize * 0.5} 
      fill={AppColors.dark} 
    />

    {/* 🌿 Top flat layer */}
    <Rect 
      x={treeSize * 0.3} 
      y={treeSize * 0.15} 
      width={treeSize * 0.4} 
      height={treeSize * 0.12} 
      fill={AppColors.blue} 
    />

    {/* 🌿 Middle layer */}
    <Rect 
      x={treeSize * 0.2} 
      y={treeSize * 0.25} 
      width={treeSize * 0.6} 
      height={treeSize * 0.15} 
      fill={AppColors.blue} 
    />

    {/* 🌿 Bottom wide layer */}
    <Rect 
      x={treeSize * 0.15} 
      y={treeSize * 0.38} 
      width={treeSize * 0.7} 
      height={treeSize * 0.18} 
      fill={AppColors.blue} 
    />

    {/* 💙 Cute darker “pixel spots” */}
    <Rect 
      x={treeSize * 0.28} 
      y={treeSize * 0.3} 
      width={treeSize * 0.08} 
      height={treeSize * 0.08} 
      fill={AppColors.dark} 
      opacity={0.4}
    />

    <Rect 
      x={treeSize * 0.6} 
      y={treeSize * 0.28} 
      width={treeSize * 0.08} 
      height={treeSize * 0.08} 
      fill={AppColors.dark} 
      opacity={0.4}
    />

    <Rect 
      x={treeSize * 0.22} 
      y={treeSize * 0.42} 
      width={treeSize * 0.08} 
      height={treeSize * 0.08} 
      fill={AppColors.dark} 
      opacity={0.4}
    />
  </G>
),
    pine: (
  <G>
    {/* 🌳 Trunk (slightly thinner than oak) */}
    <Rect 
      x={treeSize * 0.44} 
      y={treeSize * 0.6} 
      width={treeSize * 0.12} 
      height={treeSize * 0.4}
      fill={AppColors.dark} 
    />

    {/* 🌲 Top small layer */}
    <Path
      d={`
        M ${treeSize * 0.5} ${treeSize * 0.12}
        L ${treeSize * 0.68} ${treeSize * 0.28}
        L ${treeSize * 0.32} ${treeSize * 0.28}
        Z
      `}
      fill={AppColors.blue}
    />

    {/* 🌲 Middle layer (wider + slightly uneven) */}
    <Path
      d={`
        M ${treeSize * 0.5} ${treeSize * 0.25}
        L ${treeSize * 0.75} ${treeSize * 0.48}
        L ${treeSize * 0.25} ${treeSize * 0.48}
        Z
      `}
      fill={AppColors.blue}
    />

    {/* 🌲 Bottom layer (widest, chunky) */}
    <Path
      d={`
        M ${treeSize * 0.5} ${treeSize * 0.4}
        L ${treeSize * 0.85} ${treeSize * 0.68}
        L ${treeSize * 0.15} ${treeSize * 0.68}
        Z
      `}
      fill={AppColors.blue}
    />

    {/* 💙 Cute pixel-ish shadow squares */}
    <Rect
      x={treeSize * 0.38}
      y={treeSize * 0.32}
      width={treeSize * 0.07}
      height={treeSize * 0.07}
      fill={AppColors.dark}
      opacity={0.4}
    />

    <Rect
      x={treeSize * 0.55}
      y={treeSize * 0.36}
      width={treeSize * 0.07}
      height={treeSize * 0.07}
      fill={AppColors.dark}
      opacity={0.4}
    />

    <Rect
      x={treeSize * 0.3}
      y={treeSize * 0.5}
      width={treeSize * 0.07}
      height={treeSize * 0.07}
      fill={AppColors.dark}
      opacity={0.4}
    />
  </G>
),
    cherry: (
      <G>
        {/* Trunk */}
        <Rect 
          x={treeSize * 0.4} 
          y={treeSize * 0.5} 
          width={treeSize * 0.2} 
          height={treeSize * 0.5} 
          fill={AppColors.dark} 
        />
        {/* Cherry blossom canopy */}
        <Circle cx={treeSize * 0.5} cy={treeSize * 0.35} r={treeSize * 0.35} fill={AppColors.lilac} />
        <Circle cx={treeSize * 0.35} cy={treeSize * 0.4} r={treeSize * 0.25} fill={AppColors.lilac} />
        <Circle cx={treeSize * 0.65} cy={treeSize * 0.4} r={treeSize * 0.25} fill={AppColors.lilac} />
        {/* Small flowers */}
        <Circle cx={treeSize * 0.45} cy={treeSize * 0.3} r={treeSize * 0.05} fill={AppColors.lilacLight} />
        <Circle cx={treeSize * 0.55} cy={treeSize * 0.28} r={treeSize * 0.05} fill={AppColors.lilacLight} />
        <Circle cx={treeSize * 0.5} cy={treeSize * 0.25} r={treeSize * 0.04} fill={AppColors.lilacMid} />
      </G>
    )
  };

  // Validate variant
  const selectedVariant = trees[variant] || trees.oak;

  return (
    <View 
      style={[
        styles.container,
        {
          left: x,
          top: y,
          opacity: opacity,
          width: treeSize,
          height: treeSize,
        }
      ]}
    >
      <Svg width={treeSize} height={treeSize} viewBox={`0 0 ${treeSize} ${treeSize}`}>
        {selectedVariant}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 12, // Ensure trees are above ground but behind characters
  },

});