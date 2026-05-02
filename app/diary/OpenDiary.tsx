import Spine2 from "@/assets/svgs/diary/spine2.svg";
import { AppColors } from "@/constants/theme";
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { ClipPath, Defs, Line, Path, Rect } from 'react-native-svg';
import { usePage } from './usePage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ─── Sizes ────────────────────────────────────────────────────────────────────
const SPREAD_WIDTH   = screenWidth * 0.82;
const SPREAD_HEIGHT  = screenHeight * 0.52;
const SPINE_W        = screenWidth * 0.055;
const PAGE_GAP       = screenWidth * 0.03;
const PAGE_W         = (SPREAD_WIDTH - PAGE_GAP) / 2;
const PAGE_H         = SPREAD_HEIGHT;
const SHADOW_X       = 6;
const SHADOW_Y       = 6;
const BOOKMARK_W     = 28;
const BOOKMARK_H     = 44;

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY           = AppColors.blue;
const PAGE_BG        = AppColors.lilac;
const SHADOW_BG      = AppColors.blue;
const LINE_COLOR     = AppColors.blue;
const BORDER_W       = 4;
const CORNER_R       = 14;
const FONT_SIZE      = 13;
const LINE_COUNT     = 9;
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

interface DiarySpreadProps {
  diaryId: string | null;
}

