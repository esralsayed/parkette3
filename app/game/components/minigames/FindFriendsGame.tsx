// components/minigames/FindFriendsGame.tsx
//
// Find-the-friends game — now uses GameModal (fullscreen=true) for the shell.
// Only the pixel scene + friends logic lives here.

import { AppColors } from '@/constants/theme';
import React, { JSX, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Bush from '../decorations/bush';
import GameModal from './GameModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Friend {
  id: string;
  name: string;
  image: ImageSourcePropType;
  found: boolean;
  x: number;
  y: number;
}

interface FindFriendsGameProps {
  friends?: Friend[];
  onComplete: (success: boolean, foundCount: number) => void;
  onClose?: () => void;
  instruction?: string;
  isEmbedded?: boolean;
  paused?: boolean;
}

// ─── Pixel scene helpers ───────────────────────────────────────────────────────

function PixelBlock({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  return <View style={{ position: 'absolute', left: x, top: y, width: w, height: h, backgroundColor: color }} />;
}

function PixelScene({ areaWidth, areaHeight }: { areaWidth: number; areaHeight: number }) {
  const B = 12;
  const groundY = areaHeight - B * 4;
  const blocks: JSX.Element[] = [];
  let key = 0;
  for (let col = 0; col < Math.ceil(areaWidth / B); col++) {
    blocks.push(<PixelBlock key={key++} x={col * B} y={groundY}       w={B} h={B} color={AppColors.blue} />);
    blocks.push(<PixelBlock key={key++} x={col * B} y={groundY + B}   w={B} h={B} color={AppColors.blue} />);
    blocks.push(<PixelBlock key={key++} x={col * B} y={groundY + B*2} w={B} h={B} color={AppColors.blue} />);
    blocks.push(<PixelBlock key={key++} x={col * B} y={groundY + B*3} w={B} h={B} color={AppColors.blue} />);
  }
  return <>{blocks}</>;
}

// ─── FindFriendsGame ──────────────────────────────────────────────────────────

export default function FindFriendsGame({
  friends: initialFriends = [],
  onComplete,
  onClose,
  instruction = 'Find all your friends!',
  paused = false,
}: FindFriendsGameProps) {
  const [foundIds,  setFoundIds]  = useState<Set<string>>(new Set());
  const [foundCount, setFoundCount] = useState(0);
  const [message,   setMessage]   = useState('');
  const [areaSize,  setAreaSize]  = useState({ width: 0, height: 0 });
  // Controls GameModal visibility; closes after all found
  const [visible, setVisible]     = useState(true);

  const scaleAnims = useRef<Map<string, Animated.Value>>(new Map());
  const friends = initialFriends.map(f => ({ ...f, found: foundIds.has(f.id) }));

  const handleFriendTap = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (!friend || friend.found) return;

    let anim = scaleAnims.current.get(friendId);
    if (!anim) { anim = new Animated.Value(1); scaleAnims.current.set(friendId, anim); }

    Animated.sequence([
      Animated.timing(anim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0,   duration: 180, useNativeDriver: true }),
    ]).start();

    const newCount = foundCount + 1;
    setFoundIds(prev => new Set([...prev, friendId]));
    setFoundCount(newCount);
    setMessage(`✨ ${friend.name} found! ${newCount}/${friends.length}`);
    setTimeout(() => setMessage(''), 1800);

    if (newCount === friends.length) {
      // Short delay so the last pop animation plays, then close + complete
      setTimeout(() => {
        setVisible(false);
        onComplete(true, newCount);
      }, 800);
    }
  };

  const GROUND_LEVEL_PCT = 72;

  const WorldBush = ({
    x, y, size, friend, onTap,
  }: { x: number; y: number; size: number; friend?: Friend; onTap?: (id: string) => void }) => {
    if (!friend || friend.found) return null;
    let anim = scaleAnims.current.get(friend.id);
    if (!anim) { anim = new Animated.Value(1); scaleAnims.current.set(friend.id, anim); }

    return (
      <View style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: size, height: size, zIndex: 10 }}>
        <TouchableOpacity
          style={{ position: 'absolute', bottom: size * 0.6, left: 200, right: 0, alignItems: 'center', zIndex: 0 }}
          onPress={() => onTap?.(friend.id)}
          activeOpacity={0.7}
        >
          <Animated.Image source={friend.image} style={{ transform: [{ scale: anim }] }} />
          <View style={styles.nameTag}>
            <Text style={styles.nameTagText}>{friend.name}</Text>
          </View>
        </TouchableOpacity>
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
          <Bush size={size} />
        </View>
      </View>
    );
  };

  const POSITIONS = [
    { x: 8,  y: GROUND_LEVEL_PCT - 20, size: 400 },
    { x: 72, y: GROUND_LEVEL_PCT - 20, size: 400 },
    { x: 46, y: GROUND_LEVEL_PCT - 20, size: 200 },
    { x: 25, y: GROUND_LEVEL_PCT,      size: 250 },
    { x: 85, y: GROUND_LEVEL_PCT,      size: 220 },
  ];

  return (
    <GameModal
      visible={visible}
      title="Find Your Friends!"
      fullscreen
      howToPlay={{
        instructions: 'Search for your friends hiding in the bushes! Spot one? Tap them quick! Find them all!',
        highlightPhrases: ['Tap them quick!', 'Find them all!'],
        characters: [
          { emoji: '🧒', label: 'You' },
          { emoji: '❓', label: 'Friend', hidden: true },
          { emoji: '❓', label: 'Friend', hidden: true },
        ],
        steps: [
          { icon: '🔍', label: 'Search the scene' },
          { icon: '👊', label: 'Tap to catch!' },
          { icon: '🌟', label: 'Find them all!' },
        ],
      }}
      onClose={onClose}
    >
      {/* ── Game content ── */}
      <View style={styles.gameWrapper}>

        {paused && (
          <View style={styles.pauseOverlay} pointerEvents="box-only">
            <Text style={styles.pauseText}>⏸ Paused</Text>
          </View>
        )}

        {/* Game area */}
        <View
          style={styles.gameArea}
          onLayout={e => setAreaSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        >
          {areaSize.height > 0 && (
            <>
              <PixelScene areaWidth={areaSize.width} areaHeight={areaSize.height} />
              {friends.map((friend, index) => {
                const pos = POSITIONS[index] ?? { x: 10 + index * 20, y: GROUND_LEVEL_PCT, size: 200 };
                return (
                  <WorldBush key={friend.id} x={pos.x} y={pos.y} size={pos.size} friend={friend} onTap={handleFriendTap} />
                );
              })}
            </>
          )}

          {message !== '' && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>{message}</Text>
            </View>
          )}

          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{foundCount}/{friends.length}</Text>
          </View>
        </View>

        {/* HUD */}
        <View style={styles.hud}>
          <Text style={styles.hudInstruction}>{instruction}</Text>
          <View style={styles.hudRow}>
            <Text style={styles.hudFoundLabel}>Found:</Text>
            <View style={styles.hudIcons}>
              {friends.map(f =>
                f.found
                  ? <Image key={f.id} source={f.image} style={styles.hudIcon} />
                  : <View key={f.id} style={styles.hudIconEmpty} />
              )}
            </View>
          </View>
        </View>

      </View>
    </GameModal>
  );
}

