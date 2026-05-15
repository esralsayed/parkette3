// app/game/components/howtoplay.tsx
//
// CHANGES
// ───────
// • ✕ button now correctly calls onClose (was accidentally calling onStart)
// • onStart prop removed — there is no "Let's Go" button; closing IS starting
// • Can be reopened freely via a help button in the game — just toggle isVisible

import { AppColors, AppFonts } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface StepItem {
  icon: string;
  label: string;
}

interface CharacterItem {
  emoji: string;
  label: string;
  hidden?: boolean;
}

interface HowToPlayModalProps {
  isVisible: boolean;
  onClose: () => void;          // ✕ pressed — dismiss and start/resume game

  title?: string;
  instructions: string;
  highlightPhrases?: string[];
  steps: StepItem[];
  characters?: CharacterItem[];
  catImageSource?: any;
}

// ─── Highlight helper ─────────────────────────────────────────────────────────

function HighlightedText({ text, phrases = [] }: { text: string; phrases?: string[] }) {
  if (!phrases.length) return <Text style={styles.instructionText}>{text}</Text>;

  const escaped = phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts = text.split(regex);

  return (
    <Text style={styles.instructionText}>
      {parts.map((part, i) =>
        phrases.includes(part)
          ? <Text key={i} style={styles.highlight}>{part}</Text>
          : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HowToPlayModal({
  isVisible,
  onClose,
  title = 'How to Play',
  instructions,
  highlightPhrases = [],
  steps,
  characters,
  catImageSource,
}: HowToPlayModalProps) {
  const scaleAnim   = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 180 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    }
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
        >
          {catImageSource && (
            <View style={styles.catContainer}>
              <Image source={catImageSource} style={styles.catImage} resizeMode="contain" />
            </View>
          )}

          <View style={styles.modal}>
            <View style={[styles.pixelCorner, styles.pcTL]} />
            <View style={[styles.pixelCorner, styles.pcTR]} />
            <View style={[styles.pixelCorner, styles.pcBL]} />
            <View style={[styles.pixelCorner, styles.pcBR]} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}           // ← fixed: was onStart
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              {characters && characters.length > 0 && (
                <View style={styles.characterRow}>
                  {characters.map((char, i) => (
                    <View key={i} style={styles.charBubble}>
                      <View style={[styles.charIcon, char.hidden && styles.charIconHidden]}>
                        <Text style={styles.charEmoji}>{char.hidden ? '?' : char.emoji}</Text>
                      </View>
                      <Text style={styles.charLabel}>{char.label}</Text>
                    </View>
                  ))}
                </View>
              )}

              {characters && characters.length > 0 && <View style={styles.divider} />}

              <HighlightedText text={instructions} phrases={highlightPhrases} />
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 50, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    position: 'relative',
  },
  catContainer: {
    position: 'absolute',
    left: -150,
    zIndex: 20,
    alignSelf: 'center',
    bottom: -110,
  },
  catImage: {
    width: 200,
    height: 200,
  },
  modal: {width: '100%',
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
  pixelCorner: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: AppColors.lilac,
    zIndex: 10,
  },
  pcTL: { top: 0, left: 0 },
  pcTR: { top: 0, right: 0 },
  pcBL: { bottom: 0, left: 0 },
  pcBR: { bottom: 0, right: 0 },
  header: {
    backgroundColor: AppColors.blue,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 3,
    borderBottomColor: AppColors.dark,
  },
  headerTitle: {
    ...AppFonts.body,
    color: AppColors.lilac,
    fontSize: 36,
    letterSpacing: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    backgroundColor: AppColors.lilac,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    color: AppColors.blue,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  body: {
    padding: 20,
    paddingBottom: 24,
  },
  characterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  charBubble: { alignItems: 'center', gap: 5 },
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
  charIconHidden: { backgroundColor: AppColors.lilac },
  charEmoji: {
    fontSize: 22,
    lineHeight: 26,
    color: AppColors.blue,
    fontWeight: '800',
  },
  charLabel: {
    ...AppFonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: AppColors.blue,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  instructionText: {
    ...AppFonts.body,
    fontSize: 24,
    color: AppColors.blue,
    lineHeight: 24,
    marginBottom: 18,
  },
  highlight: {
    backgroundColor: AppColors.blue,
    color: '#fff',
    borderRadius: 4,
    overflow: 'hidden',
    paddingHorizontal: 4,
  },
  stepsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  stepCard: {
    flex: 1,
    backgroundColor: AppColors.lilac,
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
  stepIcon: { fontSize: 20, lineHeight: 24 },
  stepNum: { ...AppFonts.body, fontSize: 12, color: AppColors.blue, fontWeight: '700' },
  stepLabel: { fontSize: 14, fontWeight: '700', color: AppColors.dark, textAlign: 'center', lineHeight: 14 },
  startBtn: {
    backgroundColor: AppColors.lilac,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: AppColors.blue,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  startBtnText: {
    ...AppFonts.button,
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.blue,
    letterSpacing: 1,
  },
});