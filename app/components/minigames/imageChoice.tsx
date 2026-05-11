import { AppColors, AppFonts } from '@/constants/theme';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  gameType?: 'slide_choice' | string;
  onComplete: (correct: boolean, selectedId: string, chosenText: string, correctText: string) => void;
}

export default function ImageChoiceGame({
  visible = true,
  instruction = 'Choose the right one!',
  options,
  gameType,
  onComplete,
}: ImageChoiceGameProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'picking' | 'feedback'>('picking');

  const scales = useRef(options.map(() => new Animated.Value(1))).current;
  const scaleAnim   = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const correctOption = options.find(o => o.correct)!;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 180 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
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
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
        >
          <View style={styles.modal}>
            {/* Pixel corners — identical to HowToPlay */}
            <View style={[styles.pixelCorner, styles.pcTL]} />
            <View style={[styles.pixelCorner, styles.pcTR]} />
            <View style={[styles.pixelCorner, styles.pcBL]} />
            <View style={[styles.pixelCorner, styles.pcBR]} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Make a Choice</Text>
            </View>

            {/* Body */}
            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Instruction */}
              <Text style={styles.instructionText}>{instruction}</Text>

              {/* Cards */}
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
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const CARD_SIZE = 110;

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
  body: {
    padding: 20,
    paddingBottom: 24,
    gap: 16,
  },
  howToRow: {
    flexDirection: 'row',
    gap: 8,
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
  stepLabel: { fontSize: 14, fontWeight: '700', color: AppColors.dark, textAlign: 'center', lineHeight: 14 },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: AppColors.blue,
    borderStyle: 'dashed',
  },
  instructionText: {
    ...AppFonts.body,
    fontSize: 24,
    color: AppColors.blue,
    lineHeight: 24,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cardWrap: { alignItems: 'center', gap: 6 },
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
  cardSelected: { borderWidth: 4 },
  cardImage: { width: '100%', height: '100%' },
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