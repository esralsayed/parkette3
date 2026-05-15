// minigames/FindFriendsGame.tsx
import { AppColors, AppFonts } from '@/constants/theme';
import React, { JSX, useEffect, useRef, useState } from 'react';
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
  
  return <>{blocks}</>;
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
  
  // Store individual animations for each friend
  const scaleAnims = useRef<Map<string, Animated.Value>>(new Map());

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

    // Get or create animation for this friend
    let anim = scaleAnims.current.get(friendId);
    if (!anim) {
      anim = new Animated.Value(1);
      scaleAnims.current.set(friendId, anim);
    }

    Animated.sequence([
      Animated.timing(anim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0,   duration: 180, useNativeDriver: true }),
    ]).start();

    setFoundIds(prev => new Set([...prev, friendId]));
    const newCount = foundCount + 1;
    setFoundCount(newCount);
    setMessage(`✨ ${friend.name} found! ${newCount}/${friends.length}`);
    setTimeout(() => setMessage(''), 1800);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onComplete(true, foundCount);
    if (onClose) {
      onClose();
    }
  };

  const WorldBush = ({
    x,
    y,
    size,
    friend,
    onTap,
  }: {
    x: number;
    y: number;
    size: number;
    friend?: Friend;
    onTap?: (friendId: string) => void;
  }) => {
    if (!friend || friend.found) return null;
    
    // Get this friend's animation
    let anim = scaleAnims.current.get(friend.id);
    if (!anim) {
      anim = new Animated.Value(1);
      scaleAnims.current.set(friend.id, anim);
    }

    return (
      <View
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          zIndex: 10,
        }}
      >
        {/* Tappable Character - placed ABOVE the bush */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: size * 0.6,
            left: 200,
            right: 0,
            alignItems: 'center',
            zIndex: 0,
          }}
          onPress={() => onTap?.(friend.id)}
          activeOpacity={0.7}
        >
          <Animated.Image
            source={friend.image}
            style={{
              transform: [{ scale: anim }],
            }}
          />
          {/* Optional name tag */}
          <View style={styles.nameTag}>
            <Text style={styles.nameTagText}>{friend.name}</Text>
          </View>
        </TouchableOpacity>

        {/* Bush behind the character */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
          <Bush size={size} />
        </View>
      </View>
    );
  };
  
  // Ground level (where characters stand) — 76% down the game area
  const GROUND_LEVEL_PCT = 72;

  return (
    <View style={styles.container}>
      {/* Close button - hide when modal is showing */}
      {onClose && !showModal && (
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

      {/* Game Area */}
      <View
        style={styles.gameArea}
        onLayout={e =>
          setAreaSize({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          })
        }
      >
        {areaSize.height > 0 && (
          <>
            <PixelScene areaWidth={areaSize.width} areaHeight={areaSize.height} />
            
            {/* Render each friend in their own bush */}
            {friends.map((friend, index) => {
              // Define positions for each friend
              const positions = [
                { x: 8, y: GROUND_LEVEL_PCT-20, size: 400 },   // Friend 0
                { x: 72, y: GROUND_LEVEL_PCT-20, size: 400 },  // Friend 1
                { x: 46, y: GROUND_LEVEL_PCT-20, size: 200 },  // Friend 2
                { x: 25, y: GROUND_LEVEL_PCT, size: 250 },  // Friend 3 (if exists)
                { x: 85, y: GROUND_LEVEL_PCT, size: 220 },  // Friend 4 (if exists)
              ];
              
              const pos = positions[index] || { x: 10 + (index * 20), y: GROUND_LEVEL_PCT, size: 200 };
              
              return (
                <WorldBush
                  key={friend.id}
                  x={pos.x}
                  y={pos.y}
                  size={pos.size}
                  friend={friend}
                  onTap={handleFriendTap}
                />
              );
            })}
          </>
        )}

        {/* Toast */}
        {message !== '' && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{message}</Text>
          </View>
        )}

        {/* Counter */}
        <View style={styles.counterBadge}>
          <Text style={styles.counterBadgeText}>
            {foundCount}/{friends.length}
          </Text>
        </View>
      </View>

      {/* HUD */}
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

      {/* Success Modal with X button */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* X button inside modal */}
            <TouchableOpacity 
              onPress={handleCloseModal} 
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Mission Complete!</Text>
            <Text style={styles.modalBody}>
              You found all {friends.length} friends!
            </Text>
            <View style={styles.modalIcons}>
              {friends.map(f => (
                <Image key={f.id} source={f.image} style={styles.modalIcon} />
              ))}
            </View>
            <TouchableOpacity onPress={handleCloseModal} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>✨ Continue ✨</Text>
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
    backgroundColor: 'transparent',
    height: '100%',
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    elevation: 200,
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
    zIndex: 5,
    elevation: 5,
  },
  friendSprite: {
    // width: 72,
    // height: 72,
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
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBox: {
    backgroundColor: AppColors.lilac,
    borderWidth: 4,
    borderColor: AppColors.blue,
    borderRadius: 8,
    padding: 28,
    alignItems: 'center',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  modalCloseBtnText: {
    color: AppColors.lilac,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  modalPixelBorder: {
    position: 'absolute',
    top: -1, left: -1, right: -1,
    height: 4,
    backgroundColor: AppColors.lilac,
  },
  modalEmoji: { fontSize: 52, marginBottom: 10 },
  modalTitle: {
    ...AppFonts.title,
    fontSize: 28, 
    fontWeight: 'bold', 
    color: AppColors.blue,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  modalBody: {
    ...AppFonts.body,
    fontSize: 16, 
    color: AppColors.blue,
    textAlign: 'center', 
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  modalIcons: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
  modalIcon: {
    width: 46, height: 46, borderRadius: 3,
    borderWidth: 2, borderColor: AppColors.blue,
  },
  modalBtn: {
    backgroundColor: AppColors.lilac,
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 3,
    borderColor: AppColors.blue,
  },
  modalBtnText: {
    ...AppFonts.body,
    color: AppColors.blue,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});