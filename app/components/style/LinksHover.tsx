import { AppColors, AppFonts } from '@/constants/theme';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface LinkTextProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export default function LinkText({
  title,
  onPress,
  variant = 'primary',
}: LinkTextProps) {
  return (
    <Pressable onPress={onPress}>
      {({ hovered, pressed }) => (
        <Text
          style={[
            AppFonts.bodySmall,
            styles.base,
            variant === 'secondary' && styles.secondary,
            hovered && styles.hover,
            pressed && styles.pressed,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    color: AppColors.blue,
  },

  secondary: {
    opacity: 0.6,
    fontSize: 13,
  },

  hover: {
    textDecorationLine: 'underline',
    color: '#4a6adc',
  },

  pressed: {
    opacity: 0.5,
  },
});