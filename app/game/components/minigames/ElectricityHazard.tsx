// components/minigames/FireHazardGame.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Bottle from '@/assets/svgs/game/chapters/bottle.svg';
import Frame from '@/assets/svgs/game/chapters/frame1.svg';
import Pencil from '@/assets/svgs/game/chapters/pen.svg';
import Table from '@/assets/svgs/game/chapters/table.svg';
import Toys from '@/assets/svgs/game/chapters/toy1.svg';
import TV from '@/assets/svgs/game/chapters/tv.svg';

import {
  CharacterSize,
  HorizontalSlot,
} from '../../services/sceneSystem';

import { AppColors, AppFonts, AppFontSizes } from '@/constants/theme';
import GameModal from './GameModal';

// ─── Sizing ───────────────────────────────────────────────────────────────────

const { width: W } = Dimensions.get('window');

// Items per row
const ITEMS_PER_ROW = 3;

// Total horizontal padding inside GameModal (adjust if your modal differs)
const MODAL_H_PADDING = 48;

// ITEM_SIZE fills the row exactly — no guesswork, no overflow
const ITEM_SIZE = Math.min(
  Math.floor((W - MODAL_H_PADDING) / ITEMS_PER_ROW),
  300  // hard cap — never bigger than 100px regardless of screen width
);
// ─── Item catalogue ───────────────────────────────────────────────────────────

interface ItemDef {
  key: string;
  name: string;
  SvgComponent: React.ComponentType<{ width: number; height: number }>;
  slot: HorizontalSlot;
  size: CharacterSize;
  verticalOffset: number;
  row: 0 | 1;
}

const ITEM_CATALOGUE: ItemDef[] = [
  { key: 'tv',      name: 'TV',        SvgComponent: TV,     slot: 'center',      size: 'medium', verticalOffset: 0, row: 0 },
  { key: 'pencil',  name: 'Pencil',    SvgComponent: Pencil, slot: 'left',        size: 'medium', verticalOffset: 0, row: 0 },
  { key: 'table',   name: 'Table',     SvgComponent: Table,  slot: 'center-left', size: 'medium', verticalOffset: 0, row: 0 },
  { key: 'picture', name: 'Picture Frame', SvgComponent: Frame,  slot: 'right',       size: 'medium', verticalOffset: 0, row: 1 },
  { key: 'bottle',   name: 'Water Bottle',    SvgComponent: Bottle, slot: 'far-right',   size: 'medium', verticalOffset: 0, row: 1 },
  { key: 'toys',    name: 'Plastic Toys',   SvgComponent: Toys,   slot: 'far-left',    size: 'medium', verticalOffset: 0, row: 1 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ElectricityHazardGameProps {
  items: string[];
  targets: string[];
  instruction?: string;
  timeLimit?: number;
  onComplete: (correct: boolean, extra?: { removedCount: number }) => void;
}

// ─── HazardItem ───────────────────────────────────────────────────────────────

function HazardItem({
  def, isDangerous, onTap, index,
}: {
  def: ItemDef;
  isDangerous: boolean;
  onTap: (key: string, isDangerous: boolean) => void;
  index: number;
}) {
  const fadeAnim   = useRef(new Animated.Value(1)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const tapped     = useRef(false);

  // Staggered entrance
  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1, friction: 5, tension: 100,
      delay: index * 80, useNativeDriver: true,
    }).start();
  }, []);

  // Pulse
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  // Idle float
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.0,  duration: 1500, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  const triggerRemove = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1.8, duration: 180,             useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 0,   duration: 260, delay: 100, useNativeDriver: true }),
    ]).start();
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  -6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   0, duration: 55, useNativeDriver: true }),
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

  const { SvgComponent } = def;

  return (
    <Animated.View style={[styles.itemWrapper, {
      opacity: fadeAnim,
      transform: [
        { translateX: shakeAnim },
        { scale: pulseAnim },
        {
          translateY: bounceAnim.interpolate({
            inputRange:  [0, 0.5, 1],
            outputRange: [40, -8, 0],
          }),
        },
      ],
    }]}>
      <TouchableOpacity activeOpacity={0.75} onPress={handlePress}>
        <View style={styles.itemContainer}>
          <View style={styles.nameTag}>
            <Text style={styles.itemName} numberOfLines={1}>{def.name}</Text>
          </View>
          <SvgComponent width={ITEM_SIZE} height={ITEM_SIZE} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── SafeToast ────────────────────────────────────────────────────────────────

function SafeToast({ trigger }: { trigger: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (trigger === 0) return;
    opacity.setValue(0);
    scale.setValue(0.5);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1,   duration: 140, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1,   friction: 6,   useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0,   duration: 380, useNativeDriver: true }),
        Animated.timing(scale,   { toValue: 0.5, duration: 380, useNativeDriver: true }),
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
  const color     = progress > 0.5 ? '#4CAF50' : progress > 0.25 ? '#FFC107' : '#F44336';
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (progress < 0.25) {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 500, useNativeDriver: true }),
      ]));
      loop.start();
      return () => loop.stop();
    }
  }, [progress < 0.25]);

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

