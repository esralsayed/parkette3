import Settings from "@/assets/svgs/diary/Settings.svg";
import Brush from "@/assets/svgs/diary/brush.svg";
import ClearIcon from "@/assets/svgs/diary/clear.svg";
import Face from "@/assets/svgs/diary/face.svg";
import Heart from "@/assets/svgs/diary/heart.svg";
import HeartFill from "@/assets/svgs/diary/heartfull.svg";
import IDK from "@/assets/svgs/diary/idk.svg";
import Missed from "@/assets/svgs/diary/missed.svg";
import Redo from "@/assets/svgs/diary/redo.svg";
import Spine2 from "@/assets/svgs/diary/spine2.svg";
import Undo from "@/assets/svgs/diary/undo.svg";
import { Animated } from 'react-native';

import { AppColors, AppFonts, AppFontSizes } from "@/constants/theme";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import Svg, { ClipPath, Defs, Line, Path, Rect } from 'react-native-svg';
import { useDrawing } from '../hooks/useDrawing';
import { usePage } from '../hooks/usePage';
import { DiaryStats, FavoriteEntry, getDiaryStats, getFavouriteEntries } from "../repository/Diary";
import { BookmarkKey, BookmarkPopup } from './BookmarkPopup';
import { DrawingCanvas } from './DrawingCanvas';
import { PlacedStickersLayer } from './PlacedStickersLayer';

// ─── Sizes ────────────────────────────────────────────────────────────────────
const SHADOW_X       = 6;
const SHADOW_Y       = 6;
const BOOKMARK_W     = 28;
const BOOKMARK_H     = 44;

// ─── Design tokens ────────────────────────────────────────────────────────────
const BORDER_W       = 4;
const CORNER_R       = 14;
const FONT_SIZE      = 13;
const LINE_COUNT     = 9;


interface DiarySpreadProps {
  diaryId: string | null;
}

// ─── Main Spread ──────────────────────────────────────────────────────────────
export function DiarySpread({ diaryId }: DiarySpreadProps) {
  const {
    lines, setLines, updateLine, saveNow,
    isSaving, loadEntryForDate, isFavourite, toggleFavorite,
    goToPrevDay, goToNextDay, canGoNext, currentDate,
    saveDrawing, initialDrawing,
    stickers, addSticker, removeSticker, updateStickerPosition,
    fillColor, updateFillColor,
  } = usePage({ diaryId });

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const SPREAD_WIDTH   = screenWidth * 0.82;
  const SPREAD_HEIGHT  = screenHeight * 0.52;
  const SPINE_W        = screenWidth * 0.055;
  const PAGE_GAP       = screenWidth * 0.03;
  const PAGE_W         = (SPREAD_WIDTH - PAGE_GAP) / 2;
  const PAGE_H         = SPREAD_HEIGHT;
  const TOTAL_LINES    = LINE_COUNT * 2;
  const HEADER_H       = PAGE_H * 0.18;
  const LINE_PADDING_V = PAGE_H * 0.06;
  const LINE_SPACING   = (PAGE_H - HEADER_H - LINE_PADDING_V) / (LINE_COUNT - 1);
  const INPUT_H        = LINE_SPACING;
  const CONTENT_PAD_X  = 14;
  const INPUT_W        = PAGE_W - CONTENT_PAD_X * 2 - BORDER_W;
  const DAY_LINE_W     = PAGE_W * 0.38;
  const DATE_LINE_W    = PAGE_W * 0.32;
  const HEADER_LINE_Y1 = PAGE_H * 0.10;
  const HEADER_LINE_Y2 = PAGE_H * 0.16;

  const [view, setView] = useState<'entry' | 'settings'>('entry');
  const [activeBookmark, setActiveBookmark] = useState<BookmarkKey | null>(null);
  const [stats, setStats] = useState<DiaryStats>({ totalDays: 0, missedDays: 0, favoriteDates: [] });
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteEntries, setFavoriteEntries] = useState<FavoriteEntry[]>([]);
  const [popupAnimation] = useState(new Animated.Value(0));

  if (!screenHeight || !screenWidth) return null;

  // ── Drawing hook ────────────────────────────────────────────────────────────
  const drawing = useDrawing(saveDrawing);

  // ── Sticker selection (which sticker type is pending placement) ───────────
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const STICKER_SIZE = PAGE_W * 0.18;

  // Hydrate strokes from DB when entry loads
  useEffect(() => {
    if (initialDrawing) drawing.setStrokes(initialDrawing);
  }, [initialDrawing]);

  // choose colors
