// app/game/components/decorations/Bush.tsx - Ultra Pixelated Version
import { AppColors } from '@/constants/theme';
import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface BushProps {
  size?: number;
  x?: number;
  y?: number;
  variant?: 'round' | 'spread' | 'flowering';
}

export default function Bush({ size = 60, x = 0, y = 0, variant = 'round' }: BushProps) {
  const blockSize = size / 8; // 8x8 grid for pixel art
  
  const pixelBlock = (col: number, row: number, fill: string) => (
    <Rect 
      x={col * blockSize} 
      y={row * blockSize} 
      width={blockSize} 
      height={blockSize} 
      fill={fill} 
    />
  );

  // Pixel art grid (8x8) for each variant
  const getBushGrid = () => {
    switch(variant) {
      case 'round':
  return [
  [0,0,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
  [0,0,0,1,1,0,0,0],
];

case 'flowering':
  return [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,2,3,3,2,1,0],
    [0,1,2,3,3,2,1,0],
    [0,1,3,3,3,2,1,0],
    [1,1,2,3,2,1,1,1],
    [1,1,1,2,1,1,1,1],
    [2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2],
  ];
      default:
        return [];
    }
  };

  const getColor = (value: number) => {
const colors: {[key: number]: string} = {
  0: 'transparent',

  // 🌿 Greens (soft + cute palette)
  1: AppColors.blue, // highlight (top light)
  2: AppColors.dark, // main green
  3: AppColors.dark, // shadow core

  // 🌸 Flowers
  4: AppColors.lilac, // pink
  5: AppColors.blue, // yellow center
};
    return colors[value] || 'transparent';
  };

  const grid = getBushGrid();
  const blocks = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const value = grid[row]?.[col];
      if (value && value !== 0) {
        blocks.push(pixelBlock(col, row, getColor(value)));
      }
    }
  }

const renderPixelFlower = (col: number, row: number) => {
  const x = col * blockSize;
  const y = row * blockSize;

  const petal = AppColors.lilac;
  const center = '#ffffff';

  return (
    <>
      {/* center */}
      <Rect x={x} y={y} width={blockSize} height={blockSize} fill={center} />

      {/* petals (cross shape) */}
      <Rect x={x} y={y - blockSize} width={blockSize} height={blockSize} fill={petal} />
      <Rect x={x - blockSize} y={y} width={blockSize} height={blockSize} fill={petal} />
      <Rect x={x + blockSize} y={y} width={blockSize} height={blockSize} fill={petal} />
      <Rect x={x} y={y + blockSize} width={blockSize} height={blockSize} fill={petal} />
    </>
  );
};

  return (
    <View style={{ position: 'absolute', left: x, top: y }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {blocks}
        {/* Add 4+1 pattern flowers on top of the bush */}
        {variant === 'flowering' && (
  <>
{renderPixelFlower(2, 3)}
{renderPixelFlower(5, 4)}
{renderPixelFlower(3, 5)}
  </>
)}
      </Svg>
      <Rect
  x={size * 0.2}
  y={size * 0.75}
  width={size * 0.6}
  height={blockSize}
  fill="#00000022"
/>
    </View>
  );
}