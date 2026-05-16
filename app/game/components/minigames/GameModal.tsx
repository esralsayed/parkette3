// components/minigames/GameModal.tsx
//
// Shared modal shell for every game type.
// Screen 1 → HowToPlay  (auto-shown, skip button available)
// Screen 2 → Game content (passed as children)
//
// Usage:
//   <GameModal
//     visible={true}
//     title="Fire Hazard!"
//     howToPlay={{ ... }}
//     fullscreen={false}         // true for FindFriendsGame
//     onClose={() => {}}
//   >
//     <FireHazardGame ... />
//   </GameModal>
//
// Adding a new game type = write the gameplay UI, wrap in <GameModal>.
// Zero shell boilerplate needed.

import CatSvg from "@/assets/svgs/game/Cat.svg";
import { AppColors, AppFonts, AppFontSizes } from '@/constants/theme';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import HowToPlayModal from '../howtoplay';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HowToPlayContent {
  instructions: string;
  highlightPhrases?: string[];
  steps?: { icon: string; label: string }[];
  characters?: { emoji: string; label: string; hidden?: boolean }[];
}

interface GameModalProps {
  visible: boolean;
  title: string;
  howToPlay: HowToPlayContent;
  /** True → modal fills the screen (FindFriendsGame). False → compact centered modal. */
  fullscreen?: boolean;
height?: number | 'auto';
  onClose?: () => void;
  children: React.ReactNode;
}

// ─── GameModal ────────────────────────────────────────────────────────────────

export default function GameModal({
  visible, title, howToPlay, fullscreen = false, height= 'auto', onClose, children,
}: GameModalProps) {
  const [howToPlayVisible, setHowToPlayVisible] = useState(true);

  const scaleAnim   = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('🎮 GameModal visible changed:', visible);
    if (visible) {
    console.log('🎮 Setting howToPlayVisible to true');
      setHowToPlayVisible(true); // reset on each open
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 180 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <>
      {/* ── Game modal (game content only) ── */}
      <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
        <View style={[styles.overlay, fullscreen && styles.overlayFullscreen]}>
          <Animated.View style={[styles.modalContainer, fullscreen && styles.modalContainerFullscreen, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
            <View style={[styles.modal, fullscreen ? styles.modalFullscreen : styles.modalCompact, { height }]}>

              <View style={[styles.pixelCorner, styles.pcTL]} />
              <View style={[styles.pixelCorner, styles.pcTR]} />
              <View style={[styles.pixelCorner, styles.pcBL]} />
              <View style={[styles.pixelCorner, styles.pcBR]} />

              <View style={styles.header}>
                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                {onClose && (
                  <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={styles.closeX}>✕</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.helpBtn} onPress={() => setHowToPlayVisible(true)}>
                  <Text style={styles.helpBtnText}>?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.screensClip}>
                {/* Floating ? button */}
                {children}
              </View>

            </View>
          </Animated.View>
        </View>
      </Modal>
    <HowToPlayModal
        isVisible={visible && howToPlayVisible}        // visible → isVisible
        onClose={() => { setHowToPlayVisible(false); onClose?.(); }}  // onStart → onClose
        title="How to Play"
        instructions={howToPlay.instructions}
        highlightPhrases={howToPlay.highlightPhrases}
        steps={howToPlay.steps ?? []}
        characters={howToPlay.characters}
        CatSvg={CatSvg}
    />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,20,50,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  overlayFullscreen: {
    padding: 0,
  },

  // Container
  modalContainer: {
    width: '100%',
    maxWidth: 1300,
    alignItems: 'center',
  },
  modalContainerFullscreen: {
    maxWidth: '100%',
    flex: 1,
    alignSelf: 'stretch',
  },

  // Modal box
  modal: {
    width: '100%',
    backgroundColor: AppColors.lilac,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: AppColors.blue,
    overflow: 'hidden',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  modalCompact: {
    // default — no extra styles needed
  },
  modalFullscreen: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
  },

  // Pixel corners
  pixelCorner: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: AppColors.lilac,
    zIndex: 10,
  },
  pcTL: { top: 0,  left: 0  },
  pcTR: { top: 0,  right: 0 },
  pcBL: { bottom: 0, left: 0  },
  pcBR: { bottom: 0, right: 0 },

  // Header
  header: {
    backgroundColor: AppColors.blue,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 3,
    borderBottomColor: AppColors.dark,
  },
  screenIndicator: {
    flexDirection: 'row',
    gap: 5,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.lilac,
    opacity: 0.35,
  },
  indicatorDotActive: {
    opacity: 1,
  },
  headerTitle: {
    ...AppFonts.title,
    color: AppColors.lilac,
    fontSize: AppFontSizes.title,
    letterSpacing: 1,
    flex: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    backgroundColor: AppColors.lilac,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: AppColors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    color: AppColors.blue,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },

  // Screens
  screensClip: {
    overflow: 'hidden',
    flex: 1,
    position: 'relative',
    minHeight: 200,
  },
  screenAbsolute: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  screenFullscreen: {
    // game content fills the full clip area
  },

  // ── HowToPlay ──────────────────────────────────────────────────────────────
  howToBody: {
    padding: 20,
    paddingBottom: 24,
    gap: 16,
  },
  charRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  charBubble: {
    alignItems: 'center',
    gap: 5,
  },
  charIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: AppColors.blue,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  charIconHidden: {
    backgroundColor: AppColors.lilac,
  },
  charEmoji: {
    fontSize: 22,
    lineHeight: 26,
    color: AppColors.blue,
    fontWeight: '800',
  },
  charLabel: {
    ...AppFonts.body,
    fontSize: AppFontSizes.body,
    fontWeight: '700',
    color: AppColors.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: AppColors.blue,
    borderStyle: 'dashed',
  },
  howToInstructions: {
    ...AppFonts.body,
    fontSize: AppFontSizes.body,
    color: AppColors.blue,
    textAlign: 'center',
    lineHeight: 26,
  },
  howToHighlight: {
    fontWeight: '900',
    color: AppColors.dark,
    textDecorationLine: 'underline',
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: AppColors.blue,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 4,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  stepIcon:  { fontSize: 20, lineHeight: 24 },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.dark,
    textAlign: 'center',
    lineHeight: 14,
  },
  startBtn: {
    backgroundColor: AppColors.blue,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
    shadowColor: AppColors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  startBtnText: {
    ...AppFonts.body,
    color: AppColors.lilac,
    fontSize: AppFontSizes.body,
    fontWeight: '900',
    letterSpacing: 1,
  },
    // Floating ? button
  helpBtn: {
    position: 'absolute',
    marginTop: 5,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 4,
    backgroundColor: AppColors.lilac,
    borderWidth: 2,
    borderColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  helpBtnText: {
    color: AppColors.blue,
    fontWeight: '800',
    fontSize: 18,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});