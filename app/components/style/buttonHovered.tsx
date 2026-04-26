import { AppColors, AppFonts, Spacing } from '@/constants/theme';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
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
            hovered && styles.textHover,
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
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: AppColors.blue,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    marginBottom: '5%'
  },

  hover: {
    backgroundColor: AppColors.blue,
    transform: [{ scale: 1.03 }],
  },

  pressed: {
    transform: [{ scale: 0.97 }],
  },

  text: {
    color: AppColors.blue,
    letterSpacing: 3,
  },

  textHover: {
    color: AppColors.lilac,
    fontSize:28
  },

  disabled: {
    opacity: 0.5,
  },
});