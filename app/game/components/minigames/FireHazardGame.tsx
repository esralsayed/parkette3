// components/minigames/FireHazardGame.tsx
//
// Tap-to-remove fire hazard game — uses GameModal for the shell + HowToPlay.
// Positions mirror LevelDecorations.tsx exactly:
//   left   = SLOT_MAP[el.slot]
//   bottom = (H * 5/100) + el.verticalOffset
//   size   = CHARACTER_SIZE_MAP[el.size] * DEPTH_SCALE[el.depth ?? 'near']

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Bag from '@/assets/svgs/game/chapters/bag.svg';
import Bottle from '@/assets/svgs/game/chapters/bottle.svg';
import Curtain from '@/assets/svgs/game/chapters/curtain.svg';
import Spoon from '@/assets/svgs/game/chapters/spoon.svg';
import Towel from '@/assets/svgs/game/chapters/towel.svg';

import {
    CHARACTER_SIZE_MAP,
    CharacterSize,
    HorizontalSlot
} from '../../services/sceneSystem';

import { AppColors, AppFonts, AppFontSizes } from '@/constants/theme';
import GameModal from './GameModal';

// ─── Position helpers (mirror LevelDecorations exactly) ───────────────────────

const { height: H, width: W } = Dimensions.get('window');

function toBottom(verticalOffset: number): number { return H * 0.05 + verticalOffset; }
function toSize(size: CharacterSize): number {
  return CHARACTER_SIZE_MAP[size];
}

// ─── Item catalogue (copied from sceneRegistry kitchen3) ─────────────────────

interface ItemDef {
  key: string;
  name: string; // Display name
  SvgComponent: React.ComponentType<{ width: number; height: number }>;
  slot: HorizontalSlot;
  size: CharacterSize;
  verticalOffset: number;
    row: 0 | 1; // 0 = top row, 1 = bottom row

}

// Calculate gap based on screen width and number of items
const ITEM_GAP = W * 0.005; // 8% of screen width gap between items
const ROW_HEIGHT_TOP = H  * 0.03; // Top row vertical position
const ROW_HEIGHT_BOTTOM = H * 0.03; // Bottom row vertical position

// Function to calculate horizontal position based on index
function calculateSlotPosition(indexInRow: number, totalInRow: number): number {
  const itemWidth = CHARACTER_SIZE_MAP.large;
  const totalItemsWidth = totalInRow * itemWidth;
  const totalGapsWidth = (totalInRow - 1) * ITEM_GAP;
  const totalRowWidth = totalItemsWidth + totalGapsWidth;
  
  // Center the entire row
  const startX = ((W - 200) - totalRowWidth) / 3;
  console.log(startX + (indexInRow * (itemWidth + ITEM_GAP)));
  return startX + (indexInRow * (itemWidth + ITEM_GAP));
}

