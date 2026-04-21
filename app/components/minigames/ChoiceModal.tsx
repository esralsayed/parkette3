// app/components/minigames/ChoiceModal.tsx
import { TaskAnswer } from '@/app/interfaces/TaskAnswer';
import { AppColors, AppFonts } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface ChoiceOption {
  id: string | number;
  text: string;
  correct: boolean;
  feedback?: string;
    continuationSteps?: Array<{
    type: 'narrate' | 'dialog';
    text?: string;
    speaker?: string;
  }>;
}

interface ChoiceModalProps {
  visible: boolean;
  title?: string;
  instruction?: string;
  options: ChoiceOption[];
onSelect: (answer: TaskAnswer) => void;  onClose?: () => void;
  timeLimit?: number;
  allowRetry?: boolean;
  maxRetries?: number;
  showCharacterHint?: boolean;
}

export default function ChoiceModal({
  visible,
  title = "Make a Choice",
  instruction,
  options,
  onSelect,
  onClose,
  timeLimit,
  allowRetry = true,
  maxRetries = 3,
  showCharacterHint = true,
}: ChoiceModalProps) {
  const [selectedId, setSelectedId] = React.useState<string | number | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(timeLimit || 0);
  const [isTimedOut, setIsTimedOut] = React.useState(false);
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<number | null>(null);

  // Animation on mount
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 14,
          stiffness: 180,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Start timer if timeLimit exists
      if (timeLimit && timeLimit > 0) {
        setTimeLeft(timeLimit);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              setIsTimedOut(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      // Reset state when hidden
      setSelectedId(null);
      setIsTimedOut(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [visible, timeLimit]);

const buildAnswer = (option: ChoiceOption) => ({
  isCorrect: option.correct,
  choice: option.text,
  optionId: option.id,
  correctText: options.find(o => o.correct)?.text ?? '',
  continuationSteps: option.continuationSteps,
});

const handleSelect = (option: ChoiceOption) => {
  if (selectedId !== null) return;
  setSelectedId(option.id);
  const answer = buildAnswer(option);
  onSelect(answer);
  
};


  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* Modal box */}
          <View style={styles.modal}>
            {/* Pixel corner accents */}
            <View style={[styles.pixelCorner, styles.pcTL]} />
            <View style={[styles.pixelCorner, styles.pcTR]} />
            <View style={[styles.pixelCorner, styles.pcBL]} />
            <View style={[styles.pixelCorner, styles.pcBR]} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{title}</Text>
             
              {onClose && (
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeX}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Body */}
            <ScrollView
              contentContainerStyle={styles.body}
              showsVerticalScrollIndicator={false}
            >

              {/* Dashed divider */}
              {showCharacterHint && <View style={styles.divider} />}

              {/* Instruction text */}
              {instruction && (
                <Text style={styles.instructionText}>{instruction}</Text>
              )}

              
                <View style={styles.optionsContainer}>
                  {options.map((option, index) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        selectedId === option.id && styles.optionSelected,
                      ]}
                      onPress={() => handleSelect(option)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.optionContent}>
                        <Text style={styles.optionText}>{option.text}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

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
    fontSize: 28,
    letterSpacing: 1,
    flex: 1,
  },
  timerBadge: {
    backgroundColor: AppColors.lilac,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  timerUrgent: {
    backgroundColor: '#FF6B6B',
  },
  timerText: {
    ...AppFonts.bodySmall,
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.blue,
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
    fontSize: 20,
    color: AppColors.blue,
    lineHeight: 28,
    marginBottom: 18,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: AppColors.blue,
    padding: 12,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  optionSelected: {
    backgroundColor: AppColors.lilacLight,
    borderWidth: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: AppColors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.blue,
  },
  optionIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.blue,
  },
  optionText: {
    ...AppFonts.body,
    fontSize: 16,
    color: AppColors.dark,
    flex: 1,
    flexWrap: 'wrap',
  },
  hintText: {
    ...AppFonts.bodySmall,
    fontSize: 12,
    color: AppColors.blue,
    marginTop: 8,
    marginLeft: 48,
    opacity: 0.7,
  },
  feedbackContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    gap: 12,
  },
  feedbackCorrect: {
    backgroundColor: '#1f5b21',
  },
  feedbackWrong: {
    backgroundColor: '#5d0d15',
  },
  feedbackEmoji: {
    fontSize: 48,
  },
  feedbackText: {
    ...AppFonts.body,
    fontSize: 32,
    textAlign: 'center',
    color: AppColors.lilac,
  },
  retryHint: {
    ...AppFonts.bodySmall,
    fontSize: 12,
    color: AppColors.blue,
    marginTop: 8,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.blue,
    alignItems: 'center',
  },
  retryCounter: {
    ...AppFonts.bodySmall,
    fontSize: 12,
    color: AppColors.blue,
    opacity: 0.6,
  },
});