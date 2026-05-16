// components/minigames/ChoiceModal.tsx
//
// Text-choice game — now uses GameModal for the shell + HowToPlay.
// Only the option list lives here; all modal chrome is in GameModal.

import { TaskAnswer } from '@/app/game/interfaces/TaskAnswer';
import { AppColors, AppFonts, AppFontSizes } from '@/constants/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GameModal from './GameModal';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  onSelect: (answer: TaskAnswer) => void;
  onClose?: () => void;
}

// ─── ChoiceModal ──────────────────────────────────────────────────────────────

export default function ChoiceModal({
  visible,
  title = 'Make a Choice',
  instruction,
  options,
  onSelect,
  onClose,
}: ChoiceModalProps) {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  // Reset when modal re-opens
  React.useEffect(() => {
    if (!visible) setSelectedId(null);
  }, [visible]);

  const handleSelect = (option: ChoiceOption) => {
    if (selectedId !== null) return;
    setSelectedId(option.id);
    onSelect({
      isCorrect: option.correct,
      choice: option.text,
      optionId: option.id,
      correctText: options.find(o => o.correct)?.text ?? '',
      continuationSteps: option.continuationSteps,
    });
  };

  return (
    <GameModal
      visible={visible}
      title={title}
      howToPlay={{
        instructions: 'Read each option carefully and tap the one you think is right!',
        highlightPhrases: ['tap'],
        steps: [
          { icon: '👀', label: 'Read carefully' },
          { icon: '👆', label: 'Tap your answer' },
        ],
      }}
      onClose={onClose}
    >
      {/* ── Game content ── */}
      <View style={styles.body}>
        {instruction && (
          <Text style={styles.instruction}>{instruction}</Text>
        )}
        <View style={styles.optionsList}>
          {options.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedId === option.id && styles.optionSelected,
              ]}
              onPress={() => handleSelect(option)}
              activeOpacity={0.85}
              disabled={selectedId !== null}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </GameModal>
  );
}

// ─── Styles (game content only — no modal chrome) ─────────────────────────────

const styles = StyleSheet.create({
  body: {
    padding: 20,
    gap: 16,
  },
  instruction: {
    ...AppFonts.body,
    fontSize: AppFontSizes.body,
    color: AppColors.blue,
    textAlign: 'center',
    lineHeight: 26,
  },
  optionsList: {
    marginTop: 10,
    gap: 24,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: AppColors.blue,
    padding: 14,
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
  optionText: {
    ...AppFonts.bodySmall,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.dark,
    flexWrap: 'wrap',
  },
});