const ITEM_CATALOGUE: ItemDef[] = [
  { key: 'wooden spoon', name: 'Wooden Spoon', SvgComponent: Spoon, slot: 'center', size: 'large', verticalOffset: 0, row: 0},
  { key: 'towel', name: 'Towel', SvgComponent: Towel, slot: 'left', size: 'large', verticalOffset: 0, row: 0 },
  { key: 'paper bag', name: 'Paper Bag', SvgComponent: Bag, slot: 'right', size: 'large', verticalOffset: 0, row: 1 },
  { key: 'bottle', name: 'Bottle', SvgComponent: Bottle, slot: 'far-right', size: 'large', verticalOffset: 0, row: 1 },
  { key: 'curtain', name: 'Curtain', SvgComponent: Curtain, slot: 'far-left', size: 'large', verticalOffset: 0, row: 1 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FireHazardGameProps {
  items: string[];
  targets: string[];
  instruction?: string;
  //timeLimit?: number;
  onComplete: (correct: boolean, extra?: { removedCount: number }) => void;
}

// ─── HazardItem ───────────────────────────────────────────────────────────────

function HazardItem({ def, isDangerous, onTap, indexInRow, totalInRow }: {
  def: ItemDef;
  isDangerous: boolean;
  onTap: (key: string, isDangerous: boolean) => void;
  indexInRow: number;
  totalInRow: number;
}) {
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const tapped    = useRef(false);

  // Entrance animation
  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      delay: (def.row === 0 ? indexInRow : indexInRow + 2) * 100, // Stagger based on position
      useNativeDriver: true,
    }).start();
  }, []);

  // Pulse animation for dangerous items
  useEffect(() => {
    //if (isDangerous) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.15, duration: 650, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 650, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  // Idle floating animation for all items
  useEffect(() => {
    const floatAnim = Animated.loop(Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.0, duration: 1500, useNativeDriver: true }),
    ]));
    floatAnim.start();
    return () => floatAnim.stop();
  }, []);

  const triggerRemove = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1.8, duration: 180, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 260, delay: 100, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = () => {
    if (tapped.current) return;
    if (isDangerous) { 
      tapped.current = true; 
      triggerRemove(); 
      setTimeout(() => onTap(def.key, true), 300); 
    } else { 
      triggerShake(); 
      onTap(def.key, false); 
    }
  };

  const itemSize = toSize(def.size);
  const { SvgComponent } = def;

  // Use calculated position or fall back to SLOT_MAP
  const horizontalPos = calculateSlotPosition(indexInRow, totalInRow);
  const verticalPos = def.row === 0 ? ROW_HEIGHT_TOP : ROW_HEIGHT_BOTTOM;

  return (
    <Animated.View style={[styles.itemWrapper, {
      left: horizontalPos,
      bottom: verticalPos,
      width: itemSize,
      height: itemSize + 40, // Extra height for label
      opacity: fadeAnim,
      transform: [
        { translateX: shakeAnim }, 
        { scale: pulseAnim  },
        { translateY: bounceAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [50, -10, 0]
          })
        }
      ],
    }]}>
      <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={styles.fill}>
        <View style={styles.itemContainer}>
          <View style={styles.nameTag}>
            <Text style={styles.itemName}>{def.name}</Text>
          </View>
          <View style={styles.svgContainer}>
            <SvgComponent width={itemSize} height={itemSize} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── SafeToast ────────────────────────────────────────────────────────────────

function SafeToast({ trigger }: { trigger: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  
  useEffect(() => {
    if (trigger === 0) return;
    opacity.setValue(0);
    scale.setValue(0.5);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
    
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 380, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.5, duration: 380, useNativeDriver: true }),
      ]).start();
    }, 1000);
  }, [trigger]);
  
  return (
    <Animated.View style={[styles.safeToast, { opacity, transform: [{ scale }] }]}>
      <Text style={styles.safeToastText}>✅ That's safe!</Text>
    </Animated.View>
  );
}

// ─── TimerBar ─────────────────────────────────────────────────────────────────

