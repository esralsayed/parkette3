import Spiral from "@/assets/svgs/diary/Zig Zig.svg";
import { AppColors, AppFonts } from '@/constants/theme';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { DiaryCustomLetter } from "../../repositories/Diary";
import { PlacedSticker, STICKER_DEFS } from "./toolBarActions";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DiaryBookProps {
  ownerName?: string;
  onPress?: () => void;
  opening?: boolean;
  theme?: 'blue' | 'lilac';
  onLetterSelect?: (index: number) => void;        // ← new
  selectedLetterIndex?: number | null;             // ← new
  isTextMode?: boolean;  
letters?: DiaryCustomLetter[];   
//sticker stuffs
placedStickers?: PlacedSticker[];
onStickerPlace?: (x: number, y: number) => void;
isStickerMode?: boolean;
onStickerRemove?: (index: number) => void;
}

// ─── Pixel frog sticker ───────────────────────────────────────────────────────
const PixelFrog = () => (
  <Svg width={28} height={28} viewBox="0 0 14 14">
    {/* eyes */}
    <Rect x="1" y="1" width="3" height="3" rx="1" fill="#5a9e3a" />
    <Rect x="10" y="1" width="3" height="3" rx="1" fill="#5a9e3a" />
    <Rect x="2" y="2" width="1" height="1" fill="#fff" />
    <Rect x="11" y="2" width="1" height="1" fill="#fff" />
    {/* head */}
    <Rect x="2" y="3" width="10" height="7" rx="2" fill="#6dbf45" />
    {/* mouth */}
    <Rect x="4" y="8" width="2" height="1" fill="#3d7a25" />
    <Rect x="8" y="8" width="2" height="1" fill="#3d7a25" />
    <Rect x="6" y="9" width="2" height="1" fill="#3d7a25" />
    {/* nostrils */}
    <Rect x="5" y="6" width="1" height="1" fill="#3d7a25" />
    <Rect x="8" y="6" width="1" height="1" fill="#3d7a25" />
  </Svg>
);

// ─── Pixel cherry sticker ─────────────────────────────────────────────────────
const PixelCherry = () => (
  <Svg width={24} height={24} viewBox="0 0 12 12">
    <Rect x="5" y="1" width="1" height="4" fill="#3d7a25" />
    <Rect x="6" y="2" width="3" height="1" fill="#3d7a25" />
    <Rect x="8" y="2" width="1" height="3" fill="#3d7a25" />
    <Rect x="2" y="5" width="3" height="3" rx="1" fill="#e03c3c" />
    <Rect x="3" y="5" width="1" height="1" fill="#f07070" />
    <Rect x="7" y="5" width="3" height="3" rx="1" fill="#e03c3c" />
    <Rect x="8" y="5" width="1" height="1" fill="#f07070" />
  </Svg>
);

// ─── Pixel star ───────────────────────────────────────────────────────────────
const PixelStar = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 10 10">
    <Rect x="4" y="0" width="2" height="2" fill={color} />
    <Rect x="4" y="8" width="2" height="2" fill={color} />
    <Rect x="0" y="4" width="2" height="2" fill={color} />
    <Rect x="8" y="4" width="2" height="2" fill={color} />
    <Rect x="2" y="2" width="6" height="6" fill={color} />
    <Rect x="3" y="1" width="4" height="8" fill={color} />
    <Rect x="1" y="3" width="8" height="4" fill={color} />
  </Svg>
);

// ─── Pixel dot ornament ───────────────────────────────────────────────────────
const PixelDot = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={10} height={10} viewBox="0 0 4 4">
    <Rect x="1" y="0" width="2" height="4" fill={color} />
    <Rect x="0" y="1" width="4" height="2" fill={color} />
  </Svg>
);

