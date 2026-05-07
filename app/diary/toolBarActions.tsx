import Circle1 from '@/assets/svgs/diary/circle1.svg';
import Circle2 from '@/assets/svgs/diary/circle2.svg';
import { AppColors, AppFonts } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
const { width: screenWidth, height:screenHeight } = useWindowDimensions();


interface WindowProps {
  onClose?: () => void;
  onColorPicked?: (color: 'lilac' | 'blue') => void;
}

export function ColoredWindow({ onClose, onColorPicked }: WindowProps) {
  if (!screenHeight || !screenWidth) return null; 

  const [selectedColor, setSelectedColor] = useState<'lilac' | 'blue' | null>(null);

  const pickColor = (color: 'lilac' | 'blue') => {
    setSelectedColor(color);
    onColorPicked?.(color);
  };

  return (
    <View style={styles.window}>
      <View style={styles.upperWindow}>
        <Text style={styles.windowText}>Colors</Text>
        <TouchableOpacity onPress={onClose} style={styles.close}>
          <Text style={styles.windowX}>X</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.lowerWindow}>
        <View style={styles.leftWindow}>
          <TouchableOpacity onPress={() => pickColor('lilac')}>
            <View style={styles.circleStack}>
                <Circle2 style={{ position: 'absolute', top: 5, left: 6 }} />  {/* shadow */}
                <Circle1 style={{zIndex:10}} />  {/* front */}
            </View>
        </TouchableOpacity>
        </View>
        <View style={styles.divider} />  {/* ← standalone divider */}
        <View style={styles.rightWindow}>
          <TouchableOpacity onPress={() => pickColor('blue')}>
            <View style={styles.circleStack}>
                <Circle1 style={{position: 'absolute', top: 5, left: 6}} />
                <Circle2 style={{zIndex:10}}/>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  window: {
    flexDirection: "column",
    borderWidth: 5,
    borderColor: AppColors.blue,
    borderRadius: 24,
    backgroundColor: AppColors.lilac,
    overflow: 'hidden',
    width: screenWidth * 0.25,
  },
  upperWindow: {
    flexDirection: "row",
    backgroundColor: AppColors.blue,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windowText: {
    ...AppFonts.body,
    color: AppColors.lilac,
    fontSize: screenWidth * 0.025,
    letterSpacing: 0.5,
    paddingLeft:10
  },
  windowX: {
    ...AppFonts.body,
    fontSize: screenWidth * 0.025,
    color: AppColors.blue,

  },
  close: {
    width: screenWidth * 0.035,
    height: screenWidth * 0.023,
    backgroundColor: AppColors.lilac,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowCircle: {},
  lowerWindow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: screenWidth * 0.025,
    paddingHorizontal: screenWidth * 0.01,
    backgroundColor: AppColors.lilac,
  },
  leftWindow: {
    flex: 1,
    alignItems: 'center',
  },
  circleStack: {
  width: screenWidth * 0.08,   // match your SVG width
  height: screenWidth * 0.08,  // match your SVG height
  position: 'relative',
},
  rightWindow: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',  // full height
  },
  divider:{
    width: 2,
    backgroundColor: AppColors.blue
  }
});


import { DiaryCustomLetter } from '@/app/repositories/Diary';
import { FontFamily, FontSize, TextAlignment } from './useToolBar';


interface TextWindowProps {
  onClose?: () => void;
  selectedLetter: DiaryCustomLetter | null;
  onFontFamily: (f: FontFamily) => void;
  onFontSize: (s: FontSize) => void;
  onAlignment: (a: TextAlignment) => void;
  onColor: (c: string) => void;
}

const FONT_OPTIONS: { label: string; value: FontFamily }[] = [
  { label: 'Game paused',  value: 'First'  },
  { label: 'pixelpurl', value: 'Second' },
  { label: 'yoster',  value: 'Third'  },
];

const SIZE_OPTIONS: { label: string; value: FontSize }[] = [
  { label: 'Small',  value: 48  },
  { label: 'Medium', value: 64  },
  { label: 'Large',  value: 100 },
  { label: 'Huge',   value: 150 },
];

const ALIGNMENT_OPTIONS: { icon: string; value: TextAlignment }[] = [
  { icon: '☰', value: 'left'   },
  { icon: '≡', value: 'center' },
  { icon: '☰', value: 'right'  },
];