export default function ElectricalGame({
  items, targets,
  timeLimit = 30,
  onComplete,
}: ElectricityHazardGameProps) {
  const activeItems    = ITEM_CATALOGUE.filter(def => items.includes(def.key));
  const topRowItems    = activeItems.filter(item => item.row === 0);
  const bottomRowItems = activeItems.filter(item => item.row === 1);

  const [removedKeys,  setRemovedKeys]  = useState<Set<string>>(new Set());
  const [timeLeft,     setTimeLeft]     = useState(timeLimit);
  const [safeToastKey, setSafeToastKey] = useState(0);
  const [visible,      setVisible]      = useState(true);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameOverRef = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

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

  useEffect(() => { checkOutcome(removedKeys, timeLeft); }, [removedKeys, timeLeft]);

  const handleTap = useCallback((key: string, isDangerous: boolean) => {
    if (gameOverRef.current) return;
    if (isDangerous) setRemovedKeys(prev => new Set([...prev, key]));
    else setSafeToastKey(k => k + 1);
  }, []);

  const renderRow = (rowItems: ItemDef[], offset: number) =>
    rowItems.map((def, i) => (
      <HazardItem
        key={def.key}
        def={def}
        index={offset + i}
        isDangerous={targets.includes(def.key) && !removedKeys.has(def.key)}
        onTap={handleTap}
      />
    ));

  return (
    <GameModal
      visible={visible}
      height={800}
      title="ELECTRICITY HAZARD!"
      howToPlay={{
        instructions: 'Tap items that could cause electric shocks and remove them before time runs out!',
        highlightPhrases: ['Tap items', 'before time runs out'],
        steps: [
          { icon: '⚡', label: 'Spot the danger' },
          { icon: '👆', label: 'Tap to remove' },
          { icon: '⏱️', label: 'Beat the clock!' },
        ],
      }}
    >
      <View style={styles.gameArea}>
        <TimerBar progress={timeLeft / timeLimit} timeLeft={timeLeft} />

        <View style={styles.itemsContainer}>
          <View style={styles.row}>
            {renderRow(topRowItems, 0)}
          </View>
          <View style={styles.row}>
            {renderRow(bottomRowItems, topRowItems.length)}
          </View>
        </View>

        <SafeToast trigger={safeToastKey} />

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
  gameArea: {
    flex: 1,
    paddingBottom: 56, // room for progress bar at bottom
  },

  itemsContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
  },

  // nowrap + space-evenly: items always spread across the full row width
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },

  // Exact fixed width = 1/3 of modal interior; SVG rendered at same size
  itemWrapper: {
    width: ITEM_SIZE,
    alignItems: 'center',
  },

  itemContainer: {
    alignItems: 'center',
    width: ITEM_SIZE,
  },

  nameTag: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    maxWidth: ITEM_SIZE - 4,
  },

  itemName: {
    ...AppFonts.bodySmall,
    color: '#fff',
    fontSize: AppFontSizes.bodySmall,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  timerContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },

  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
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

  safeToast: {
    position: 'absolute',
    bottom: '30%',
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
    bottom: 12,
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