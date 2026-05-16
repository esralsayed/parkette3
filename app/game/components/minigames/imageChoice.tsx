// components/minigames/ImageChoiceGame.tsx
//
// Image-card choice game — now uses GameModal for the shell + HowToPlay.
// Only the card grid lives here; all modal chrome is in GameModal.

import { AppColors, AppFonts } from '@/constants/theme';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GameModal from './GameModal';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImageChoiceOption {
  id: string;
  label: string;
  image: ImageSourcePropType | string;
  correct: boolean;
  feedback?: string;
}

interface ImageChoiceGameProps {
  visible?: boolean;
  instruction?: string;
  options: ImageChoiceOption[];
  gameType?: string;
  onComplete: (correct: boolean, selectedId: string, chosenText: string, correctText: string) => void;
}

// ─── ImageChoiceGame ──────────────────────────────────────────────────────────

export default function ImageChoiceGame({
  visible = true,
  instruction = 'Choose the right one!',
  options,
  onComplete,
}: ImageChoiceGameProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase]           = useState<'picking' | 'feedback'>('picking');

  const scales = useRef(options.map(() => new Animated.Value(1))).current;
  const correctOption = options.find(o => o.correct)!;

  // Reset when modal re-opens
  React.useEffect(() => {
    if (!visible) {
      setSelectedId(null);
      setPhase('picking');
    }
  }, [visible]);

  const handlePick = (opt: ImageChoiceOption, index: number) => {
    if (phase !== 'picking') return;
    setSelectedId(opt.id);
    setPhase('feedback');

    Animated.sequence([
      Animated.timing(scales[index], { toValue: 1.08, duration: 100, useNativeDriver: true }),
      Animated.timing(scales[index], { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      onComplete(opt.correct, opt.id, opt.label, correctOption.label);
    }, opt.correct ? 1200 : 800);
  };

  const renderCardContent = (opt: ImageChoiceOption) => {
    if (typeof opt.image === 'function') {
      const SvgComponent = opt.image as React.FC<any>;
      return (
        <View style={styles.svgWrapper}>
          <SvgComponent width="100%" height="100%" />
        </View>
      );
    }
    return (
      <Image
        source={opt.image as ImageSourcePropType}
        style={styles.cardImage}
        resizeMode="cover"
      />
    );
  };

  return (
    <GameModal
      visible={visible}
      title="Make a Choice"
      howToPlay={{
        instructions: instruction,
        highlightPhrases: ['tap'],
        steps: [
          { icon: '👀', label: 'Look carefully' },
          { icon: '👆', label: 'Tap your answer' },
        ],
      }}
    >
      {/* ── Game content ── */}
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        <View style={styles.divider} />
        <Text style={styles.instructionText}>{instruction}</Text>

        <View style={styles.cardsRow}>
          {options.map((opt, i) => {
            const isSelected = selectedId === opt.id;
            const showResult = phase === 'feedback' && isSelected;
            const isCorrect  = opt.correct;
            let borderColor  = AppColors.blue;
            if (showResult) borderColor = isCorrect ? '#27AE60' : '#E05555';

            return (
              <Animated.View
                key={opt.id}
                style={[styles.cardWrap, { transform: [{ scale: scales[i] }] }]}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handlePick(opt, i)}
                  disabled={phase === 'feedback'}
                  style={[styles.card, { borderColor }, isSelected && styles.cardSelected]}
                >
                  {renderCardContent(opt)}
                  {showResult && (
                    <View style={[styles.resultOverlay, isCorrect ? styles.overlayCorrect : styles.overlayWrong]}>
                      <Text style={styles.resultMark}>{isCorrect ? '✓' : '✕'}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={[styles.labelBar, isSelected && { backgroundColor: borderColor, borderColor }]}>
                  <Text style={styles.labelText}>{opt.label}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

      </ScrollView>
    </GameModal>
  );
}

// ─── Styles (game content only) ───────────────────────────────────────────────

const CARD_SIZE = 110;

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingBottom: 24,
    gap: 16,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: AppColors.blue,
    borderStyle: 'dashed',
  },
  instructionText: {
    ...AppFonts.body,
    fontSize: 24,
    color: AppColors.blue,
    lineHeight: 28,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cardWrap:  { alignItems: 'center', gap: 6 },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: AppColors.blue,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  cardSelected:  { borderWidth: 4 },
  cardImage:     { width: '100%', height: '100%' },
  svgWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCorrect: { backgroundColor: 'rgba(39,174,96,0.4)' },
  overlayWrong:   { backgroundColor: 'rgba(224,85,85,0.4)' },
  resultMark: { fontSize: 40, fontWeight: '900', color: '#fff' },
  labelBar: {
    backgroundColor: AppColors.lilac,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: AppColors.blue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: CARD_SIZE,
    alignItems: 'center',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  labelText: {
    ...AppFonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.blue,
    textAlign: 'center',
  },
});