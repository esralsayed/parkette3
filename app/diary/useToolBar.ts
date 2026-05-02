import { useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import { DiaryCustomLetter, saveChangesCover } from '../repositories/Diary';
import { PlacedSticker } from './toolBarActions';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

////mapping for the texts
export const FONT_MAP: Record<FontFamily, string> = {
  'First':  'Game Paused DEMO',
  'Second': 'PixelPurl',
  'Third':  'yoster',
};

export const SIZE_MAP: Record<FontSize, number> = {
  48:  screenWidth * 0.045,   // Small
  64:  screenWidth * 0.055,   // Medium
  100: screenWidth * 0.065,   // Large
  150: screenWidth * 0.075,  // Huge
};

export type ActiveWindow = 'color' | 'text' | 'stickers' | 'undo' | null;
export type TextAlignment = 'left' | 'center' | 'right';
export type FontSize = 48 | 64 | 100 | 150;
export type FontFamily = 'First' | 'Second' | 'Third';
export type StrokeColor = 'lilac' | 'blue';

export function useDiaryToolbar(diaryId: string | null, initialTheme: 'blue' | 'lilac' = 'lilac',   initialStickers: PlacedSticker[] = []
) {
  const [activeWindow, setActiveWindow] = useState<ActiveWindow>(null);
  const [diaryTheme, setDiaryTheme] = useState<'lilac' | 'blue'>(initialTheme);
  const [letters, setLetters] = useState<DiaryCustomLetter[]>([]);
  const [selectedLetterIndex, setSelectedLetterIndex] = useState<number | null>(null);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  useEffect(() => {
    setDiaryTheme(initialTheme);
  }, [initialTheme]);

    useEffect(() => {
    if (initialStickers.length > 0) {
      setPlacedStickers(initialStickers);
    }
  }, [initialStickers]);

  // ── Save handlers ──────────────────────────────────────────
const saveColor = async () => {
  if (!diaryId) return;
  try {
    await saveChangesCover(diaryId, { 
      theme: pendingTheme.current,
      diaryTitle: { letters: pendingLetters.current }
    });
  } catch (err) {
    console.error('Failed to save color:', err);
  }
};
  const saveText = async () => {
    if (!diaryId) return;
    try {
    console.log('saving letters:', JSON.stringify(letters));

      await saveChangesCover(diaryId, { diaryTitle: { letters } });
    } catch (err) {
      console.error('Failed to save text:', err);
    }
  };
  const saveStickers = async () => {
  if (!diaryId) return;
  try {
    await saveChangesCover(diaryId, { stickers: placedStickers });
  } catch (err) {
    console.error('Failed to save stickers:', err);
  }
};

  // ── Close window — handles all cases ──────────────────────
  const closeWindow = async (type: ActiveWindow) => {
    switch (type) {
      case 'color':
        await saveColor();
        break;
      case 'text':
        await saveText();
        break;
      case 'stickers':
        await saveStickers();
        break;
      default:
        break;
    }
    setSelectedLetterIndex(null); // reset letter selection on close
    setActiveWindow(null);
  };

  // ── Action handlers ────────────────────────────────────────
  const handleColor = () => setActiveWindow('color');
  const handleText = () => setActiveWindow('text');
  const handleStickers = () => {
    setActiveWindow('stickers');
  };
  const handleUndo = () => closeWindow('undo');

const pendingTheme = useRef<'lilac' | 'blue'>(initialTheme);
const pendingLetters = useRef<DiaryCustomLetter[]>([]);

const handleColorPicked = (color: 'lilac' | 'blue') => {
  const oldDefault = color === 'blue' ? '#003E8F' : '#E7E1FF';
  const newDefault = color === 'blue' ? '#E7E1FF' : '#003E8F';

  const updatedLetters = letters.map(l => ({
    ...l,
    style: {
      ...l.style,
      color: l.style.color === oldDefault ? newDefault : l.style.color,
    }
  }));

  setDiaryTheme(color);
  setLetters(updatedLetters);
  pendingTheme.current = color;         // ← store for save
  pendingLetters.current = updatedLetters; // ← store for save
};

  // ── Letter selection — open window first, then pick letter ─
  const handleLetterSelect = (index: number) => {
    if (activeWindow === 'text') {
      // only select if text window is already open
      setSelectedLetterIndex(index);
    }
  };

  // ── Letter style updates ───────────────────────────────────
  const updateLetterStyle = (updates: Partial<DiaryCustomLetter['style']>) => {
      console.log('1. selectedLetterIndex:', selectedLetterIndex);
  console.log('2. updates:', updates);
    if (selectedLetterIndex === null) return;
    const updated = letters.map((l, i) =>
      i === selectedLetterIndex
        ? { ...l, style: { ...l.style, ...updates } }
        : l
    );
    setLetters(updated);
  };

const setFontFamily = (fontFamily: FontFamily) =>
  updateLetterStyle({ fontFamily: FONT_MAP[fontFamily] });
const setFontSize = (fontSize: FontSize) =>
  updateLetterStyle({ fontSize: SIZE_MAP[fontSize] });
  const setAlignment = (alignment: TextAlignment) => updateLetterStyle({ alignment });
  const setLetterColor = (color: string) => updateLetterStyle({ color });

  const selectedLetter = selectedLetterIndex !== null ? letters[selectedLetterIndex] : null;

  //stickersss
  const handleStickerSelected = (id: string) => {
  setSelectedStickerId(id);
};

const handleStickerPlaced = (x: number, y: number) => {
  if (!selectedStickerId) return;
  setPlacedStickers(prev => [...prev, {
    id: selectedStickerId,
    x,
    y,
  }]);
  setSelectedStickerId(null); // reset after placing
};

const handleStickerRemove = async (index: number) => {
  if (!diaryId) return;

  setPlacedStickers(prev => {
    const updated = prev.filter((_, i) => i !== index);

    saveChangesCover(diaryId, { stickers: updated })
      .catch(err => console.error('Failed to save stickers:', err));

    return updated;
  });
};

  return {
    activeWindow,
    closeWindow,
    diaryTheme,
    letters,
    setLetters,           // call this in DiaryLandingPage when diary loads
    selectedLetter,
    selectedLetterIndex,
    handleLetterSelect,
    handleColor,
    handleText,
    handleStickers,
    handleUndo,
    handleColorPicked,
    setFontFamily,
    setFontSize,
    setAlignment,
    setLetterColor,
      placedStickers,
  selectedStickerId,
  handleStickerSelected,
  handleStickerPlaced,
  handleStickerRemove
  };
}