const getThemeColors = useCallback(() => {
  // Check if fillColor matches navy (AppColors.blue)
  if (fillColor !== AppColors.blue) {
    return {
      primary: AppColors.blue,
      secondary: AppColors.lilac,
      text: AppColors.blue,
    };
  } else {
    // Default to lilac theme (including when fillColor is null)
    return {
      primary: AppColors.lilac,
      secondary: AppColors.blue,
      text: AppColors.lilac,
    };
  }
}, [fillColor]);

const NAVY = getThemeColors().primary;
const PAGE_BG = getThemeColors().secondary;
const SHADOW_BG = getThemeColors().primary;
const LINE_COLOR = getThemeColors().primary;

  // ── Undo/Redo bookmarks delegate to drawing ─────────────────────────────────
  //    (the bookmark press handler below picks these up)

  useEffect(() => {
    if (!diaryId) return;
    getDiaryStats(diaryId).then(setStats).catch(console.error);
  }, [diaryId]);

  useEffect(() => {
  if (activeBookmark && activeBookmark !== 'clear' && activeBookmark !== 'undo' && activeBookmark !== 'redo') {
    Animated.spring(popupAnimation, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  } else {
    Animated.timing(popupAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
}, [activeBookmark]);

const handleBookmarkPress = useCallback((key: BookmarkKey) => {
  if (key === 'undo') {
    drawing.undo();
    return; // undo fires immediately, no popup needed
  }
  if (key === 'redo') {
    // wire drawing.redo() here when implemented
    return;
  }
  if (key === 'clear') {
    drawing.clear();
    return; // clear fires immediately, no popup needed
  }
  if (key === 'brush') {
    drawing.toggleDrawingMode();
    // drawingMode hasn't updated yet (it's the value before the toggle),
    // so if it was OFF we're turning ON → open popup; if ON → turning OFF → close
    if (!drawing.drawingMode) {
      setActiveBookmark('brush');
    } else {
      setActiveBookmark(null);
    }
    return;
  }
  // all other bookmarks: toggle popup open/closed
  setActiveBookmark(prev => prev === key ? null : key);
  if (key !== 'face') setSelectedStickerId(null);
}, [drawing]);

  const inputRefs = useRef<(TextInput | null)[]>(Array(TOTAL_LINES).fill(null));

  const handleContentSizeChange = useCallback(
    (width: number, index: number) => {
      if (width <= INPUT_W) return;
      if (index >= TOTAL_LINES - 1) return;
      setLines(prev => {
        const next = [...prev];
        const current = next[index];
        const spaceIdx = current.lastIndexOf(' ');
        const keep  = spaceIdx > 0 ? current.slice(0, spaceIdx)  : current.slice(0, -1);
        const spill = spaceIdx > 0 ? current.slice(spaceIdx + 1) : current.slice(-1);
        next[index]     = keep;
        next[index + 1] = spill + next[index + 1];
        return next;
      });
      setTimeout(() => { inputRefs.current[index + 1]?.focus(); }, 0);
    },
    [setLines]
  );

  // ─── Bookmark shape ───────────────────────────────────────────────────────

  const Bookmark = ({ icon, bookmarkKey, onPress }: {
    icon: React.ReactNode;
    bookmarkKey: BookmarkKey;
    onPress: (key: BookmarkKey) => void;
  }) => {
    const [isPressed, setIsPressed] = useState(false);
    
    // Determine if this bookmark should show as active
const isActive =
  (bookmarkKey === 'brush' && drawing.drawingMode) ||
  (bookmarkKey !== 'brush' && activeBookmark === bookmarkKey);

    const handlePressIn = () => {
      setIsPressed(true);
    };

    const handlePressOut = () => {
      setIsPressed(false);
    };

    return (
      <TouchableOpacity 
        onPress={() => onPress(bookmarkKey)} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View style={[
          bookmarkStyles.cell,
          isActive && bookmarkStyles.cellActive,
          isPressed && bookmarkStyles.cellActive,
        ]}>
          {icon}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const bookmarkStyles = StyleSheet.create({
  cell: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: AppColors.blue,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.lilac,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cellActive: {
    borderWidth: 4, // Slightly thicker border when pressed
    borderColor: AppColors.blue,
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 1, height: 1 },
    elevation: 2,
  },
  });

  // ─── Shadow SVGs ──────────────────────────────────────────────────────────
  const ShadowLeftSVG = () => (
    <Svg width={PAGE_W} height={PAGE_H} viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}>
      <Rect x={BORDER_W/2} y={BORDER_W/2}
        width={PAGE_W - BORDER_W/2} height={PAGE_H - BORDER_W}
        rx={CORNER_R} ry={CORNER_R} fill={SHADOW_BG} />
    </Svg>
  );

  const ShadowRightSVG = () => (
    <Svg width={PAGE_W} height={PAGE_H} viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}>
      <Rect x={0} y={BORDER_W/2}
        width={PAGE_W - BORDER_W/2} height={PAGE_H - BORDER_W}
        rx={CORNER_R} ry={CORNER_R} fill={SHADOW_BG} />
    </Svg>
  );

  // ─── Normal page SVGs ─────────────────────────────────────────────────────
  const LeftPageSVG = () => {
    const w = PAGE_W, h = PAGE_H, r = CORNER_R;
    const lines = Array.from({ length: LINE_COUNT }, (_, i) => HEADER_H + i * LINE_SPACING);
    return (
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Defs><ClipPath id="lc"><Rect x={0} y={0} width={w} height={h} rx={r} ry={r} /></ClipPath></Defs>
        <Rect x={BORDER_W/2} y={BORDER_W/2} width={w - BORDER_W/2} height={h - BORDER_W}
          rx={r} ry={r} fill={PAGE_BG} stroke={NAVY} strokeWidth={BORDER_W} />
        <Line x1={12} y1={HEADER_LINE_Y1} x2={12 + DAY_LINE_W} y2={HEADER_LINE_Y1}
          stroke={NAVY} strokeWidth={1.5} opacity={0.5} />
        <Line x1={w - 12 - DATE_LINE_W} y1={HEADER_LINE_Y2} x2={w - 12} y2={HEADER_LINE_Y2}
          stroke={NAVY} strokeWidth={1.5} opacity={0.5} />
        {lines.map((y, i) => (
          <Line key={i} x1={12} y1={y} x2={w - 6} y2={y}
            stroke={LINE_COLOR} strokeWidth={1.2} opacity={0.7} />
        ))}
      </Svg>
    );
  };

  const RightPageSVG = ({ showLines = true }: { showLines?: boolean }) => {
    const w = PAGE_W, h = PAGE_H, r = CORNER_R;
    const lines = Array.from({ length: LINE_COUNT }, (_, i) => HEADER_H + i * LINE_SPACING);
    return (
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Rect x={0} y={BORDER_W/2} width={w - BORDER_W/2} height={h - BORDER_W}
          rx={r} ry={r} fill={PAGE_BG} stroke={NAVY} strokeWidth={BORDER_W} />
        {showLines && (
          <>
            <Line x1={12} y1={HEADER_LINE_Y1} x2={12 + DAY_LINE_W} y2={HEADER_LINE_Y1}
              stroke={NAVY} strokeWidth={1.5} opacity={0.5} />
            <Line x1={w - 12 - DATE_LINE_W} y1={HEADER_LINE_Y2} x2={w - 12} y2={HEADER_LINE_Y2}
              stroke={NAVY} strokeWidth={1.5} opacity={0.5} />
            {lines.map((y, i) => (
              <Line key={i} x1={6} y1={y} x2={w - 12} y2={y}
                stroke={LINE_COLOR} strokeWidth={1.2} opacity={0.7} />
            ))}
          </>
        )}
      </Svg>
    );
  };

  // ─── Page Header ──────────────────────────────────────────────────────────
  const PageHeader = ({ date }: { date: Date }) => (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <Text style={headerStyles.day}>
        {date.toLocaleDateString('en-US', { weekday: 'long' })}
      </Text>
      <Text style={headerStyles.date}>
        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </Text>
    </View>
  );

  const headerStyles = StyleSheet.create({
    day: {
      ...AppFonts.body,
      position: 'absolute',
      left: 12 + CONTENT_PAD_X,
      top: HEADER_LINE_Y1 - AppFontSizes.body,
      fontSize: AppFontSizes.body,
      color: NAVY,
      opacity: 0.8,
    },
    date: {
      ...AppFonts.body,
      position: 'absolute',
      right: 12 + CONTENT_PAD_X,
      top: HEADER_LINE_Y2 - AppFontSizes.body,
      fontSize: AppFontSizes.body,
      color: NAVY,
      opacity: 0.8,
      textAlign: 'right',
    },
  });

  // ─── Settings SVGs ────────────────────────────────────────────────────────
  const SettingsLeftSVG = () => {
    const w = PAGE_W, h = PAGE_H, r = CORNER_R;
    return (
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Rect x={0} y={BORDER_W/2} width={w - BORDER_W/2} height={h - BORDER_W}
          rx={r} ry={r} fill={PAGE_BG} stroke={NAVY} strokeWidth={BORDER_W} />
      </Svg>
    );
  };

  const SettingsRightSVG = () => {
    const w = PAGE_W, h = PAGE_H, r = CORNER_R;
    return (
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Rect x={0} y={BORDER_W/2} width={w - BORDER_W/2} height={h - BORDER_W}
          rx={r} ry={r} fill={PAGE_BG} stroke={NAVY} strokeWidth={BORDER_W} />
      </Svg>
    );
  };

  // ─── Heart icon ───────────────────────────────────────────────────────────
  const HeartIcon = ({ filled, onPress }: { filled: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={1}>
      {filled ? <HeartFill /> : <Heart width={35} height={35} /> }
    </TouchableOpacity>
  );

  // ─── Nav arrow ────────────────────────────────────────────────────────────
  const NavArrow = ({
    direction, onPress, disabled,
  }: { direction: 'left' | 'right'; onPress: () => void; disabled?: boolean }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7}
      style={[disabled && navStyles.disabled]}>
      <Svg width={40} height={40} viewBox="0 0 32 32">
        {direction === 'left' ? (
          <Path d="M19 9L12 16L19 23" fill="none" stroke={NAVY}
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <Path d="M13 9L20 16L13 23" fill="none" stroke={NAVY}
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        )}
      </Svg>
    </TouchableOpacity>
  );

  const navStyles = StyleSheet.create({
    btn: {},
    disabled: { opacity: 0.3 },
  });

  // ─── Settings content ─────────────────────────────────────────────────────
  const SettingsContent = ({
    totalEntries = 0, missedDays = 0, totalDays = 0,
    favoriteDates = [], onFavoritePress,
  }: {
    totalEntries?: number; missedDays?: number; totalDays?: number;
    favoriteDates?: string[]; onFavoritePress?: () => void;
  }) => (
    <View style={settingsStyles.wrap}>
      <Text style={settingsStyles.title}>My Diary Stats</Text>
      <View style={settingsStyles.row}>
        <Face />
        <Text style={settingsStyles.label}>Total Entries:</Text>
        <Text style={settingsStyles.value}>{totalEntries}</Text>
      </View>
      <View style={settingsStyles.row}>
        <Missed />
        <Text style={settingsStyles.label}>Missed Days:</Text>
        <Text style={settingsStyles.value}>{missedDays}/{totalDays}</Text>
      </View>
      <TouchableOpacity style={settingsStyles.row} onPress={onFavoritePress} activeOpacity={0.7}>
        <HeartFill />
        <Text style={settingsStyles.label}>Favorite days:</Text>
        <Text style={settingsStyles.value}>{favoriteDates.length} →</Text>
      </TouchableOpacity>
    </View>
  );

  const settingsStyles = StyleSheet.create({
    wrap: { flex: 1, padding: 18, justifyContent: 'center' },
    title: { ...AppFonts.subhead, fontSize: AppFontSizes.body, color: NAVY, marginBottom: 20 },
    row: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 14,
      borderBottomWidth: 1, borderBottomColor: NAVY, paddingBottom: 8, opacity: 0.9,
    },
    label: { ...AppFonts.body, fontSize: AppFontSizes.body, color: NAVY },
    value: { ...AppFonts.body, fontSize: AppFontSizes.body, fontWeight: '700', color: NAVY },
  });

  const FavoritesRightPage = ({ favoriteEntries }: { favoriteEntries: FavoriteEntry[] }) => (
    <View style={favStyles.wrap}>
      <Text style={favStyles.title}>My favorite days</Text>
      {favoriteEntries.length === 0 ? (
        <Text style={favStyles.empty}>no favorites yet 🤍</Text>
      ) : (
        favoriteEntries.map((e, i) => {
          const firstLine = e.content?.leftPage?.find((l: string) => l.trim() !== '') ?? '';
          return (
            <View key={i} style={favStyles.row}>
              <Text style={favStyles.snippet} numberOfLines={1} ellipsizeMode="tail">
                {firstLine || '...'}
              </Text>
              <Text style={favStyles.date}>
                {new Date(e.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );

  const favStyles = StyleSheet.create({
    wrap: { flex: 1, padding: 18, paddingTop: 24 },
    title: { ...AppFonts.subhead, fontSize: AppFontSizes.body, color: NAVY, marginBottom: 16 },
    empty: { ...AppFonts.body, fontSize: AppFontSizes.bodySmall, color: `${NAVY}88`, fontStyle: 'italic' },
    row: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 10, borderBottomWidth: 1, borderBottomColor: `${NAVY}22`, paddingBottom: 6, gap: 8,
    },
    snippet: { ...AppFonts.body, fontSize: AppFontSizes.bodySmall, color: NAVY, opacity: 0.85, flex: 1 },
    date: { ...AppFonts.body, fontSize: AppFontSizes.bodySmall, color: NAVY, opacity: 0.5 },
  });

  // ─── Input rendering ──────────────────────────────────────────────────────
  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && lines[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }, [lines]
  );

  const focusFirstEmptyOnPage = useCallback(
    (pageIndex: 0 | 1) => {
      const start = pageIndex * LINE_COUNT;
      const end   = start + LINE_COUNT;
      for (let i = start; i < end; i++) {
        if (lines[i] === '') { inputRefs.current[i]?.focus(); return; }
      }
      inputRefs.current[end - 1]?.focus();
    }, [lines]
  );

  const renderInputs = (pageOffset: 0 | 1) =>
    Array.from({ length: LINE_COUNT }, (_, i) => {
      const globalIndex = pageOffset * LINE_COUNT + i;
      const topOffset   = HEADER_H + i * LINE_SPACING - INPUT_H * 0.75;
      return (
        <TextInput
          key={globalIndex}
          ref={el => { inputRefs.current[globalIndex] = el; }}
          value={lines[globalIndex]}
          onChangeText={text => updateLine(text, globalIndex)}
          onContentSizeChange={e =>
            handleContentSizeChange(e.nativeEvent.contentSize.width, globalIndex)
          }
          onKeyPress={e => handleKeyPress(e, globalIndex)}
          onSubmitEditing={() => {
            if (globalIndex < TOTAL_LINES - 1) inputRefs.current[globalIndex + 1]?.focus();
          }}
          blurOnSubmit={false}
          returnKeyType={globalIndex < TOTAL_LINES - 1 ? 'next' : 'done'}
          style={[styles.lineInput, { top: topOffset, width: INPUT_W, height: INPUT_H, color: NAVY }]}
          multiline={false}
          scrollEnabled={false}
          underlineColorAndroid="transparent"
          caretHidden={false}
          // Disable text input while drawing so gestures go to canvas
          editable={!drawing.drawingMode}
          pointerEvents={drawing.drawingMode ? 'none' : 'auto'}
        />
      );
    });

  const isSettings = view === 'settings';

  // ─── Live stroke points for preview ──────────────────────────────────────
  const livePoints = drawing.currentStroke.current?.points ?? [];

  return (
    <View style={styles.outerWrapper}>

      {/* ── Navigation row ── */}
      <View style={[styles.navRow, { width: SPREAD_WIDTH }]}>
        <View style={styles.navCell}>
          <NavArrow direction="left" onPress={goToPrevDay} />
        </View>
        <Text style={[styles.navDateText , { color: NAVY }]}>
          {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
        <View style={styles.navRight}>
          {canGoNext ? (
            <NavArrow direction="right" onPress={goToNextDay} />
          ) : (
            <Text style={[styles.tomorrowText, { color: NAVY }]}>come back tomorrow ✨</Text>
          )}
        </View>
      </View>

      <View style={styles.spreadRow}>

        {/* ── Left bookmarks ── */}
        <View style={styles.leftBookmarks}>
          <TouchableOpacity onPress={() => router.push('/diary/Diary')}>
            <View style={styles.cell}>
              <Text style={styles.ExitIcon}>X</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setView(v => {
              const next = v === 'settings' ? 'entry' : 'settings';
              if (next === 'settings' && diaryId) {
                setShowFavorites(false);
                getFavouriteEntries(diaryId).then(setFavoriteEntries).catch(console.error);
              }
              return next;
            });
          }}>
            <View style={styles.cell}>
              <Settings style={styles.settingsIcon} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.spread, { width: SPREAD_WIDTH, height: PAGE_H }]}>

          {/* ── Shadows ── */}
          <View style={[styles.shadowLeft, { width: PAGE_W, height: PAGE_H }]} pointerEvents="none">
            <ShadowLeftSVG />
          </View>
          <View style={[styles.shadowRight, {
            width: PAGE_W, height: PAGE_H,
            left: PAGE_W + PAGE_GAP - SHADOW_X, top: SHADOW_Y,
          }]} pointerEvents="none">
            <ShadowRightSVG />
          </View>

          {/* ── Left Page ── */}
          <View
            style={[styles.leftPageContainer, { width: PAGE_W, height: PAGE_H, marginRight: PAGE_GAP / 2 }]}
            onStartShouldSetResponder={() => {
              if (!isSettings) focusFirstEmptyOnPage(0);
              return false;
            }}
          >
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              {!isSettings && <PageHeader date={currentDate} />}
              {isSettings ? <SettingsLeftSVG /> : <LeftPageSVG />}
            </View>

            {isSettings ? (
              <SettingsContent
                totalEntries={stats.totalDays - stats.missedDays}
                missedDays={stats.missedDays}
                totalDays={stats.totalDays}
                favoriteDates={stats.favoriteDates}
                onFavoritePress={() => setShowFavorites(true)}
              />
            ) : (
              <View style={[styles.inputLayer, { top: 0, left: CONTENT_PAD_X, right: CONTENT_PAD_X, bottom: 0 }, 
                { zIndex: selectedStickerId ? 0 : 20 } 
              ]}>
                {renderInputs(0)}
              </View>
            )}

            {/* Stickers on left page */}
            {!isSettings && (
            <View pointerEvents='box-none'>
              <PlacedStickersLayer
                stickers={stickers.filter(s => s.page === "left")}
                page="left"
                selectedStickerId={selectedStickerId}
                onPlace={s => { addSticker(s); setSelectedStickerId(null); }}
                onMove={updateStickerPosition}
                onRemove={removeSticker}
                pageWidth={PAGE_W}
                pageHeight={PAGE_H}
                stickerSize={STICKER_SIZE}
                disabled={drawing.drawingMode}
              />
            </View>
            )}

            {!isSettings && (
              <View style={styles.heartLeft}>
                <View style={styles.cell}>
                  <HeartIcon filled={isFavourite} onPress={toggleFavorite} />
                </View>
              </View>
            )}
          </View>

          {/* ── Right Page ── */}
          <View
            style={[styles.rightPageContainer, { width: PAGE_W, height: PAGE_H, marginLeft: PAGE_GAP / 2 }]}
            onStartShouldSetResponder={() => {
              if (drawing.drawingMode) return false;
              if (!isSettings) focusFirstEmptyOnPage(1);
              return false;
            }}
          >
            {/* Page background SVG */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              {!isSettings && <PageHeader date={currentDate} />}
              {isSettings
                ? <SettingsRightSVG />
                : <RightPageSVG showLines={!drawing.drawingMode} />
              }
            </View>

            {!isSettings && (
              <>
                {/* Canvas — always mounted so strokes persist */}
                <DrawingCanvas
                  width={PAGE_W}
                  height={PAGE_H}
                  strokes={drawing.strokes}
                  livePoints={livePoints}
                  currentOptions={drawing.options}
                  drawingMode={drawing.drawingMode}
                  onTouchStart={drawing.onTouchStart}
                  onTouchMove={drawing.onTouchMove}
                  onTouchEnd={drawing.onTouchEnd}
                />

                {/* Stickers — always visible, disabled during drawing */}
                <View pointerEvents={drawing.drawingMode ? 'none' : 'box-none'}>
                <PlacedStickersLayer
                  stickers={stickers.filter(s => s.page === "right")}
                  page="right"
                  selectedStickerId={selectedStickerId}
                  onPlace={s => { addSticker(s); setSelectedStickerId(null); }}
                  onMove={updateStickerPosition}
                  onRemove={removeSticker}
                  pageWidth={PAGE_W}
                  pageHeight={PAGE_H}
                  stickerSize={STICKER_SIZE}
                  disabled={drawing.drawingMode}
                />
                </View>

                {/* Text inputs — only when not drawing */}
                {!drawing.drawingMode && (
                  <View style={[styles.inputLayer, { top: 0, left: CONTENT_PAD_X, right: CONTENT_PAD_X, bottom: 0 },
                    { zIndex: selectedStickerId ? 0 : 20 }
                  ]}>
                    {renderInputs(1)}
                  </View>
                )}

                {/* Heart */}
                <View style={styles.heartRight}>
                  <View style={styles.cell}>
                    <HeartIcon filled={isFavourite} onPress={toggleFavorite} />
                  </View>
                </View>
              </>
            )}

            {isSettings && showFavorites && (
              <FavoritesRightPage favoriteEntries={favoriteEntries} />
            )}
          </View>

          {/* ── Spine ── */}
          <View style={[styles.spine, {
            left: PAGE_W + PAGE_GAP / 2 - SPINE_W / 2,
            width: SPINE_W, height: PAGE_H,
          }]}>
            <Spine2 width={SPINE_W} height={PAGE_H} />
          </View>
        </View>

        {/* ── Right bookmarks ── */}
        <View style={styles.rightBookmarks}>
          <Bookmark icon={<Face />}  bookmarkKey="face"  onPress={handleBookmarkPress} />
          {/* Brush bookmark — highlights when drawing mode is on */}
          <Bookmark icon={<Brush />} bookmarkKey="brush" onPress={handleBookmarkPress} />
          <Bookmark icon={<IDK />}   bookmarkKey="idk"   onPress={handleBookmarkPress} />
          <Bookmark icon={<Undo />}  bookmarkKey="undo"  onPress={handleBookmarkPress} />
          <Bookmark icon={<Redo />}  bookmarkKey="redo"  onPress={handleBookmarkPress} />
          {/* Clear bookmark — only visible in drawing mode */}
          {drawing.drawingMode && (
            <Bookmark icon={<ClearIcon />} bookmarkKey="clear" onPress={handleBookmarkPress} />
          )}
        </View>

          
      </View>
      {activeBookmark && activeBookmark !== 'clear' && activeBookmark !== 'undo' && activeBookmark !== 'redo' && (
        <Animated.View 
          style={[
            styles.popupOverlay,
            {
              opacity: popupAnimation,
              transform: [{
                translateY: popupAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0]  // Slides down from -30 to 0
                })
              }]
            }
          ]}
        >
          <BookmarkPopup
            activeBookmark={activeBookmark}
            popupWidth={800} // Use SPREAD_WIDTH instead of fixed 800
            drawingOptions={drawing.options}
            onStrokeType={drawing.setStrokeType}
            onStrokeSize={drawing.setStrokeSize}
            onStrokeColor={drawing.setStrokeColor}
            selectedStickerId={selectedStickerId}
            onStickerSelected={id => setSelectedStickerId(prev => prev === id ? null : id)}
            onClose={() => {
              if (activeBookmark === 'brush' && drawing.drawingMode) {
                drawing.toggleDrawingMode();
              }
              setActiveBookmark(null);
              setSelectedStickerId(null);
            }}
            fillColor={fillColor}
            onFillColorChange={updateFillColor}
          />
        </Animated.View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerWrapper: {
    justifyContent: 'center',
    alignSelf: 'center',
    paddingBottom: SHADOW_Y,
    paddingLeft: SHADOW_X,
  },
 popupOverlay: {
   alignSelf: 'center',
  marginTop: 40,
   zIndex: 1000,
 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  navCell: {
    width: 40, height: 40,
    borderWidth: 1.5, borderColor: AppColors.blue,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: AppColors.lilac,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  navCenter: { flex: 1, alignItems: 'center' },
  navRight: { alignItems: 'flex-end' },
  navDateText: {
    flex: 1, textAlign: 'center', fontSize: 12,
    fontWeight: '600', opacity: 0.8,
  },
  tomorrowText: { fontSize: 11, fontStyle: 'italic' },

  spreadRow: { flexDirection: 'row', alignItems: 'flex-start' },
  leftBookmarks: { marginRight: 4, marginTop: 10, gap: 6 },
  rightBookmarks: { marginLeft: 4, marginTop: 10, gap: 6 },
  cell: {
    flex: 1, aspectRatio: 1,
    borderWidth: 1.5, borderColor: AppColors.blue,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: AppColors.lilac, padding: 4,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 6, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  settingsIcon: { padding: 10 },
  ExitIcon: {...AppFonts.body, fontSize: AppFontSizes.title,color:AppColors.blue},
  spread: { flexDirection: 'row', alignSelf: 'center' },

  leftPageContainer:  { overflow: 'hidden', zIndex: 2 },
  rightPageContainer: { overflow: 'hidden', zIndex: 2 },

  popup: {
    alignSelf: 'center', marginTop: 10, minHeight: 64,
    backgroundColor: AppColors.lilac,
    borderWidth: 1.5, borderColor: AppColors.blue, borderRadius: 14, padding: 12,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  shadowLeft: {
    position: 'absolute', left: -SHADOW_X, top: SHADOW_Y, zIndex: 1, overflow: 'hidden',
  },
  shadowRight: { position: 'absolute', zIndex: 1, overflow: 'hidden' },

  spine: {
    position: 'absolute', zIndex: 999,
    alignItems: 'center', justifyContent: 'space-evenly',
  },

  inputLayer: { position: 'absolute'},
  lineInput: {
    ...AppFonts.body,
    position: 'absolute', left: 0,
    fontSize: AppFontSizes.body,
    backgroundColor: 'transparent',
    padding: 0, margin: 0, borderWidth: 0,
    textAlignVertical: 'bottom',
  },

  heartLeft:  { position: 'absolute', bottom: 10, right: 10, zIndex: 20 },
  heartRight: { position: 'absolute', bottom: 10, right: 10, zIndex: 20 },
});