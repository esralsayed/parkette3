// sceneSystem.ts

// ─────────────────────────────────────────────
// 1. LAYER TYPES — every visual element has a type
//    with constrained options, not raw style objects
// ─────────────────────────────────────────────
import React from "react";
import { SvgProps } from "react-native-svg";

type SvgComponent = React.FC<SvgProps>;
type RasterSource = number | { uri: string };
export type SceneImageSource = SvgComponent | RasterSource;

export type LayerType = 'sky' | 'background' | 'midground' | 'ground' | 'foreground' | 'ui';

// Character sizes are named, not arbitrary numbers
export type CharacterSize = 'small' | 'medium' | 'large' | 'hero' | 'herox' | 'xlarge' | 'semixlarge' | 'semixxlarge' | 'xxlarge' | 'xxxlarge';
export const CHARACTER_SIZE_MAP: Record<CharacterSize, number> = {
  small:  120,
  medium: 200,
  large:  300,
  hero:   420,
  herox: 520,
  xlarge: 620,
  semixlarge: 720,
  semixxlarge: 830,
  xxlarge: 900,
  xxxlarge: 1100,
};

import { DimensionValue } from "react-native";

// Horizontal positions are named slots, not raw percentages
export type HorizontalSlot = 'far-far-left' | 'far-left' | 'left' | '15% left' | 'left-towards-center' | 'center-left' | 'center' | 'center-slightly-right' | 'fifty-percent' | 'center-right' | 'center-toward-right' | 'right' | 'before-before-far-right' | 'before-far-right' | 'far-right';
export const SLOT_MAP: Record<HorizontalSlot, DimensionValue> = {
  'far-far-left': '-10%',
  'far-left':     '-5%',
  'left':         '10%',
  '15% left': '15%',
  'left-towards-center': '20%',
  'center-left':  '25%',
  'center':       '35%',
  'center-slightly-right': '45%',
  'fifty-percent': '50%',
  'center-right': '55%',
  'center-toward-right': '65%',
  'right':        '70%',
  'before-before-far-right': '75%',
  'before-far-right': '80%',
  'far-right':    '82%',
};

// Depth affects size + opacity, giving a parallax feel automatically
export type DepthLevel = 'near' | 'mid' | 'far';
export const DEPTH_SCALE: Record<DepthLevel, number> = { near: 1, mid: 0.75, far: 0.55 };
export const DEPTH_OPACITY: Record<DepthLevel, number> = { near: 1, mid: 0.85, far: 0.65 };

// ─────────────────────────────────────────────
// 2. ELEMENT DEFINITIONS
//    Strict types — no raw style objects allowed
// ─────────────────────────────────────────────

export interface CharacterElement {
  kind: 'character';
  image: SceneImageSource;
  slot: HorizontalSlot;
  size: CharacterSize;
  depth?: DepthLevel;      // Defaults to 'near'
  flipped?: boolean;       // Mirror the sprite
  zOffset?: number;        // Fine-tune z-order within the layer
  verticalOffset?: number;  // positive = down, negative = up (in % of scene height)

}

export interface TreeElement {
  kind: 'tree';
  variant: 'oak' | 'pine' ;
  slot: HorizontalSlot;
  size: CharacterSize;
  depth?: DepthLevel;
}

export interface PropElement {
  kind: 'prop';
  image: SceneImageSource;
  slot: HorizontalSlot;
  size: CharacterSize;
  depth?: DepthLevel;
  verticalOffset?: number;  // positive = down, negative = up (in % of scene height)

}

export type SceneElement =  CharacterElement | TreeElement | PropElement;

// ─────────────────────────────────────────────
// 3. SCENE DEFINITION
//    Atmosphere + elements. That's it.
// ─────────────────────────────────────────────

export type AtmosphereType = 'day' | 'golden-hour' | 'overcast' | 'night' | 'indoor';

// Each atmosphere has a preset: sky tint, cloud style, ground color, ambient light
export const ATMOSPHERE_PRESETS: Record<AtmosphereType, {
  skyTint: string;
  groundColor: string;
  showClouds: boolean;
  cloudOpacity: number;
  ambientOverlay?: string; // rgba color cast over the whole scene
}> = {
  'day':          { skyTint: 'transparent', groundColor: '#3B7A57', showClouds: true,  cloudOpacity: 1,    ambientOverlay: undefined },
  'golden-hour':  { skyTint: '#FF8C0022',   groundColor: '#5C4A1E', showClouds: true,  cloudOpacity: 0.7,  ambientOverlay: 'rgba(255,140,0,0.08)' },
  'overcast':     { skyTint: '#88888822',   groundColor: '#4A5568', showClouds: true,  cloudOpacity: 0.5,  ambientOverlay: 'rgba(100,100,120,0.12)' },
  'night':        { skyTint: '#00003388',   groundColor: '#1a1a2e', showClouds: false, cloudOpacity: 0,    ambientOverlay: 'rgba(0,0,50,0.3)' },
  'indoor':       { skyTint: 'transparent', groundColor: '#8B6F47', showClouds: false, cloudOpacity: 0,    ambientOverlay: undefined },
};

export interface SceneDefinition {
  atmosphere: AtmosphereType;
  elements: SceneElement[];          // Ordered back-to-front
  gameComponent?: string;
  gameProps?: object;
}