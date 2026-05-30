import { AppColors, AppFonts, AppFontSizes, Spacing } from '@/constants/theme';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function SecondaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ hovered, pressed }) => [
        styles.button,
        hovered && styles.hover,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {({ hovered }) => (
        <Text
          style={[
            AppFonts.button2,
            styles.text,
          ]}
        >
          {loading ? 'LOADING...' : title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.lilac,
    borderWidth: 3,
    borderColor: AppColors.blue,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4, 
  },

  hover: {
    transform: [{ scale: 1.04 }],
  },

  pressed: {
    transform: [{ scale: 0.97 }],
  },

  text: {
    ...AppFonts.body,
    color: AppColors.blue,
    fontSize: AppFontSizes.bodySmall
  },

  disabled: {
    opacity: 0.5,
  },
});