import Circle1 from '@/assets/svgs/diary/circle1.svg';
import Circle2 from '@/assets/svgs/diary/circle2.svg';
import { AppColors, AppFonts } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';


interface WindowProps {
  onClose?: () => void;
  onColorPicked?: (color: 'lilac' | 'blue') => void;
}

export function ColoredWindow({ onClose, onColorPicked }: WindowProps) {
  const { width: screenWidth, height:screenHeight } = useWindowDimensions();
  const [selectedColor, setSelectedColor] = useState<'lilac' | 'blue' | null>(null);
  if (!screenHeight || !screenWidth) return null; 

  const pickColor = (color: 'lilac' | 'blue') => {
    setSelectedColor(color);
    onColorPicked?.(color);
  };

  return (
    <View style={[styles.window , {width: screenWidth * 0.25}]}>
      <View style={styles.upperWindow}>
        <Text style={[styles.windowText , {fontSize: screenWidth * 0.025}]}>Colors</Text>
        <TouchableOpacity onPress={onClose} style={[styles.close , {width: screenWidth * 0.035, height: screenWidth * 0.023,}]}>
          <Text style={[styles.windowX , {fontSize: screenWidth * 0.025}]}>X</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.lowerWindow , {paddingVertical: screenWidth * 0.025,paddingHorizontal: screenWidth * 0.01,}]}>
        <View style={styles.leftWindow}>
          <TouchableOpacity onPress={() => pickColor('lilac')}>
            <View style={[styles.circleStack , {  width: screenWidth * 0.08,height: screenWidth * 0.08,}]}>
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
    letterSpacing: 0.5,
    paddingLeft:10
  },
  windowX: {
    ...AppFonts.body,
    color: AppColors.blue,

  },
  close: {
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
    backgroundColor: AppColors.lilac,
  },
  leftWindow: {
    flex: 1,
    alignItems: 'center',
  },
  circleStack: {
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
import { FontFamily, FontSize, TextAlignment } from '../hooks/useToolBar';


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
  const { width: screenWidth, height:screenHeight } = useWindowDimensions();
  if (!screenHeight || !screenWidth) return null; 

  return (
    <View style={[styles.window , {width: screenWidth * 0.28}]}>

      {/* Header */}
      <View style={styles.upperWindow}>
        <Text style={[styles.windowText , {fontSize: screenWidth * 0.025,}]}>Text</Text>
        <TouchableOpacity onPress={onClose} style={[styles.close , {width: screenWidth * 0.035 ,height: screenWidth * 0.023}]}>
          <Text style={[styles.windowX, {fontSize: screenWidth * 0.025}]}>X</Text>
        </TouchableOpacity>
      </View>

      {/* Font family */}
      <View style={[styles2.section , {padding: screenWidth * 0.012, gap: screenWidth * 0.008}]}>
        {FONT_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => onFontFamily(f.value)}
            style={[styles2.fontButton, {paddingVertical: screenWidth * 0.008,} , selectedLetter?.style.fontFamily === f.value && styles2.selected]}
          >
            <Text style={[styles2.fontButtonText , {fontSize: screenWidth * 0.018}]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles2.divider} />

      {/* Font size grid */}
      <View style={[styles2.sizeGrid , {flexWrap: 'wrap', padding: screenWidth * 0.008, gap: screenWidth * 0.006,}]}>
        {SIZE_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s.value}
            onPress={() => onFontSize(s.value)}
            style={[styles2.sizeButton, {paddingHorizontal: screenWidth * 0.012, paddingVertical: screenWidth * 0.006,} , selectedLetter?.style.fontSize === s.value && styles2.selected]}
          >
            <Text style={[styles2.sizeLabel , {fontSize: screenWidth * 0.016,}]}>{s.label}</Text>
            <Text style={[styles2.sizeValue , {fontSize: screenWidth * 0.016}]}>{s.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles2.divider} />

      {/* Alignment + Color */}
      <View style={[styles2.bottomRow , {padding: screenWidth * 0.01, gap: screenWidth * 0.008,}]}>
        <View style={[styles2.alignmentGroup , {    gap: screenWidth * 0.006,}]}>
          {ALIGNMENT_OPTIONS.map((a) => (
            <TouchableOpacity
              key={a.value}
              onPress={() => onAlignment(a.value)}
              style={[styles2.alignButton, {
                    width: screenWidth * 0.032,
    height: screenWidth * 0.032,
              } , selectedLetter?.style.alignment === a.value && styles2.selected]}
            >
              <Text style={[styles2.alignIcon , {    fontSize: screenWidth * 0.018,}]}>{a.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles2.verticalDivider} />

        <View style={styles2.colorGroup}>
          <Text style={[styles2.colorLabel, {    fontSize: screenWidth * 0.016,}]}>Colors</Text>
          <View style={[styles2.circleStack , {    width: screenWidth * 0.05,
    height: screenWidth * 0.05,}]}>
            <Circle2 width={screenWidth * 0.04} height={screenWidth * 0.04} style={{ position: 'absolute', top: 2, left: 2 }} />
            <Circle1 width={screenWidth * 0.04} height={screenWidth * 0.04}
            style={{zIndex:10}} />
          </View>
          <TouchableOpacity onPress={() => onColor('blue')}>
            <View style={[styles2.circleStack, {    width: screenWidth * 0.05,
    height: screenWidth * 0.05,}]}>
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
    letterSpacing: 0.5,
  },
  windowX: {
    ...AppFonts.body,
    color: AppColors.blue,
  },
  close: {
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
  },
  fontButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: AppColors.blue,
    borderRadius: 6,
    alignItems: 'center',
  },
  fontButtonText: {
    ...AppFonts.body,
    color: AppColors.blue,
  },
  selected: {
    borderWidth:2
  },
  sizeGrid: {
    flexDirection: 'row',
  },
  sizeButton: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.blue,
    borderRadius: 6,
  },
  sizeLabel: {
    ...AppFonts.body,
    color: AppColors.blue,
  },
  sizeValue: {
    ...AppFonts.body,
    color: AppColors.blue,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alignmentGroup: {
    flexDirection: 'row',
  },
  alignButton: {
    borderWidth: 1.5,
    borderColor: AppColors.blue,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignIcon: {
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
    color: AppColors.blue,
  },
  circleStack: {
    position: 'relative',
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
  const { width: screenWidth, height:screenHeight } = useWindowDimensions();
  if (!screenHeight || !screenWidth) return null; 

  return (
    <View style={[styles3.window , {    width: screenWidth * 0.25,}]}>
      <View style={styles3.upperWindow}>
        <Text style={[styles3.windowText , {    fontSize: screenWidth * 0.025,}]}>Stickers</Text>
        <TouchableOpacity onPress={onClose} style={[styles3.close , {    width: screenWidth * 0.035,
    height: screenWidth * 0.023,}]}>
          <Text style={[styles3.windowX , {fontSize: screenWidth * 0.025,}]}>X</Text>
        </TouchableOpacity>
      </View>

      <View style={[{ padding: screenWidth * 0.012, gap: screenWidth * 0.008,}]}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[{flexDirection: 'row',gap: screenWidth * 0.008,marginBottom: screenWidth * 0.008,}]}>
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
        <View style={[styles3.hint, {padding: screenWidth * 0.01,}]}>
          <Text style={[styles3.hintText , {    fontSize: screenWidth * 0.014,}]}>Tap on the diary cover to place it</Text>
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
    letterSpacing: 0.5,
  },
  windowX: {
    ...AppFonts.body,
    color: AppColors.blue,
  },
  close: {
    backgroundColor: AppColors.lilac,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: AppColors.blue,
  },
  hintText: {
    ...AppFonts.body,
    color: AppColors.blue,
  },
});