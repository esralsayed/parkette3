// app/game/components/minigames/ImageChoiceGame.tsx

import { AppColors, AppFonts } from '@/constants/theme';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImageChoiceOption {
  id: string;
  label: string;
  image: ImageSourcePropType;
  correct: boolean;
  feedback?: string;
}

interface ImageChoiceGameProps {
  instruction?: string;
  options: ImageChoiceOption[];
  onComplete: (correct: boolean, selectedId: string, chosenText: string, correctText: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageChoiceGame({
  instruction = 'Choose the right one!',
  options,
  onComplete,
}: ImageChoiceGameProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'picking' | 'feedback'>('picking');

  const scales = useRef(options.map(() => new Animated.Value(1))).current;

  const correctOption = options.find(o => o.correct)!;

  const handlePick = (opt: ImageChoiceOption, index: number) => {
    if (phase !== 'picking') return;

    setSelectedId(opt.id);
    setPhase('feedback');

    // Bounce the tapped card
    Animated.sequence([
      Animated.timing(scales[index], { toValue: 1.08, duration: 100, useNativeDriver: true }),
      Animated.timing(scales[index], { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start();

    // For correct answers advance quickly, wrong answers let levelPlayer show feedback popup
    setTimeout(() => {
      onComplete(opt.correct, opt.id, opt.label, correctOption.label);
    }, opt.correct ? 1200 : 800);
  };

  return (
    <View style={styles.container}>
      {/* ── Instruction banner ── */}
      <View style={styles.instructionBanner}>
        <Text style={styles.instructionText}>{instruction}</Text>
      </View>

      {/* ── Cards row ── */}
      <View style={styles.cardsRow}>
        {options.map((opt, i) => {
          const isSelected = selectedId === opt.id;
          const showResult = phase === 'feedback' && isSelected;
          const isCorrect  = opt.correct;

          let borderColor = AppColors.blue;
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
                style={[
                  styles.card,
                  { borderColor },
                  isSelected && styles.cardSelected,
                ]}
              >
                {/* Image fills the square */}
                <Image source={opt.image} style={styles.cardImage} resizeMode="cover" />

                {/* Result overlay */}
                {showResult && (
                  <View style={[
                    styles.resultOverlay,
                    isCorrect ? styles.overlayCorrect : styles.overlayWrong,
                  ]}>
                    <Text style={styles.resultMark}>{isCorrect ? '✓' : '✕'}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Label sits below the card, outside so shadow isn't clipped */}
              <View style={[
                styles.labelBar,
                isSelected && { backgroundColor: borderColor, borderColor },
              ]}>
                <Text style={styles.labelText}>{opt.label}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_SIZE = 110;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 12,
    gap: 4,
  },

  // Instruction — same dashed style as HowToPlay divider
  instructionBanner: {
    backgroundColor: AppColors.lilac,
    borderWidth: 2,
    borderColor: AppColors.blue,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 14,
    marginHorizontal: 16,
  },
  instructionText: {
    ...AppFonts.body,
    fontSize: 16,
    color: AppColors.blue,
    textAlign: 'center',
  },

  // Cards row
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cardWrap: {
    alignItems: 'center',
    gap: 6,
  },

  // Card — matches HowToPlay stepCard style: white bg, blue border, blue shadow
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
  cardSelected: {
    borderWidth: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },

  // Correct/wrong tint overlay
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCorrect: { backgroundColor: 'rgba(39,174,96,0.4)' },
  overlayWrong:   { backgroundColor: 'rgba(224,85,85,0.4)' },
  resultMark: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
  },

  // Label sits below card, same pill style as HowToPlay charLabel
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