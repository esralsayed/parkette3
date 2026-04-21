// sceneSystem.ts

// ─────────────────────────────────────────────
// 1. LAYER TYPES — every visual element has a type
//    with constrained options, not raw style objects
// ─────────────────────────────────────────────

export type LayerType = 'sky' | 'background' | 'midground' | 'ground' | 'foreground' | 'ui';

// Character sizes are named, not arbitrary numbers
export type CharacterSize = 'small' | 'medium' | 'large' | 'hero';
export const CHARACTER_SIZE_MAP: Record<CharacterSize, number> = {
  small:  120,
  medium: 200,
  large:  300,
  hero:   420,
};

import { DimensionValue } from "react-native";

// Horizontal positions are named slots, not raw percentages
export type HorizontalSlot = 'far-left' | 'left' | 'center-left' | 'center' | 'center-right' | 'right' | 'far-right';
export const SLOT_MAP: Record<HorizontalSlot, DimensionValue> = {
  'far-left':     '-5%',
  'left':         '10%',
  'center-left':  '25%',
  'center':       '35%',
  'center-right': '55%',
  'right':        '70%',
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
  image: any;
  slot: HorizontalSlot;
  size: CharacterSize;
  depth?: DepthLevel;      // Defaults to 'near'
  flipped?: boolean;       // Mirror the sprite
  zOffset?: number;        // Fine-tune z-order within the layer
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
  image: any;
  slot: HorizontalSlot;
  size: CharacterSize;
  depth?: DepthLevel;
}

export type SceneElement = CharacterElement | TreeElement | PropElement;

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