// minigames/FindFriendsGame.tsx
import { AppColors, AppFonts } from '@/constants/theme';
import React, { JSX, useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Bush from '../decorations/bush';

const { width } = Dimensions.get('window');

interface Friend {
  id: string;
  name: string;
  image: ImageSourcePropType;
  found: boolean;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

interface FindFriendsGameProps {
  friends?: Friend[];
  onComplete: (success: boolean, foundCount: number) => void;
  onClose?: () => void;
  instruction?: string;
  isEmbedded?: boolean;
  paused?: boolean;
}

// ─── Pixel-block helper ───────────────────────────────────────────────────────
function PixelBlock({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  return <View style={{ position: 'absolute', left: x, top: y, width: w, height: h, backgroundColor: color }} />;
}

// ─── Ground / platform scene layer ───────────────────────────────────────────
function PixelScene({ areaWidth, areaHeight }: { areaWidth: number; areaHeight: number }) {
  const B = 12; // base pixel block size

  // Build platform rows at the bottom
  const groundY = areaHeight - B * 4;
  const blocks: JSX.Element[] = [];
  let key = 0;

  // Full ground row (darkest)
  for (let col = 0; col < Math.ceil(areaWidth / B); col++) {
    blocks.push(<PixelBlock key={key++} x={col * B} y={groundY}        w={B} h={B} color={AppColors.blue} />);
    blocks.push(<PixelBlock key={key++} x={col * B} y={groundY + B}    w={B} h={B} color={AppColors.blue}  />);
    blocks.push(<PixelBlock key={key++} x={col * B} y={groundY + B*2}  w={B} h={B} color={AppColors.blue}  />);
    blocks.push(<PixelBlock key={key++} x={col * B} y={groundY + B*3}  w={B} h={B} color={AppColors.blue} />);
  }

  // Top highlight strip on ground
  for (let col = 0; col < Math.ceil(areaWidth / B); col++) {
    if (col % 3 !== 1) {
      blocks.push(<PixelBlock key={key++} x={col * B} y={groundY} w={B} h={3} color={AppColors.blue} />);
    }
  }

  // // Left wall cluster
  // for (let row = 0; row < 6; row++) {
  //   blocks.push(<PixelBlock key={key++} x={0}   y={groundY - row * B} w={B*2} h={B} color={row % 2 === 0 ? C.blockDark : C.blockMid} />);
  //   blocks.push(<PixelBlock key={key++} x={B*2} y={groundY - row * B} w={B}   h={B} color={C.blockMid} />);
  // }

  // // Right wall cluster
  // for (let row = 0; row < 5; row++) {
  //   blocks.push(<PixelBlock key={key++} x={areaWidth - B*2} y={groundY - row * B} w={B*2} h={B} color={row % 2 === 0 ? C.blockDark : C.blockMid} />);
  //   blocks.push(<PixelBlock key={key++} x={areaWidth - B*3} y={groundY - row * B} w={B}   h={B} color={C.blockMid} />);
  // }

//   // Small raised platform in the middle-right
//   const platY = groundY - B * 4;
//   const platX = areaWidth * 0.55;
//   for (let col = 0; col < 5; col++) {
//     blocks.push(<PixelBlock key={key++} x={platX + col*B} y={platY}     w={B} h={B} color={C.blockMid}  />);
//     blocks.push(<PixelBlock key={key++} x={platX + col*B} y={platY + B} w={B} h={B} color={C.blockDark} />);
//   }
//   // highlight
//   blocks.push(<PixelBlock key={key++} x={platX} y={platY} w={B * 5} h={3} color={C.blockLight} />);

//   return <>{blocks}</>;
 }

// ─── Main component ───────────────────────────────────────────────────────────
export default function FindFriendsGame({
  friends: initialFriends = [],
  onComplete,
  onClose,
  instruction = 'Find all your friends!',
  isEmbedded = false,
  paused = false,
}: FindFriendsGameProps) {
  const [foundIds, setFoundIds]         = useState<Set<string>>(new Set());
  const [foundCount, setFoundCount]     = useState(0);
  const [message, setMessage]           = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [areaSize, setAreaSize]         = useState({ width: 0, height: 0 });
  const scaleAnim                       = useState(new Animated.Value(1))[0];

  const friends = initialFriends.map(f => ({ ...f, found: foundIds.has(f.id) }));

  useEffect(() => {
    if (friends.length > 0 && foundCount === friends.length && !gameCompleted) {
      setGameCompleted(true);
      setShowModal(true);
    }
  }, [foundCount, friends.length, gameCompleted]);

  const handleFriendTap = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (!friend || friend.found) return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0,   duration: 180, useNativeDriver: true }),
    ]).start();

    setFoundIds(prev => new Set([...prev, friendId]));
    const newCount = foundCount + 1;
    setFoundCount(newCount);
    setMessage(`✨ ${friend.name} found! ${newCount}/${friends.length}`);
    setTimeout(() => setMessage(''), 1800);
  };

  // Ground level (where characters stand) — 76% down the game area
  const GROUND_LEVEL_PCT = 72;

  return (
  <View style={styles.container}>

    {/* Close button */}
    {onClose && (
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>
    )}

    {/* Pause overlay */}
    {paused && (
      <View style={styles.pauseOverlay} pointerEvents="box-only">
        <Text style={styles.pauseText}>⏸ Paused</Text>
      </View>
    )}

    {/* ── Game Area — transparent, SceneStage shows through ── */}
    <View
      style={styles.gameArea}
      onLayout={e => setAreaSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {/* Bushes still render — they're decorative game elements */}
      {areaSize.width > 0 && (
        <>
          <Bush
            size={56}
            x={areaSize.width * 0.08}
            y={areaSize.height * (GROUND_LEVEL_PCT / 100) - 52}
            variant="round"
          />
          <Bush
            size={64}
            x={areaSize.width * 0.72}
            y={areaSize.height * (GROUND_LEVEL_PCT / 100) - 58}
            variant="flowering"
          />
          <Bush
            size={48}
            x={areaSize.width * 0.46}
            y={areaSize.height * (GROUND_LEVEL_PCT / 100) - 44}
            variant="round"
          />
        </>
      )}

      {/* Friends */}
      {friends.map((friend, idx) =>
        !friend.found ? (
          <TouchableOpacity
            key={friend.id}
            activeOpacity={0.85}
            onPress={() => handleFriendTap(friend.id)}
            style={[
              styles.friendAnchor,
              {
                left: `${friend.x}%`,
                top:  `${friend.y}%`,
              },
            ]}
          >
            <View style={styles.numBadge}>
              <Text style={styles.numText}>{idx + 1}</Text>
            </View>
            <Animated.Image
              source={friend.image}
              style={[styles.friendSprite, { transform: [{ scale: scaleAnim }] }]}
              resizeMode="contain"
            />
            <View style={styles.nameTag}>
              <Text style={styles.nameTagText}>{friend.name}</Text>
            </View>
          </TouchableOpacity>
        ) : null
      )}

      {/* Toast message */}
      {message !== '' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{message}</Text>
        </View>
      )}

      {/* Counter badge */}
      <View style={styles.counterBadge}>
        <Text style={styles.counterBadgeText}>
          {foundCount}/{friends.length}
        </Text>
      </View>
    </View>

    {/* ── Footer HUD ── */}
    <View style={styles.hud}>
      <Text style={styles.hudInstruction}>{instruction}</Text>
      <View style={styles.hudRow}>
        <Text style={styles.hudFoundLabel}>Found:</Text>
        <View style={styles.hudIcons}>
          {friends.map(f =>
            f.found ? (
              <Image key={f.id} source={f.image} style={styles.hudIcon} />
            ) : (
              <View key={f.id} style={styles.hudIconEmpty} />
            )
          )}
        </View>
      </View>
    </View>

    {/* ── Completion Modal ── */}
    <Modal animationType="fade" transparent visible={showModal} onRequestClose={() => {}}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalPixelBorder} />
          <Text style={styles.modalTitle}>Mission Complete!</Text>
          <Text style={styles.modalBody}>You found all {friends.length} friends!</Text>
          <View style={styles.modalIcons}>
            {friends.map((f, i) => (
              <Image key={i} source={f.image} style={styles.modalIcon} />
            ))}
          </View>
          <TouchableOpacity
            style={styles.modalBtn}
            onPress={() => { setShowModal(false); onComplete(true, foundCount); }}
          >
            <Text style={styles.modalBtnText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>
);
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
     flex: 1,
  backgroundColor: AppColors.lilac,
  height: '100%',

  },
  embeddedContainer: {
    borderRadius: 0,
    minHeight: '100%',
  },

  // Pause
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppColors.lilac,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
  },
  pauseText: { fontSize: 28, color: AppColors.blue, fontWeight: 'bold', fontFamily: 'monospace' },

  // Close
  closeBtn: {
    position: 'absolute', top: 10, right: 10, zIndex: 100,
    width: 36, height: 36, borderRadius: 4,
    backgroundColor: AppColors.lilac, borderWidth: 2, borderColor: AppColors.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: AppColors.blue, fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace' },

  // Game area
  gameArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },

  // Friends
  friendAnchor: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 20,
    // No background, no border — characters sit directly in the scene
  },
  friendSprite: {
    width: 72,
    height: 72,
  },
  numBadge: {
    backgroundColor: AppColors.lilac,
    borderWidth: 2,
    borderColor: AppColors.blue,
    borderRadius: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 2,
  },
  numText: {
    color: AppColors.blue,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  nameTag: {
    backgroundColor: AppColors.lilac,
    borderWidth: 1,
    borderColor: AppColors.blue,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  nameTagText: {
    color: AppColors.blue,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },

  // Toast
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
  toastText: {
    color: AppColors.blue,
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },

  // Counter badge (bottom-right, like in the screenshot)
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
  counterBadgeText: {
    color: AppColors.blue,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // HUD footer
  hud: {
    backgroundColor: AppColors.lilac,
    borderTopWidth: 3,
    borderTopColor: AppColors.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  hudInstruction: {
    color: AppColors.blue,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hudFoundLabel: {
    color: AppColors.blue,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6,
  },
  hudIcons: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  hudIcon: {
    width: 34, height: 34, borderRadius: 2,
    borderWidth: 2, borderColor: AppColors.blue,
  },
  hudIconEmpty: {
    width: 34, height: 34, borderRadius: 2,
    borderWidth: 2, borderColor: AppColors.blue,
    backgroundColor: AppColors.lilac,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: AppColors.lilac,
    borderWidth: 3,
    borderColor: AppColors.blue,
    borderRadius: 6,
    padding: 28,
    alignItems: 'center',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  modalPixelBorder: {
    position: 'absolute',
    top: -1, left: -1, right: -1,
    height: 4,
    backgroundColor: AppColors.lilac,
  },
  modalEmoji:  { fontSize: 52, marginBottom: 10 },
  modalTitle: {
    ...AppFonts.title,
    fontSize: 48, fontWeight: 'bold', color: AppColors.blue,
     marginBottom: 8,
  },
  modalBody: {
    ...AppFonts.body,
    fontSize: 32, color: AppColors.blue,
    textAlign: 'center', marginBottom: 16,
  },
  modalIcons: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  modalIcon: {
    width: 46, height: 46, borderRadius: 3,
    borderWidth: 2, borderColor: AppColors.blue,
  },
  modalBtn: {
    backgroundColor: AppColors.lilac,
    borderRadius: 3,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: AppColors.blue,
  },
  modalBtnText: {
    ...AppFonts.body,
    color: AppColors.blue,
    fontSize: 24,
  },
});