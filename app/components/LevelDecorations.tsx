// LevelDecorations.tsx — now just a resolver, zero visual logic

import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { SCENE_REGISTRY } from '../services/sceneConfig';
import { ATMOSPHERE_PRESETS, CHARACTER_SIZE_MAP, CharacterElement, DEPTH_OPACITY, DEPTH_SCALE, SLOT_MAP } from '../services/sceneSystem';
import Tree from './decorations/Tree';
import FindFriendsGame from './minigames/FindFriendsGame';

interface LevelDecorationsProps {
  // levelId?: string;
  // chapterTitle?: string;
  // sceneIndex?: number;
  sceneKey?: string; // NEW — single key to look up scene config, e.g. "park_scene_0"
  onGameComplete?: (success: boolean, foundCount: number) => void; // Callback for game completion
}

const { width: W, height: H } = Dimensions.get('window');
const MINIGAME_MAP: Record<string, any> = { FindFriendsGame };

export default function LevelDecorations({ sceneKey, onGameComplete }: LevelDecorationsProps) {
  if (!sceneKey) return null;
  console.log('🔑 Scene registry lookup:', sceneKey);
  console.log('🗂️ Available keys:', Object.keys(SCENE_REGISTRY));
  // const config = SCENE_REGISTRY[`${levelId}_${chapterTitle}_${sceneIndex}`];
  const config = SCENE_REGISTRY[sceneKey];

  if (!config) return null;

  const atmos = ATMOSPHERE_PRESETS[config.atmosphere];
console.log('are we in narrative mode?'); 
  return (
    <View style={styles.fullLayer} pointerEvents="none">
      {/* Atmosphere overlay */}
      {atmos.ambientOverlay && (
        <View style={[styles.fullLayer, { backgroundColor: atmos.ambientOverlay }]} />
      )}

      {/* Clouds — driven by atmosphere, not per-scene flags */}
      {/* {atmos.showClouds && (
        <CloudsGroup sceneIndex={sceneKey} animated={true} />
      )} */}

      {/* Elements — rendered in definition order (back to front) */}
      {config.elements.map((el, i) => {
        const depth  = el.depth ?? 'near';
        const scale  = DEPTH_SCALE[depth];
        const opac   = DEPTH_OPACITY[depth];
        const size   = CHARACTER_SIZE_MAP[el.size] * scale;
        const left   = SLOT_MAP[el.slot];

        if (el.kind === 'tree') {
          const leftPercent = typeof left === 'string' ? parseFloat(left) / 100 * W : W / 2;
          // Trees are 2x taller than wide; anchor bottom to ground line (ground = ~150px from bottom)
          const GROUND_HEIGHT = 100;
          const treeHeight = size * 2;
          const treeY = H - GROUND_HEIGHT - treeHeight + size * 0.3;

          return (
            <View key={i} style={{ opacity: opac, zIndex: 1 + i }}>
              <Tree
                variant={el.variant}
                size={size*1.5}
                x={leftPercent}
                y={treeY}
              />
            </View>
          );
        }

        if (el.kind === 'character' || el.kind === 'prop') {
          return (
            <View key={i} style={[styles.element, {
        left,
        bottom: '5%',
        width: size,
        height: size,
        opacity: opac,
        transform: el.kind === 'character' && (el as CharacterElement).flipped 
          ? [{ scaleX: -1 }] 
          : [],
        zIndex: 20 + i + ((el as CharacterElement).zOffset ?? 0),
      }]}>
        <Image source={el.image} style={styles.fill} resizeMode="contain" />
      </View>
          );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fullLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  element:   { position: 'absolute' },
  fill:      { width: '100%', height: '100%' },
});