// ─── Main Spread ──────────────────────────────────────────────────────────────
export function DiarySpread({ diaryId }: DiarySpreadProps) {
  const {
    lines, setLines, updateLine, saveNow,
    isSaving, loadEntryForDate, isFavourite, toggleFavorite,
    goToPrevDay, goToNextDay, canGoNext,
  } = usePage({ diaryId });

  const [view, setView] = useState<'entry' | 'settings'>('entry');
  const inputRefs = useRef<(TextInput | null)[]>(Array(TOTAL_LINES).fill(null));

  //handles overflow of text onto next line
  const handleContentSizeChange = useCallback(
  (width: number, index: number) => {
    // Content still fits — do nothing
    if (width <= INPUT_W) return;
    // Last line — nowhere to spill
    if (index >= TOTAL_LINES - 1) return;

    setLines(prev => {
      const next = [...prev];
      const current = next[index];

      // Try to break at the last space (word wrap)
      // If no space exists, hard-cut the last character
      const spaceIdx = current.lastIndexOf(' ');
      const keep  = spaceIdx > 0 ? current.slice(0, spaceIdx)  : current.slice(0, -1);
      const spill = spaceIdx > 0 ? current.slice(spaceIdx + 1) : current.slice(-1);

      next[index]     = keep;
      next[index + 1] = spill + next[index + 1]; // prepend spill to next line

      return next;
    });

    // Move focus to the next line after state updates
    setTimeout(() => {
      inputRefs.current[index + 1]?.focus();
    }, 0);
  },
  [setLines] // inputRefs is a ref so doesn't need to be a dep
);

// ─── Bookmark shape (pointed bottom) ─────────────────────────────────────────
const Bookmark = ({ color, icon }: { color: string; icon: string }) => (
  <View style={[bookmarkStyles.wrap, { backgroundColor: color }]}>
    {/* Pointed bottom via a View triangle trick */}
    <Text style={bookmarkStyles.icon}>{icon}</Text>
    <View style={[bookmarkStyles.point, { borderTopColor: color }]} />
  </View>
);

const bookmarkStyles = StyleSheet.create({
  wrap: {
    width: BOOKMARK_W,
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 2,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  icon: { fontSize: 14 },
  point: {
    width: 0,
    height: 0,
    borderLeftWidth: BOOKMARK_W / 2,
    borderRightWidth: BOOKMARK_W / 2,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

// ─── Shadow SVGs ──────────────────────────────────────────────────────────────
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

// ─── Normal page SVGs ─────────────────────────────────────────────────────────
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

const RightPageSVG = () => {
  const w = PAGE_W, h = PAGE_H, r = CORNER_R;
  const lines = Array.from({ length: LINE_COUNT }, (_, i) => HEADER_H + i * LINE_SPACING);
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect x={0} y={BORDER_W/2} width={w - BORDER_W/2} height={h - BORDER_W}
        rx={r} ry={r} fill={PAGE_BG} stroke={NAVY} strokeWidth={BORDER_W} />
      <Line x1={12} y1={HEADER_LINE_Y1} x2={12 + DAY_LINE_W} y2={HEADER_LINE_Y1}
        stroke={NAVY} strokeWidth={1.5} opacity={0.5} />
      <Line x1={w - 12 - DATE_LINE_W} y1={HEADER_LINE_Y2} x2={w - 12} y2={HEADER_LINE_Y2}
        stroke={NAVY} strokeWidth={1.5} opacity={0.5} />
      {lines.map((y, i) => (
        <Line key={i} x1={6} y1={y} x2={w - 12} y2={y}
          stroke={LINE_COLOR} strokeWidth={1.2} opacity={0.7} />
      ))}
    </Svg>
  );
};

// ─── Settings page SVGs ───────────────────────────────────────────────────────
const SettingsLeftSVG = () => {
  const w = PAGE_W, h = PAGE_H, r = CORNER_R;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect x={BORDER_W/2} y={BORDER_W/2} width={w - BORDER_W/2} height={h - BORDER_W}
        rx={r} ry={r} fill={PAGE_BG} stroke={NAVY} strokeWidth={BORDER_W} />
    </Svg>
  );
};

const SettingsRightSVG = () => {
  const w = PAGE_W, h = PAGE_H, r = CORNER_R;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect x={0} y={BORDER_W/2} width={w - BORDER_W/2} height={h - BORDER_W}
        rx={r} ry={r} fill={NAVY} stroke={NAVY} strokeWidth={BORDER_W} />
    </Svg>
  );
};

// ─── Heart SVG ────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled, onPress }: { filled: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
    <Svg width={24} height={22} viewBox="0 0 32 29">
      <Path
        d="M16 27S3 18.5 3 10C3 6.13 6.13 3 10 3C12.21 3 14.18 4.05 16 5.8C17.82 4.05 19.79 3 22 3C25.87 3 29 6.13 29 10C29 18.5 16 27 16 27Z"
        fill={filled ? NAVY : 'none'}
        stroke={NAVY}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </Svg>
  </TouchableOpacity>
);

// ─── Nav arrow SVG ────────────────────────────────────────────────────────────
const NavArrow = ({
  direction, onPress, disabled,
}: { direction: 'left' | 'right'; onPress: () => void; disabled?: boolean }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    style={[navStyles.btn, disabled && navStyles.disabled]}
  >
    <Svg width={28} height={28} viewBox="0 0 32 32">
      {/* Circle background */}
      <Path
        d="M16 2C8.27 2 2 8.27 2 16C2 23.73 8.27 30 16 30C23.73 30 30 23.73 30 16C30 8.27 23.73 2 16 2Z"
        fill={NAVY}
      />
      {direction === 'left' ? (
        // Left chevron
        <Path
          d="M19 9L12 16L19 23"
          fill="none"
          stroke={PAGE_BG}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        // Right chevron
        <Path
          d="M13 9L20 16L13 23"
          fill="none"
          stroke={PAGE_BG}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  </TouchableOpacity>
);

const navStyles = StyleSheet.create({
  btn: {},
  disabled: { opacity: 0.3 },
});

// ─── Settings content ─────────────────────────────────────────────────────────
const SettingsContent = ({
  totalEntries = 0,
  missedDays = 0,
  totalDays = 0,
  favoriteDates = [],
}: {
  totalEntries?: number;
  missedDays?: number;
  totalDays?: number;
  favoriteDates?: string[];
}) => (
  <View style={settingsStyles.wrap}>
    <Text style={settingsStyles.title}>My Diary Stats</Text>

    <View style={settingsStyles.row}>
      <Text style={settingsStyles.label}>📖  Total entries</Text>
      <Text style={settingsStyles.value}>{totalEntries}</Text>
    </View>

    <View style={settingsStyles.row}>
      <Text style={settingsStyles.label}>📅  Missed days</Text>
      <Text style={settingsStyles.value}>{missedDays}/{totalDays}</Text>
    </View>

    <View style={settingsStyles.row}>
      <Text style={settingsStyles.label}>❤️  Favorite days</Text>
      <Text style={settingsStyles.value}>{favoriteDates.length}</Text>
    </View>

    {favoriteDates.length > 0 && (
      <View style={settingsStyles.favList}>
        {favoriteDates.map((d, i) => (
          <Text key={i} style={settingsStyles.favDate}>
            {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        ))}
      </View>
    )}
  </View>
);

const settingsStyles = StyleSheet.create({
  wrap: { flex: 1, padding: 18, justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: NAVY, marginBottom: 20 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
    borderBottomWidth: 1, borderBottomColor: NAVY, paddingBottom: 8, opacity: 0.9,
  },
  label: { fontSize: 13, color: NAVY },
  value: { fontSize: 15, fontWeight: '700', color: NAVY },
  favList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  favDate: {
    fontSize: 11, color: NAVY, backgroundColor: `${NAVY}22`,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
});

// ─── Main Spread ──────────────────────────────────────────────────────────────

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
          style={[styles.lineInput, { top: topOffset }]}
          multiline={false}
          scrollEnabled={false}
          underlineColorAndroid="transparent"
          caretHidden={false}
        />
      );
    });

  const isSettings = view === 'settings';

  return (
    <View style={styles.outerWrapper}>

      {/* ── Navigation row above spread ── */}
      <View style={styles.navRow}>
        <NavArrow direction="left" onPress={goToPrevDay} />
        <View style={styles.navCenter}>
          {canGoNext ? (
            <NavArrow direction="right" onPress={goToNextDay} />
          ) : (
            <Text style={styles.tomorrowText}>come back tomorrow ✨</Text>
          )}
        </View>
      </View>

      <View style={styles.spreadRow}>

        {/* ── Left bookmarks (attached to left page outer edge) ── */}
        <View style={styles.leftBookmarks}>
          <Bookmark color={NAVY} icon="⚙️" />
        </View>

        <View style={styles.spread}>

          {/* ── Shadows ── */}
          <View style={styles.shadowLeft} pointerEvents="none"><ShadowLeftSVG /></View>
          <View style={styles.shadowRight} pointerEvents="none"><ShadowRightSVG /></View>

          {/* ── Left Page ── */}
          <View
            style={styles.leftPageContainer}
            onStartShouldSetResponder={() => {
              if (!isSettings) focusFirstEmptyOnPage(0);
              return false;
            }}
          >
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              {isSettings ? <SettingsLeftSVG /> : <LeftPageSVG />}
            </View>

            {isSettings ? (
              // Settings stats on left page
              <SettingsContent
                totalEntries={totalEntries}
                missedDays={missedDays}
                totalDays={totalDays}
                favoriteDates={favoriteDates}
              />
            ) : (
              <View style={styles.inputLayer}>{renderInputs(0)}</View>
            )}

            {/* Heart — bottom right of left page */}
            {!isSettings && (
              <View style={styles.heartLeft}>
                <HeartIcon filled={isFavourite} onPress={toggleFavorite} />
              </View>
            )}
          </View>

          {/* ── Right Page ── */}
          <View
            style={styles.rightPageContainer}
            onStartShouldSetResponder={() => {
              if (!isSettings) focusFirstEmptyOnPage(1);
              return false;
            }}
          >
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              {isSettings ? <SettingsRightSVG /> : <RightPageSVG />}
            </View>

            {!isSettings && (
              <>
                <View style={styles.inputLayer}>{renderInputs(1)}</View>
                {/* Heart — bottom right of right page */}
                <View style={styles.heartRight}>
                  <HeartIcon filled={isFavourite} onPress={toggleFavorite} />
                </View>
              </>
            )}
          </View>

          {/* ── Spine ── */}
          <View style={styles.spine}>
            <Spine2 width={SPINE_W} height={PAGE_H} />
          </View>

        </View>

        {/* ── Right bookmarks (attached to right page outer edge) ── */}
        <View style={styles.rightBookmarks}>
          <TouchableOpacity onPress={() => setView(v => v === 'settings' ? 'entry' : 'settings')}>
            <Bookmark color={NAVY} icon="⚙️" />
          </TouchableOpacity>
          <Bookmark color={NAVY} icon="🔖" />
          <Bookmark color={NAVY} icon="✏️" />
        </View>

      </View>
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

  // ── Nav row ──
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: SPREAD_WIDTH,
    alignSelf: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  navCenter: { flex: 1, alignItems: 'flex-end' },
  tomorrowText: {
    fontSize: 11,
    color: `${NAVY}88`,
    fontStyle: 'italic',
  },

  // ── Spread row (bookmarks + pages) ──
  spreadRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftBookmarks: {
    marginRight: 4,
    marginTop: 10,
    gap: 6,
  },
  rightBookmarks: {
    marginLeft: 4,
    marginTop: 10,
    gap: 6,
  },

  spread: {
    width: SPREAD_WIDTH,
    height: PAGE_H,
    flexDirection: 'row',
    alignSelf: 'center',
  },

  // ── Real pages ──
  leftPageContainer: {
    width: PAGE_W,
    height: PAGE_H,
    overflow: 'hidden',
    marginRight: PAGE_GAP / 2,
    zIndex: 2,
  },
  rightPageContainer: {
    width: PAGE_W,
    height: PAGE_H,
    overflow: 'hidden',
    marginLeft: PAGE_GAP / 2,
    zIndex: 2,
  },

  // ── Shadows ──
  shadowLeft: {
    position: 'absolute',
    width: PAGE_W, height: PAGE_H,
    left: -SHADOW_X, top: SHADOW_Y,
    zIndex: 1, overflow: 'hidden',
  },
  shadowRight: {
    position: 'absolute',
    width: PAGE_W, height: PAGE_H,
    left: PAGE_W + PAGE_GAP - SHADOW_X, top: SHADOW_Y,
    zIndex: 1, overflow: 'hidden',
  },

  spine: {
    position: 'absolute',
    left: PAGE_W + PAGE_GAP / 2 - SPINE_W / 2,
    width: SPINE_W, height: PAGE_H,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  inputLayer: {
    position: 'absolute',
    top: 0, left: CONTENT_PAD_X, right: CONTENT_PAD_X, bottom: 0,
  },
  lineInput: {
    position: 'absolute',
    left: 0,
    width: INPUT_W,
    height: INPUT_H,
    fontSize: FONT_SIZE,
    color: NAVY,
    backgroundColor: 'transparent',
    padding: 0, margin: 0, borderWidth: 0,
    textAlignVertical: 'bottom',
  },

  // ── Hearts ──
  heartLeft: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  heartRight: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});