export function TextWindow({
  onClose,
  selectedLetter,
  onFontFamily,
  onFontSize,
  onAlignment,
  onColor,
}: TextWindowProps) {
    if (!screenHeight || !screenWidth) return null; 

  return (
    <View style={styles.window}>

      {/* Header */}
      <View style={styles.upperWindow}>
        <Text style={styles.windowText}>Text</Text>
        <TouchableOpacity onPress={onClose} style={styles.close}>
          <Text style={styles.windowX}>X</Text>
        </TouchableOpacity>
      </View>

      {/* Font family */}
      <View style={styles2.section}>
        {FONT_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => onFontFamily(f.value)}
            style={[styles2.fontButton, selectedLetter?.style.fontFamily === f.value && styles2.selected]}
          >
            <Text style={styles2.fontButtonText}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles2.divider} />

      {/* Font size grid */}
      <View style={styles2.sizeGrid}>
        {SIZE_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s.value}
            onPress={() => onFontSize(s.value)}
            style={[styles2.sizeButton, selectedLetter?.style.fontSize === s.value && styles2.selected]}
          >
            <Text style={styles2.sizeLabel}>{s.label}</Text>
            <Text style={styles2.sizeValue}>{s.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles2.divider} />

      {/* Alignment + Color */}
      <View style={styles2.bottomRow}>
        <View style={styles2.alignmentGroup}>
          {ALIGNMENT_OPTIONS.map((a) => (
            <TouchableOpacity
              key={a.value}
              onPress={() => onAlignment(a.value)}
              style={[styles2.alignButton, selectedLetter?.style.alignment === a.value && styles2.selected]}
            >
              <Text style={styles2.alignIcon}>{a.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles2.verticalDivider} />

        <View style={styles2.colorGroup}>
          <Text style={styles2.colorLabel}>Colors</Text>
          <View style={styles2.circleStack}>
            <Circle2 width={screenWidth * 0.04} height={screenWidth * 0.04} style={{ position: 'absolute', top: 2, left: 2 }} />
            <Circle1 width={screenWidth * 0.04} height={screenWidth * 0.04}
            style={{zIndex:10}} />
          </View>
          <TouchableOpacity onPress={() => onColor('blue')}>
            <View style={styles2.circleStack}>
              <Circle2 width={screenWidth * 0.04} height={screenWidth * 0.04} style={{ position: 'absolute', top: 2, left: 2 }} />
              <Circle2 width={screenWidth * 0.04} height={screenWidth * 0.04}
              style={{zIndex:10}} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles2 = StyleSheet.create({
  window: {
    flexDirection: 'column',
    borderWidth: 5,
    borderColor: AppColors.blue,
    borderRadius: 8,
    backgroundColor: AppColors.lilac,
    overflow: 'hidden',
    width: screenWidth * 0.28,
  },
  upperWindow: {
    flexDirection: 'row',
    backgroundColor: AppColors.blue,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windowText: {
    ...AppFonts.body,
    color: AppColors.lilac,
    fontSize: screenWidth * 0.025,
    letterSpacing: 0.5,
  },
  windowX: {
    ...AppFonts.body,
    fontSize: screenWidth * 0.025,
    color: AppColors.blue,
  },
  close: {
    width: screenWidth * 0.035,
    height: screenWidth * 0.023,
    backgroundColor: AppColors.lilac,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1.5,
    backgroundColor: AppColors.blue,
    marginHorizontal: 0,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: screenWidth * 0.012,
    gap: screenWidth * 0.008,
  },
  fontButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: AppColors.blue,
    borderRadius: 6,
    paddingVertical: screenWidth * 0.008,
    alignItems: 'center',
  },
  fontButtonText: {
    ...AppFonts.body,
    fontSize: screenWidth * 0.018,
    color: AppColors.blue,
  },
  selected: {
    borderWidth:2
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: screenWidth * 0.008,
    gap: screenWidth * 0.006,
  },
  sizeButton: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.blue,
    borderRadius: 6,
    paddingHorizontal: screenWidth * 0.012,
    paddingVertical: screenWidth * 0.006,
  },
  sizeLabel: {
    ...AppFonts.body,
    fontSize: screenWidth * 0.016,
    color: AppColors.blue,
  },
  sizeValue: {
    ...AppFonts.body,
    fontSize: screenWidth * 0.016,
    color: AppColors.blue,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: screenWidth * 0.01,
    gap: screenWidth * 0.008,
  },
  alignmentGroup: {
    flexDirection: 'row',
    gap: screenWidth * 0.006,
  },
  alignButton: {
    borderWidth: 1.5,
    borderColor: AppColors.blue,
    borderRadius: 4,
    width: screenWidth * 0.032,
    height: screenWidth * 0.032,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignIcon: {
    fontSize: screenWidth * 0.018,
    color: AppColors.blue,
  },
  verticalDivider: {
    width: 1.5,
    alignSelf: 'stretch',
    backgroundColor: AppColors.blue,
  },
  colorGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  colorLabel: {
    ...AppFonts.body,
    fontSize: screenWidth * 0.016,
    color: AppColors.blue,
  },
  circleStack: {
    position: 'relative',
    width: screenWidth * 0.05,
    height: screenWidth * 0.05,
  },
});


// ── replace these with your actual SVG imports ──────────────────
import Sticker1 from '@/assets/svgs/diary/stickers/Sticker.svg';
import Sticker2 from '@/assets/svgs/diary/stickers/sticker1.svg';
import Sticker3 from '@/assets/svgs/diary/stickers/sticker2.svg';
import Sticker4 from '@/assets/svgs/diary/stickers/sticker3.svg';
import Sticker5 from '@/assets/svgs/diary/stickers/sticker4.svg';
import Sticker6 from '@/assets/svgs/diary/stickers/sticker5.svg';
import Sticker7 from '@/assets/svgs/diary/stickers/sticker6.svg';
import Sticker8 from '@/assets/svgs/diary/stickers/sticker7.svg';

export interface PlacedSticker {
  id: string;
  x: number;
  y: number;
}

export const STICKER_DEFS = [
  { id: 'sticker1', component: Sticker1 },
  { id: 'sticker2', component: Sticker2 },
  { id: 'sticker3', component: Sticker3 },
  { id: 'sticker4', component: Sticker4 },
  { id: 'sticker5', component: Sticker5 },
  { id: 'sticker6', component: Sticker6 },
  { id: 'sticker7', component: Sticker7 },
  { id: 'sticker8', component: Sticker8 },
];

interface StickersWindowProps {
  onClose?: () => void;
  onStickerSelected?: (stickerId: string) => void;
  selectedStickerId?: string | null;
}

export function StickersWindow({
  onClose,
  onStickerSelected,
  selectedStickerId,
}: StickersWindowProps) {
  const rows = [];
  for (let i = 0; i < STICKER_DEFS.length; i += 2) {
    rows.push(STICKER_DEFS.slice(i, i + 2));
  }
  if (!screenHeight || !screenWidth) return null; 

  return (
    <View style={styles3.window}>
      <View style={styles3.upperWindow}>
        <Text style={styles3.windowText}>Stickers</Text>
        <TouchableOpacity onPress={onClose} style={styles3.close}>
          <Text style={styles3.windowX}>X</Text>
        </TouchableOpacity>
      </View>

      <View style={styles3.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles3.row}>
            {row.map((sticker) => {
              const StickerComponent = sticker.component;
              const isSelected = selectedStickerId === sticker.id;
              return (
                <TouchableOpacity
                  key={sticker.id}
                  onPress={() => onStickerSelected?.(sticker.id)}
                  style={[styles3.cell, isSelected && styles3.cellSelected]}
                >
                  <StickerComponent width={screenWidth * 0.06} height={screenWidth * 0.06} />
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {selectedStickerId && (
        <View style={styles3.hint}>
          <Text style={styles3.hintText}>Tap on the diary cover to place it</Text>
        </View>
      )}
    </View>
  );
}

const styles3 = StyleSheet.create({
  window: {
    flexDirection: 'column',
    borderWidth: 5,
    borderColor: AppColors.blue,
    borderRadius: 8,
    backgroundColor: AppColors.lilac,
    overflow: 'hidden',
    width: screenWidth * 0.25,
  },
  upperWindow: {
    flexDirection: 'row',
    backgroundColor: AppColors.blue,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windowText: {
    ...AppFonts.body,
    color: AppColors.lilac,
    fontSize: screenWidth * 0.025,
    letterSpacing: 0.5,
  },
  windowX: {
    ...AppFonts.body,
    fontSize: screenWidth * 0.025,
    color: AppColors.blue,
  },
  close: {
    width: screenWidth * 0.035,
    height: screenWidth * 0.023,
    backgroundColor: AppColors.lilac,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    padding: screenWidth * 0.012,
    gap: screenWidth * 0.008,
  },
  row: {
    flexDirection: 'row',
    gap: screenWidth * 0.008,
    marginBottom: screenWidth * 0.008,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderColor: AppColors.blue,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.lilac,
  },
  cellSelected: {
    backgroundColor: AppColors.blue,
  },
  hint: {
    padding: screenWidth * 0.01,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: AppColors.blue,
  },
  hintText: {
    ...AppFonts.body,
    fontSize: screenWidth * 0.014,
    color: AppColors.blue,
  },
});