// ─── Styles (game content only) ───────────────────────────────────────────────

const styles = StyleSheet.create({
  gameWrapper: { flex: 1 },

  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppColors.lilac,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
  },
  pauseText: { fontSize: 28, color: AppColors.blue, fontWeight: 'bold', fontFamily: 'monospace' },

  gameArea: { flex: 1, position: 'relative', overflow: 'visible' },

  nameTag: {
    backgroundColor: AppColors.lilac,
    borderWidth: 1,
    borderColor: AppColors.blue,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  nameTagText: { color: AppColors.blue, fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' },

  toast: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    backgroundColor: AppColors.lilac,
    borderWidth: 2,
    borderColor: AppColors.blue,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 30,
  },
  toastText: { color: AppColors.blue, fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold' },

  counterBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: AppColors.lilac,
    borderWidth: 2,
    borderColor: AppColors.blue,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  counterText: { color: AppColors.blue, fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14 },

  hud: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  hudInstruction: { color: AppColors.blue, fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  hudRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hudFoundLabel: { color: AppColors.blue, fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', marginRight: 6 },
  hudIcons: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  hudIcon: { width: 34, height: 34, borderRadius: 2, borderWidth: 2, borderColor: AppColors.blue },
  hudIconEmpty: { width: 34, height: 34, borderRadius: 2, borderWidth: 2, borderColor: AppColors.blue, backgroundColor: AppColors.lilac },
});