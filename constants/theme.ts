/**
 * Unified Design System for Parkette App
 * Based on provided design requirements
 */

import { Platform } from 'react-native';

// Custom Colors
export const AppColors = {
  lilac: '#E7E1FF', // C 7,M 11,Y 0,K 0 | R 231,G 225,B 255
  blue: '#003E8F',   // C 100,M 87,Y 14,K 2 | R 0,G 62,B 143
  lilacLight: '#E8DFFF', // Light lilac variant
  lilacMid: '#B8A5D8',   // Mid lilac variant
  white: '#FFFFFF',      // Pure white
  dark: '#0D1F3C',       // Dark blue/navy
  gameBg: '#E4D9F7',     // Game section background
  impressionsBg: '#EDE6F9', // Impressions section background
};

// Legacy Colors (keeping for compatibility)
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: AppColors.blue,
    secondary: AppColors.lilac,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: AppColors.blue,
    secondary: AppColors.lilac,
  },
};

// Custom Fonts
export const AppFonts = {
  title: {
    fontFamily: 'Game Paused DEMO', // Title font
  },
  header: {
    fontFamily: 'Game Paused DEMO', // Header font
  },
  subhead: {
    fontFamily: 'Game Paused DEMO', // Subhead font
  },
  body: {
    fontFamily: 'PixelPurl', // Body font
  },
  bodySmall: {
    fontFamily: 'yoster', // Body stranger font
  },
  button2:{
    fontFamily: 'Game Paused DEMO',
  },
  button:{
    fontFamily: 'PixelPurl',
  }
};

export const AppFontSizes = {
  super: 72,
  title:     52,
  header:    48,
  subhead:   36,
  body:      32,
  bodySmall: 20,
  button:    30,
  button2:   24,
};

// Button Styles
export const ButtonStyles = {
  // Icon buttons
  icon: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 12, // Adjust based on icon size
  },
  // Level buttons
  level: {
    borderRadius: 14,
    borderWidth: 4,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  // Most used buttons (Join, Play now)
  primary: {
    borderRadius: 6,
    borderWidth: 2,
    paddingVertical: 1,
    paddingHorizontal: 10,
  },
  // Action buttons
  action: {
    borderRadius: 6,
    borderWidth: 2,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  // Big action buttons
  bigAction: {
    borderRadius: 8,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  // Huge action buttons
  hugeAction: {
    borderRadius: 14,
    borderWidth: 4,
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
};

// Card Styles
export const CardStyles = {
  default: {
    borderRadius: 24,
    borderWidth: 4,
    padding: 16,
    borderColor: AppColors.blue,
    backgroundColor: AppColors.lilac,
  },

  shadowVersion: {
    borderRadius: 24,
    borderWidth: 4,
    padding: 16,
    borderColor: AppColors.blue,
    backgroundColor: AppColors.lilac,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5, // For Android shadow
  },
};

// Common spacing (divisible by 2 as specified)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Legacy Fonts (keeping for compatibility)
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
