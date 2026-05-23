import Sticker1 from '@/assets/svgs/diary/stickers/Sticker.svg';
import Sticker2 from '@/assets/svgs/diary/stickers/sticker1.svg';
import Sticker3 from '@/assets/svgs/diary/stickers/sticker2.svg';
import Sticker4 from '@/assets/svgs/diary/stickers/sticker3.svg';
import Sticker5 from '@/assets/svgs/diary/stickers/sticker4.svg';
import Sticker6 from '@/assets/svgs/diary/stickers/sticker5.svg';
import Sticker7 from '@/assets/svgs/diary/stickers/sticker6.svg';
import Sticker8 from '@/assets/svgs/diary/stickers/sticker7.svg';

import MarkerIcon from '@/assets/svgs/diary/brush.svg';
import PenIcon from '@/assets/svgs/diary/marker.svg';
import StrokeLarge from '@/assets/svgs/diary/stroke_large.svg';
import StrokeSmall from '@/assets/svgs/diary/stroke_small.svg';

import { AppColors, AppFonts, AppFontSizes } from '@/constants/theme';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { DrawingOptions, StrokeColor, StrokeSize, StrokeType } from '../hooks/useDrawing';

const NAVY  = AppColors.blue;
const LILAC = AppColors.lilac;

export interface PlacedSticker { id: string; x: number; y: number; }

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

// 'clear' is a bookmark that only appears when drawing mode is active
export type BookmarkKey = 'face' | 'brush' | 'idk' | 'undo' | 'redo' | 'clear';

const BOOKMARK_LABELS: Record<BookmarkKey, string> = {
  face:  'stickers',
  brush: 'brush',
  idk:   'ideas',
  undo:  'undo',
  redo:  'redo',
  clear: 'clear all',
};

const COLOR_HEX: Record<StrokeColor, string> = {
  lilac: AppColors.lilac,
  blue:  '#003E8F',
};

export type ColorScheme = 'navy' | 'lilac';

interface BookmarkPopupProps {
  activeBookmark:    BookmarkKey;
  popupWidth:        number;
  drawingOptions:    DrawingOptions;
  onStrokeType:      (v: StrokeType)  => void;
  onStrokeSize:      (v: StrokeSize)  => void;
  onStrokeColor:     (v: StrokeColor) => void;
  selectedStickerId: string | null;
  onStickerSelected: (id: string) => void;
  onClose:           () => void;
  fillColor:         string | null; 
  onFillColorChange: (color: string | null) => void; 
}

export function BookmarkPopup({
  activeBookmark,
  popupWidth,
  drawingOptions,
  onStrokeType,
  onStrokeSize,
  onStrokeColor,
  selectedStickerId,
  onStickerSelected,
  onClose,
  fillColor,
  onFillColorChange,
}: BookmarkPopupProps) {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <View style={[shell.wrap, { width: popupWidth }]}>

      <View style={shell.body}>
        {activeBookmark === 'brush' && (
          <BrushContent
            options={drawingOptions}
            onStrokeType={onStrokeType}
            onStrokeSize={onStrokeSize}
            onStrokeColor={onStrokeColor}
            screenWidth={screenWidth}
          />
        )}
        {activeBookmark === 'face' && (
          <StickersContent
            selectedStickerId={selectedStickerId}
            onStickerSelected={onStickerSelected}
            screenWidth={screenWidth}
          />
        )}
        {activeBookmark === 'idk' && onFillColorChange && (
          <ColorSchemeContent 
            fillColor={fillColor}
            onFillColorChange={onFillColorChange}
          />
        )}
      </View>
    </View>
  );
}

const shell = StyleSheet.create({
  wrap: {
    backgroundColor: LILAC,
    borderWidth:     1.5,
    borderColor:     NAVY,
    borderRadius:    16,
  },
  body: { padding: 12 },
});

// ── Brush: toolbar + stroke preview only ─────────────────────────────────────
function BrushContent({ options, onStrokeType, onStrokeSize, onStrokeColor, screenWidth }: {
  options:       DrawingOptions;
  onStrokeType:  (v: StrokeType)  => void;
  onStrokeSize:  (v: StrokeSize)  => void;
  onStrokeColor: (v: StrokeColor) => void;
  screenWidth:   number;
}) {
  const BTN  = screenWidth * 0.035;
  const ICON = BTN * 0.65;
  const SW   = BTN * 0.35;

  return (
    <>
      <View style={brush.toolbar}>
        <ToolBtn active={options.strokeType === 'pen'}   size={BTN} onPress={() => onStrokeType('pen')}>
          <PenIcon width={ICON} height={ICON} />
        </ToolBtn>
        <ToolBtn active={options.strokeType === 'brush'} size={BTN} onPress={() => onStrokeType('brush')}>
          <MarkerIcon width={ICON} height={ICON} />
        </ToolBtn>

        <View style={brush.divider} />

        <ToolBtn active={options.strokeSize === 'small'} size={BTN} onPress={() => onStrokeSize('small')}>
          <StrokeSmall width={ICON} height={ICON} />
        </ToolBtn>
        <ToolBtn active={options.strokeSize === 'big'}   size={BTN} onPress={() => onStrokeSize('big')}>
          <StrokeLarge width={ICON} height={ICON} />
        </ToolBtn>

        <View style={brush.divider} />

        {(['blue', 'lilac'] as StrokeColor[]).map(id => (
          <ToolBtn key={id} active={options.strokeColor === id} size={BTN} onPress={() => onStrokeColor(id)}>
            <View style={[
              brush.swatch,
              {
                width:           SW,
                height:          SW,
                backgroundColor: COLOR_HEX[id],
                borderColor:     options.strokeColor === id ? LILAC : NAVY,
              },
            ]} />
          </ToolBtn>
        ))}
      </View>

      <View style={[
        brush.preview,
        {
          height:          options.strokeSize === 'big' ? 8 : 3,
          backgroundColor: COLOR_HEX[options.strokeColor],
          opacity:         options.strokeType === 'brush' ? 0.55 : 0.9,
          borderRadius:    options.strokeType === 'brush' ? 6 : 2,
        },
      ]} />
    </>
  );
}