const PixelTitle = ({
  text,
  color,
  onLetterSelect,
  selectedLetterIndex,
  indexOffset = 0,
  isTextMode = false,
  letters = [],
}: {
  text: string;
  color: string;
  onLetterSelect?: (index: number) => void;
  selectedLetterIndex?: number | null;
  indexOffset?: number;
  isTextMode?: boolean;
  letters?: DiaryCustomLetter[];
}) => {
  const { width: screenWidth, height:screenHeight } = useWindowDimensions();
  const rotations =       [-4,  3, -2,  5, -3,  2, -5,  4, -1,  3];
  const verticalOffsets = [  4, -6,  6, -4,  1, -1,  4, -7,  2, -7];
  const baseFontSize = screenWidth * 0.05;

  return (
    <View style={styles.row}>
      {text.split('').map((char, i) => {
        const globalIndex = indexOffset + i;
        const isSelected = selectedLetterIndex === globalIndex;
        const letterData = letters[globalIndex];  // ← per-letter style

        const baseFontSize = screenWidth * 0.055;
        const defaultFontSize = text.length > 7 
        ? baseFontSize * (7 / text.length) 
        : baseFontSize;

        const fontSize = letterData?.style.fontSize ?? defaultFontSize;
        const fontFamily = letterData?.style.fontFamily ?? AppFonts.title?.fontFamily;
        const letterColor = letterData?.style.color ?? color;


        return (
          <TouchableOpacity
            key={i}
            onPress={() => isTextMode && onLetterSelect?.(globalIndex)}
            activeOpacity={isTextMode ? 0.6 : 1}
          >
            <Text
              style={[
                styles.char,
                {
                  color: letterColor,
                  fontSize,
                  fontFamily,
                  lineHeight: fontSize * 1.3,
                  transform: [
                    { rotate: `${rotations[i % rotations.length]}deg` },
                    { translateY: verticalOffsets[i % verticalOffsets.length] },
                  ],
                },
                isSelected && styles.charSelected,
              ]}
            >
              {char}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Main DiaryBook component ─────────────────────────────────────────────────
export function DiaryBook({
  ownerName = 'Your',
  onPress,
  opening = false,
  theme = 'lilac',
  onLetterSelect,
  selectedLetterIndex,
  isTextMode = false,
  letters =[],
  placedStickers,
  onStickerPlace,
  isStickerMode,
  onStickerRemove
}: DiaryBookProps) {
  const { width: screenWidth, height:screenHeight } = useWindowDimensions();
  const BOOK_WIDTH = screenWidth * 0.28;
  const BOOK_HEIGHT = screenWidth * 0.26;
  const SPINE_WIDTH = screenWidth * 0.1;
  const isBlue = theme === 'blue';
  const coverBg = isBlue ? AppColors.blue : AppColors.lilac;
  const borderCol = AppColors.blue;
  const shadowCol = AppColors.blue;
  const spineCoilColor = isBlue ? '#a0b8e8' : '#3358b8';
  const textColor = isBlue ? AppColors.lilac : AppColors.blue;
  const firstWord = ownerName.split(' ')[0];   // e.g. "Noran's"
const secondWord = ownerName.split(' ')[1];  // e.g. "Diary"
// Add inside DiaryBook, before return:
const [selectedPlacedIndex, setSelectedPlacedIndex] = useState<number | null>(null);
console.log("isStickerMode inside DiaryBook:", isStickerMode);
if (!screenHeight || !screenWidth) return null; 

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={isStickerMode ? undefined : onPress}
      accessibilityLabel="Open your diary"
      style={[styles.wrapper ,  {
        width: BOOK_WIDTH,
        height: BOOK_HEIGHT,}]}
    >
      {/* Shadow layers */}
      <View style={[styles.shadowLayer3, { borderColor: shadowCol,     width: BOOK_WIDTH,
    height: BOOK_HEIGHT, }]} />
      <View style={[styles.shadowLayer2, { borderColor: shadowCol, backgroundColor: shadowCol, width: BOOK_WIDTH,
    height: BOOK_HEIGHT, }]} />

      {/* Book cover — no overflow hidden, spine sits on top */}
      <View style={[styles.book, { backgroundColor: coverBg, borderColor: borderCol,     width: BOOK_WIDTH,
    height: BOOK_HEIGHT, }]}>
        <View
        style={styles.cover}
        onStartShouldSetResponder={() => isStickerMode ?? false}
        onResponderGrant={(e) => {
            if (!isStickerMode) return;
            const { locationX, locationY } = e.nativeEvent;
            onStickerPlace?.(locationX, locationY);
        }}
        >
        {placedStickers?.map((s, i) => {
  const StickerComponent = STICKER_DEFS.find(d => d.id === s.id)?.component;
  if (!StickerComponent) return null;
  const isSelected = selectedPlacedIndex === i;

  return (
    <View key={i} style={[styles.sticker, { left: s.x, top: s.y }]}>
      <TouchableOpacity
        onPress={() => {
          if (isSelected) {
            setSelectedPlacedIndex(null);
          } else {
            setSelectedPlacedIndex(i);
          }
        }}
        activeOpacity={0.8}
      >
        <View style={isSelected && styles.stickerSelected}>
          <StickerComponent width={screenWidth * 0.05} height={screenWidth * 0.05} />
        </View>
      </TouchableOpacity>

      {/* Remove button — only shows when selected */}
      {isSelected && (
        <TouchableOpacity
          onPress={() => {
            onStickerRemove?.(i);
            setSelectedPlacedIndex(null);
          }}
          style={styles.removeBtn}
        >
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
})}
          <View style={[styles.sticker, { top: 8, left: 8 }]}><PixelFrog /></View>
          <View style={[styles.sticker, { top: 6, right: 6 }]}><PixelCherry /></View>
          <View style={[styles.sticker, { bottom: 18, left: SPINE_WIDTH + 8 }]}>
            <PixelStar color={textColor} />
          </View>
          <View style={[styles.sticker, { bottom: 24, left: SPINE_WIDTH + 34, opacity: 0.6 }]}>
            <PixelDot color={textColor} />
          </View>

          <View style={styles.titleBlock}>
            <PixelTitle
                text={firstWord}
                color={textColor}
                onLetterSelect={onLetterSelect}
                selectedLetterIndex={selectedLetterIndex}
                indexOffset={0}
                isTextMode={isTextMode}
                letters={letters}
            />
            <PixelTitle
                text={secondWord}
                color={textColor}
                onLetterSelect={onLetterSelect}
                selectedLetterIndex={selectedLetterIndex}
                indexOffset={firstWord.length}   // ← continues index from first word
                isTextMode={isTextMode}
                letters={letters}
            />
</View>

          {opening && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={AppColors.blue} />
            </View>
          )}
        </View>
      </View>

      {/* Spine overlaid on top-left of book */}
      <View style={[styles.spine, {height: BOOK_HEIGHT, paddingVertical: BOOK_HEIGHT * 0.05}]}>
        <Spiral />
      </View>
    </TouchableOpacity>
  );
}


const BORDER = 3;
const SHADOW_OFFSET = 12;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  shadowLayer2: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: BORDER,
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
  },
  shadowLayer3: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: BORDER,
    backgroundColor: 'transparent',
    top: SHADOW_OFFSET + 4,
    left: SHADOW_OFFSET + 4,
  },
  book: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: BORDER,
    overflow: 'hidden',   // safe now — spine is outside
  },
  spine: {
    position: 'absolute',
    left: -20,
    top: 0,
    width: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly',  // evenly distributes coils regardless of book size
    flexDirection: 'column',
    zIndex: 10,           // sits on top of book
  },
cover: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
    paddingRight: 8,   // balances the left padding so center is true
    padding: 12,
  },
  sticker: { position: 'absolute', zIndex: 10 },
  titleBlock: { alignItems: 'center', alignSelf :'center' ,zIndex: 1, pointerEvents: 'box-none' },
    row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  charSelected: {
  textDecorationLine: 'underline',
  opacity: 0.7,
},
  char: {
    fontFamily: AppFonts.title?.fontFamily,
    //fontSize: screenWidth * 0.05,
    //lineHeight: screenWidth * 0.065,
    marginHorizontal: 3,  // space between each character
    includeFontPadding: false,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerSelected: {
  borderWidth: 1.5,
  borderColor: AppColors.blue,
  borderStyle: 'dashed',
  borderRadius: 4,
  opacity: 0.8,
  padding: 8
},
removeBtn: {
  position: 'absolute',
  top: -8,
  right: -8,
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: AppColors.blue,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 20,
},
removeBtnText: {
  color: AppColors.lilac,
  fontSize: 8,
  fontWeight: '700',
  lineHeight: 10,
},
});