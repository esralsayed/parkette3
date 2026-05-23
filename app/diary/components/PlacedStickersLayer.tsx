import React, { useRef } from "react";
import {
    GestureResponderEvent,
    PanResponder,
    StyleSheet,
    View
} from "react-native";
import { DiarySticker } from "../repository/Diary";
import { STICKER_DEFS } from "./toolBarActions";

interface PlacedStickersLayerProps {
  stickers:              DiarySticker[];
  selectedStickerId:     string | null;   // sticker type chosen in window (to place)
  page:                  "left" | "right";
  onPlace:               (sticker: DiarySticker) => void;
  onMove:                (id: string, x: number, y: number) => void;
  onRemove:              (id: string) => void;
  pageWidth:             number;
  pageHeight:            number;
  stickerSize:           number;
  disabled?:             boolean;         // true when drawing mode is on
}

// ─── Single draggable sticker ─────────────────────────────────────────────────
function DraggableSticker({
  sticker,
  size,
  onMove,
  onRemove,
}: {
  sticker:  DiarySticker;
  size:     number;
  onMove:   (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}) {
  const def = STICKER_DEFS.find(d => d.id === sticker.id);
  if (!def) return null;

  const StickerComponent = def.component;
  const startPos = useRef({ x: sticker.x, y: sticker.y });
  const tapStart = useRef<number>(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder:        () => true,
    onMoveShouldSetPanResponder:         () => true,
    onPanResponderGrant: () => {
      startPos.current = { x: sticker.x, y: sticker.y };
      tapStart.current = Date.now();
    },
    onPanResponderMove: (_, gesture) => {
      onMove(
        sticker.id,
        startPos.current.x + gesture.dx,
        startPos.current.y + gesture.dy,
      );
    },
    onPanResponderRelease: (_, gesture) => {
      const elapsed   = Date.now() - tapStart.current;
      const didntMove = Math.abs(gesture.dx) < 4 && Math.abs(gesture.dy) < 4;
      // Quick tap with no movement = remove the sticker
      if (elapsed < 250 && didntMove) {
        onRemove(sticker.id);
      }
    },
  });

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.stickerWrap,
        { left: sticker.x, top: sticker.y, width: size, height: size },
      ]}
    >
      <StickerComponent width={size} height={size} />
    </View>
  );
}

// ─── Layer that handles tap-to-place + renders all placed stickers ────────────
export function PlacedStickersLayer({
  stickers,
  selectedStickerId,
  page,
  onPlace,
  onMove,
  onRemove,
  pageWidth,
  pageHeight,
  stickerSize,
  disabled,
}: PlacedStickersLayerProps) {

  // Tap anywhere on the page to place the selected sticker
  const handlePageTap = (e: GestureResponderEvent) => {
    if (!selectedStickerId || disabled) return;
    const { locationX: x, locationY: y } = e.nativeEvent;
    onPlace({
      id: selectedStickerId,
      x:  x - stickerSize / 2,   // centre on tap point
      y:  y - stickerSize / 2,
      page,
    });
  };

  return (
    <View
      style={[styles.layer, { width: pageWidth, height: pageHeight }]}
      onStartShouldSetResponder={() => !!selectedStickerId && !disabled}
      onResponderRelease={handlePageTap}
    >
      {stickers.map((s, i) => (
        <DraggableSticker
          key={`${s.id}-${i}`}
          sticker={s}
          size={stickerSize}
          onMove={onMove}
          onRemove={onRemove}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    top:      0,
    left:     0,
    zIndex:   15,   // above lines, below brush popup
  },
  stickerWrap: {
    position: "absolute",
    // subtle hit area expansion so small stickers are still easy to grab
    padding: 4,
  },
});