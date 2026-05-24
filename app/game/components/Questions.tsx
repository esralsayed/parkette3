// components/QuestionScreen.tsx
//
// Reusable pre/post question screen that mirrors ChoiceModal's design language.
// Renders a series of multiple-choice questions (from preQuestions / postQuestions)
// one at a time, tracks score, and calls onComplete when all are answered.

import { AppColors, AppFonts, AppFontSizes } from '@/constants/theme';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Matches the QuestionSchema in Level mongoose model */
export interface Question {
  text: string;
  options: string[];       // 2–4 choices
  correctIndex: number;    // 0-based
  hint?: string;
}

export type QuestionScreenMode = 'pre' | 'post';

interface QuestionScreenProps {
  mode: QuestionScreenMode;
  questions: Question[];
  levelTitle?: string;
  /** Called when the user finishes all questions. score = number correct */
  onComplete: (score: number, total: number) => void;
  /** Optional — shown as a skip/close button label */
  onSkip?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRE_HEADER = {
  emoji: '🧠',
  title: 'Before we begin…',
  subtitle: 'Answer a quick question — no pressure!',
};

const POST_HEADER = {
  emoji: '⭐',
  title: 'How did you do?',
  subtitle: 'Let\'s see what you learned!',
};

// ─── QuestionScreen ───────────────────────────────────────────────────────────

export default function QuestionScreen({
  mode,
  questions,
  levelTitle,
  onComplete,
  onSkip,
}: QuestionScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);

  // Animation refs
  const cardAnim = useRef(new Animated.Value(0)).current;    // slide-in card
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const header = mode === 'pre' ? PRE_HEADER : POST_HEADER;
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const total = questions.length;

  // Slide card in on mount + question change
  useEffect(() => {
    cardAnim.setValue(40);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 9 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [currentIndex]);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / total,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentIndex, total]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

const scoreRef = useRef(0);