function TimerBar({ progress, timeLeft }: { progress: number; timeLeft: number }) {
  const color = progress > 0.5 ? '#4CAF50' : progress > 0.25 ? '#FFC107' : '#F44336';
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (progress < 0.25) {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]));
      loop.start();
      return () => loop.stop();
    }
  }, [progress]);
  
  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerHeader}>
        <Text style={styles.timerLabel}>⏱️ TIME REMAINING</Text>
        <Animated.Text style={[styles.timerValue, { transform: [{ scale: pulseAnim }], color }]}>
          {Math.ceil(timeLeft)}s
        </Animated.Text>
      </View>
      <View style={styles.timerTrack}>
        <View style={[styles.timerFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ─── FireHazardGame ───────────────────────────────────────────────────────────

export default function FireHazardGame({
  items, targets,
  instruction = 'Tap dangerous items before time runs out!',
  //timeLimit = 20,
  onComplete,
}: FireHazardGameProps) {
  const activeItems = ITEM_CATALOGUE.filter(def => items.includes(def.key));
  
  // Separate items by row
  const topRowItems = activeItems.filter(item => item.row === 0);
  const bottomRowItems = activeItems.filter(item => item.row === 1);

  const [removedKeys,  setRemovedKeys]  = useState<Set<string>>(new Set());
  //const [timeLeft,     setTimeLeft]     = useState(timeLimit);
  const [safeToastKey, setSafeToastKey] = useState(0);
  const [visible,      setVisible]      = useState(true);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameOverRef = useRef(false);

//   useEffect(() => {
//     timerRef.current = setInterval(() => {
//       setTimeLeft(prev => { if (prev <= 1) { clearInterval(timerRef.current!); return 0; } return prev - 1; });
//     }, 1000);
//     return () => clearInterval(timerRef.current!);
//   }, []);

  const checkOutcome = useCallback((removed: Set<string>, time: number) => {
    if (gameOverRef.current) return;
    if (targets.every(t => removed.has(t))) {
      gameOverRef.current = true;
      clearInterval(timerRef.current!);
      setTimeout(() => { setVisible(false); onComplete(true, { removedCount: removed.size }); }, 500);
      return;
    }
    if (time === 0) {
      gameOverRef.current = true;
      setVisible(false);
      onComplete(false, { removedCount: removed.size });
    }
  }, [targets, onComplete]);

  //useEffect(() => { checkOutcome(removedKeys, timeLeft); }, [removedKeys, timeLeft]);

  const handleTap = useCallback((key: string, isDangerous: boolean) => {
    if (gameOverRef.current) return;
    if (isDangerous) setRemovedKeys(prev => new Set([...prev, key]));
    else setSafeToastKey(k => k + 1);
  }, []);

  return (
    <GameModal
      visible={visible}
      height={800}
      title="FIRE HAZARD!"
      howToPlay={{
        instructions: 'Tap items that could catch fire and remove them before time runs out!',
        highlightPhrases: ['Tap items', 'before time runs out'],
        steps: [
          { icon: '🔥', label: 'Spot the danger' },
          { icon: '👆', label: 'Tap to remove' },
          { icon: '⏱️', label: 'Beat the clock!' },
        ],
      }}
    >
      <View style={styles.gameArea}>
        {/* <TimerBar progress={timeLeft / timeLimit} timeLeft={timeLeft} /> */}
        
        <View style={styles.itemsContainer}>
          {/* Top Row Items */}
          <View style={styles.topRow}>
            {topRowItems.map((def, index) => (
              <HazardItem
                key={def.key}
                def={def}
                indexInRow={index}
                totalInRow={topRowItems.length}
                isDangerous={targets.includes(def.key) && !removedKeys.has(def.key)}
                onTap={handleTap}
              />
            ))}
          </View>
          
          {/* Bottom Row Items */}
          <View style={styles.bottomRow}>
            {bottomRowItems.map((def, index) => (
              <HazardItem
                key={def.key}
                def={def}
                indexInRow={index}
                totalInRow={bottomRowItems.length}
                isDangerous={targets.includes(def.key) && !removedKeys.has(def.key)}
                onTap={handleTap}
              />
            ))}
          </View>
        </View>
        <SafeToast trigger={safeToastKey} />
        
        {/* Progress counter */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            🎯 {Array.from(removedKeys).filter(k => targets.includes(k)).length} / {targets.length} hazards removed
          </Text>
        </View>
      </View>
    </GameModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  gameArea: { 
    flex: 1, 
    position: 'relative',
    paddingBottom: 20,
  },
  
  itemsContainer: {
    flex: 1,
    position: 'relative',
    minHeight: 550,
  },
  topRow: {
    position: 'relative',
    height: 300,
  },
  
  bottomRow: {
    position: 'relative',
    height: 400,
  },
  
  rowLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  
  rowLabelText: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  timerContainer: {
    margin: 16,
    marginBottom: 8,
  },
  
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  
  timerLabel: {
    ...AppFonts.bodySmall,
    fontSize: AppFontSizes.bodySmall,
    fontWeight: '800',
    color: AppColors.blue,
    letterSpacing: 1,
  },
  
  timerValue: {
    fontSize: AppFontSizes.bodySmall,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  
  timerTrack: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  
  timerFill: { 
    height: '100%', 
    borderRadius: 6,
  },

  itemWrapper: { 
    position: 'absolute',
    alignItems: 'center',
  },
  
  itemContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  
  nameTag: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  
  itemName: {
    ...AppFonts.bodySmall,
    color: '#fff',
    fontSize: AppFontSizes.bodySmall,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  svgContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  
  dangerBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,60,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  
  dangerEmoji: { 
    fontSize: 14, 
    lineHeight: 16,
  },

  safeToast: {
    position: 'absolute',
    bottom: '25%',
    alignSelf: 'center',
    backgroundColor: 'rgba(76,175,80,0.95)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  
  safeToastText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: 16,
  },
  
  progressContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  
  progressText: {
    ...AppFonts.bodySmall, 
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    color: '#fff',
    fontSize: AppFontSizes.bodySmall,
    fontWeight: '700',
    overflow: 'hidden',
  },
});