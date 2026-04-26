import { AppColors } from '@/constants/theme';
import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface BushProps {
  size?: number;
}

export default function Bush({ size = 80 }: BushProps) {
  const block = size / 8;
  const color = AppColors.blue;
  const colorFlower = AppColors.lilac;

  const pixel = (x: number, y: number) => (
    <Rect
      key={`${x}-${y}`}
      x={x * block}
      y={y * block}
      width={block}
      height={block}
      fill={color}
    />
  );

  // simple rounded blob shape
  const bushShape = [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
  ];

const pixels: React.ReactElement[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (bushShape[y][x] === 1) {
        pixels.push(pixel(x, y));
      }
    }
  }

  // simple flower (cross shape)
const flower = (cx: number, cy: number) => {
  const flowerColor = AppColors.lilac;

  return (
    <>
      {/* center */}
      <Rect
        x={cx * block}
        y={cy * block}
        width={block}
        height={block}
        fill={color}
      />

      {/* petals */}
      <Rect
        x={(cx - 1) * block}
        y={cy * block}
        width={block}
        height={block}
        fill={flowerColor}
      />
      <Rect
        x={(cx + 1) * block}
        y={cy * block}
        width={block}
        height={block}
        fill={flowerColor}
      />
      <Rect
        x={cx * block}
        y={(cy - 1) * block}
        width={block}
        height={block}
        fill={flowerColor}
      />
      <Rect
        x={cx * block}
        y={(cy + 1) * block}
        width={block}
        height={block}
        fill={flowerColor}
      />
    </>
  );
};

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* bush body */}
      {pixels}

      {/* 3 simple flowers */}
      {flower(3, 3)}
      {flower(5, 4)}
      {flower(4, 5)}
    </Svg>
  );
}