  const handleSelect = useCallback((index: number) => {
  if (selectedIndex !== null) return;
  setSelectedIndex(index);

  const correct = index === current.correctIndex;
  if (correct) {
      scoreRef.current += 1;
  setScore(scoreRef.current);
  } else {
    triggerShake();
    if (current.hint) setShowHint(true);
  }
}, [selectedIndex, current]);


const handleNext = useCallback(() => {
  if (isLast) {
    // score is already updated by handleSelect — don't re-add
    setTimeout(() => onComplete(scoreRef.current, total), 300);
    return;
  }
  Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
    setSelectedIndex(null);
    setShowHint(false);
    setCurrentIndex(prev => prev + 1);
  });
}, [isLast, score, total, onComplete]);

  const getOptionStyle = (index: number) => {
    if (selectedIndex === null) return styles.optionCard;
    if (index === current.correctIndex) return [styles.optionCard, styles.optionCorrect];
    if (index === selectedIndex) return [styles.optionCard, styles.optionWrong];
    return [styles.optionCard, styles.optionDimmed];
  };

  const getOptionTextStyle = (index: number) => {
    if (selectedIndex === null) return styles.optionText;
    if (index === current.correctIndex) return [styles.optionText, styles.optionTextCorrect];
    if (index === selectedIndex) return [styles.optionText, styles.optionTextWrong];
    return [styles.optionText, styles.optionTextDimmed];
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.screen}>

      {/* ── Top bar: progress + skip ── */}
      <View style={styles.topBar}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.counterText}>{currentIndex + 1} / {total}</Text>
        {onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>{header.emoji}</Text>
        <Text style={styles.headerTitle}>{header.title}</Text>
        {levelTitle && (
          <Text style={styles.levelLabel}>{levelTitle}</Text>
        )}
        <Text style={styles.headerSubtitle}>{header.subtitle}</Text>
      </View>

      {/* ── Question card ── */}
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: cardAnim },
              { translateX: shakeAnim },
            ],
          },
        ]}
      >
        <View style={styles.card}>
          {/* Question text */}
          <Text style={styles.questionText}>{current.text}</Text>

          {/* Options */}
          <View style={styles.optionsList}>
            {current.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getOptionStyle(index)}
                onPress={() => handleSelect(index)}
                activeOpacity={0.82}
                disabled={selectedIndex !== null}
              >
                {/* Letter badge */}
                <View style={[
                  styles.optionBadge,
                  selectedIndex !== null && index === current.correctIndex && styles.badgeCorrect,
                  selectedIndex !== null && index === selectedIndex && index !== current.correctIndex && styles.badgeWrong,
                ]}>
                  <Text style={styles.optionBadgeText}>
                    {['A', 'B', 'C', 'D'][index]}
                  </Text>
                </View>
                <Text style={getOptionTextStyle(index)}>{option}</Text>
                {/* Result icon */}
                {selectedIndex !== null && (
                  <Text style={styles.resultIcon}>
                    {index === current.correctIndex ? '✓' : index === selectedIndex ? '✗' : ''}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Hint (shows on wrong answer) */}
          {showHint && current.hint && (
            <Animated.View style={styles.hintBox}>
              <Text style={styles.hintLabel}>💡 Hint</Text>
              <Text style={styles.hintText}>{current.hint}</Text>
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {/* ── Next / Finish button (appears after selection) ── */}
      {selectedIndex !== null && (
        <Animated.View style={[styles.nextWrapper, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.88}>
            <Text style={styles.nextBtnText}>
              {isLast ? '✓ Done!' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.gameBg,
    paddingHorizontal: 20,
  },

  // ── Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.blue,
    borderRadius: 99,
  },
  counterText: {
    ...AppFonts.bodySmall,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    minWidth: 36,
    textAlign: 'right',
  },
  skipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: AppColors.blue,
  },
  skipText: {
    ...AppFonts.bodySmall,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
  },

  // ── Header
  header: {
    alignItems: 'center',
    paddingVertical: 18,
    gap: 4,
  },
  headerEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  headerTitle: {
    ...AppFonts.title,
    fontSize: AppFontSizes.title ?? 22,
    color: AppColors.dark,
    textAlign: 'center',
  },
  levelLabel: {
    ...AppFonts.bodySmall,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.8,
  },
  headerSubtitle: {
    ...AppFonts.body,
    fontSize: AppFontSizes.body,
    color: AppColors.dark,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 2,
  },

  // ── Card
  cardWrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: AppColors.blue,
    padding: 20,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    gap: 18,
  },
  questionText: {
    ...AppFonts.body,
    fontSize: AppFontSizes.body,
    color: AppColors.dark,
    lineHeight: 28,
    textAlign: 'center',
  },

  // ── Options (mirrors ChoiceModal's optionCard)
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.blue,
    padding: 12,
    gap: 10,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  optionCorrect: {
    backgroundColor: '#E8F8EE',
    borderColor: '#34C769',
    shadowColor: '#34C769',
  },
  optionWrong: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FF5A5A',
    shadowColor: '#FF5A5A',
  },
  optionDimmed: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeCorrect: {
    backgroundColor: '#34C769',
  },
  badgeWrong: {
    backgroundColor: '#FF5A5A',
  },
  optionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  optionText: {
    ...AppFonts.bodySmall,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.dark,
    flex: 1,
    flexWrap: 'wrap',
  },
  optionTextCorrect: {
    color: '#1A7A40',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#CC3333',
  },
  optionTextDimmed: {
    color: '#AAAAAA',
  },
  resultIcon: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 18,
    textAlign: 'center',
  },

  // ── Hint box
  hintBox: {
    backgroundColor: AppColors.lilacLight ?? '#F5F0FF',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.blue,
    padding: 12,
    gap: 4,
  },
  hintLabel: {
    ...AppFonts.bodySmall,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    fontWeight: '700',
  },
  hintText: {
    ...AppFonts.bodySmall,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.dark,
    lineHeight: 20,
  },

  // ── Next button
  nextWrapper: {
    paddingVertical: 16,
  },
  nextBtn: {
    backgroundColor: AppColors.blue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.blue,
    shadowColor: AppColors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 4,
  },
  nextBtnText: {
    ...AppFonts.body,
    fontSize: AppFontSizes.body,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});