const brush = StyleSheet.create({
  toolbar: { flexDirection: 'row', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', gap: 30, flexWrap: 'wrap' },
  divider: { width: 1.5, height: 28, backgroundColor: NAVY, opacity: 0.25, marginHorizontal: 2 },
  swatch:  { borderRadius: 3, borderWidth: 2 },
  preview: { marginHorizontal: 4, alignSelf: 'center' },
});

function ToolBtn({ active, size, onPress, children }: {
  active: boolean; size: number; onPress: () => void; children: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress} activeOpacity={0.75}
      style={[
        toolBtn.btn,
        { width: size, height: size, borderRadius: size * 0.27 },
        active && toolBtn.active,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

const toolBtn = StyleSheet.create({
  btn:    { borderWidth: 1, borderColor: NAVY, backgroundColor: LILAC, alignItems: 'center', justifyContent: 'center' },
  active: { borderColor: NAVY, borderWidth: 4 },
});

// ── Stickers ──────────────────────────────────────────────────────────────────
function StickersContent({ selectedStickerId, onStickerSelected, screenWidth }: {
  selectedStickerId: string | null;
  onStickerSelected: (id: string) => void;
  screenWidth:       number;
}) {
  const cellSize  = screenWidth * 0.048;
  const stickerSz = cellSize * 0.60;

  return (
    <>
      {/* pill-shaped scrollable strip — matches reference */}
      <View style={stickers.strip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={stickers.scrollContent}
        >
          {STICKER_DEFS.map(s => {
            const StickerComponent = s.component;
            const isSelected = selectedStickerId === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => onStickerSelected(s.id)}
                activeOpacity={0.75}
                style={[
                  stickers.cell,
                  { width: cellSize, height: cellSize, borderRadius: cellSize * 0.22 },
                  isSelected && stickers.cellActive,
                ]}
              >
                <StickerComponent width={stickerSz} height={stickerSz} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* scroll arrows — decorative, matching reference */}
        <View style={stickers.arrowWrap} pointerEvents="none">
          <Text style={stickers.arrow}>‹</Text>
          <Text style={stickers.arrow}>›</Text>
        </View>
      </View>

      {selectedStickerId && (
        <Text style={stickers.hint}>tap the diary page to place it</Text>
      )}
    </>
  );
}

const stickers = StyleSheet.create({
  strip: {
    //borderWidth:     2,
    //borderColor:     NAVY,
    borderRadius:    20,
    backgroundColor: LILAC,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    paddingRight:  24, // leave room so last sticker isn't behind arrows
  },
  cell: {
    borderWidth:     2,
    borderColor:     NAVY,
    backgroundColor: LILAC,
    alignItems:      'center',
    justifyContent:  'center',
    // shadow matches each cell in reference

  },
  cellActive: { borderWidth: 4, borderColor: NAVY },
  arrowWrap: {
    position:       'absolute',
    right:          6,
    top:            0,
    bottom:         0,
    flexDirection:  'row',
    alignItems:     'center',
    gap:            2,
  },
  arrow: {
    ...AppFonts.body,
    fontSize:  AppFontSizes.bodySmall,
    color:     NAVY,
    opacity:   0.6,
  },
  hint: {
    ...AppFonts.body,
    fontSize:  AppFontSizes.bodySmall,
    color:     NAVY,
    opacity:   0.6,
    textAlign: 'center',
    marginTop: 8,
  },
});

// In BookmarkPopup.tsx - Update ColorSchemeContent to work directly with colors
function ColorSchemeContent({ fillColor, onFillColorChange }: { 
  fillColor: string | null; 
  onFillColorChange: (color: string | null) => void;
}) {
  const NAVY_COLOR = AppColors.blue;
  const LILAC_COLOR = AppColors.lilac;
  
  // Determine which theme is active
  const isNavy = fillColor === NAVY_COLOR;
  const isLilac = fillColor === LILAC_COLOR;
  
  return (
    <View style={colorScheme.wrap}>
      <TouchableOpacity 
        style={colorScheme.optionRow} 
        onPress={() => onFillColorChange(NAVY_COLOR)}
        activeOpacity={0.7}
      >

          <View style={[colorScheme.colorPreview, { backgroundColor: NAVY_COLOR }]} />

      </TouchableOpacity>

      <TouchableOpacity 
        style={colorScheme.optionRow} 
        onPress={() => onFillColorChange(LILAC_COLOR)}
        activeOpacity={0.7}
      >

          <View style={[colorScheme.colorPreview, { backgroundColor: LILAC_COLOR }]} />

      </TouchableOpacity>
    
    </View>
  );
}

const colorScheme = StyleSheet.create({
  wrap: { 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    minWidth: 280,
    flexDirection: 'row',
    alignContent: 'center', 
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: LILAC,
    alignSelf: 'center',
    alignItems: 'center'
  },

  colorPreview: {
    width: 120,
    height: 120,
    borderRadius: 50,
    borderWidth: 2.5,
    borderColor: NAVY,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },

});