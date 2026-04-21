// app/game/components/DialogBox.tsx
import { AppColors, AppFonts, Spacing } from '@/constants/theme';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface DialogBoxProps {
  type: 'narrate' | 'dialog' | 'task';
  speaker?: string | null;
  text?: string | null;
  instruction?: string | null;
  onTap?: () => void;
  canAdvance?: boolean;
  characterEmoji?: string;
}

export default function DialogBox({
  type,
  speaker,
  text,
  instruction,
  onTap,
  canAdvance = true,
  characterEmoji = '📖',
}: DialogBoxProps) {

  // // Handle task type separately - check at the beginning
  // if (type === 'task') {
  //   return (
  //     <View style={[CardStyles.default, styles.taskContainer]}>
  //       <View style={styles.taskHeader}>
  //         <Text style={styles.taskEmoji}>🎮</Text>
  //         <Text style={styles.taskInstruction}>{instruction}</Text>
  //       </View>
  //     </View>
  //   );
  // }

  // For narrate and dialog types
  if (type === 'dialog'){

      return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onTap}
      activeOpacity={canAdvance ? 0.7 : 1}
      disabled={!canAdvance}
    >
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.speakerName}>
              {type === 'dialog' ? speaker : 'Narrator'}
            </Text>
            {canAdvance && (
              <Text style={styles.tapHint}>Tap →</Text>
            )}
          </View>
          <View style={styles.dialogCard}>
          <Text style={styles.dialogText}>
            {text}
          </Text>
          </View>
        </View>
    </TouchableOpacity>
  );

  }

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.lilac,
    borderColor: AppColors.blue,
    borderWidth: 2,
    borderRadius: 12,
  },
  dialogCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    maxWidth: '100%',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    backgroundColor: AppColors.blue,
    padding: Spacing.sm,
  },
  speakerName: {
    ...AppFonts.body,
    fontSize: 20,
    color: AppColors.lilac,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: Spacing.sm,
  },
  tapHint: {
    ...AppFonts.bodySmall,
    fontSize: 11,
    color: AppColors.dark,
    opacity: 0.5,
  },
dialogText: {
  ...AppFonts.body,
  fontSize: 24,
  lineHeight: 28, // Increased line height for wrapped text
  color: AppColors.blue,
  flexShrink: 1,  // Add this
  flexWrap: 'wrap', // Add this
},
  taskContainer: {
  //  backgroundColor: AppColors.lilacLight,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  taskEmoji: {
    fontSize: 28,
  },
  taskInstruction: {
    ...AppFonts.button,
    fontSize: 16,
    color: AppColors.blue,
    flex: 1,
  },
});