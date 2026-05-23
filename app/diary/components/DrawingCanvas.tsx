import { AppColors } from "@/constants/theme";
import React, { useCallback } from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { DrawingOptions, Point, Stroke } from "../hooks/useDrawing";

// ── Colour map (schema enums → real hex) ──────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  lilac: AppColors.lilac === "#E8D5F5" ? "#C9A8E8" : AppColors.lilac, // use a visible lilac tint
  blue:  AppColors.blue,
};

// Fall back gracefully if AppColors doesn't expose a visible lilac
const STROKE_COLORS: Record<string, string> = {
  lilac: "#B48FD8",
  blue:  "#003E8F",
};

// ── Stroke width map ──────────────────────────────────────────────────────────
const SIZE_MAP: Record<string, number> = {
  big:   6,
  small: 2,
};

// ── Opacity / style tweaks per strokeType ─────────────────────────────────────
const TYPE_STYLE: Record<string, { opacity: number; linecap: "round" | "square" | "butt" }> = {
  brush: { opacity: 0.55, linecap: "round"  },
  pen:   { opacity: 0.90, linecap: "round"  },
};

// ── Convert points array → SVG path string ────────────────────────────────────
function pointsToPath(pts: Point[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y} l0,0`;

  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    // Smooth curve through midpoints
    const mx = (prev.x + curr.x) / 2;
    const my = (prev.y + curr.y) / 2;
    d += ` Q${prev.x},${prev.y} ${mx},${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${last.x},${last.y}`;
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  width:          number;
  height:         number;
  strokes:        Stroke[];
  livePoints:     Point[];          // current in-progress stroke points
  currentOptions: DrawingOptions;
  drawingMode:    boolean;
  onTouchStart:   (x: number, y: number) => void;
  onTouchMove:    (x: number, y: number) => void;
  onTouchEnd:     () => void;
}

export function DrawingCanvas({
  width, height,
  strokes, livePoints, currentOptions,
  drawingMode,
  onTouchStart, onTouchMove, onTouchEnd,
}: Props) {

  // ── Gesture bridge → drawing hook ────────────────────────────────────────
  const extractCoords = (e: GestureResponderEvent) => {
    const { locationX: x, locationY: y } = e.nativeEvent;
    return { x, y };
  };

  const handleStart = useCallback(
    (e: GestureResponderEvent) => {
      if (!drawingMode) return;
      const { x, y } = extractCoords(e);
      onTouchStart(x, y);
    },
    [drawingMode, onTouchStart]
  );

  const handleMove = useCallback(
    (e: GestureResponderEvent) => {
      const { x, y } = extractCoords(e);
      onTouchMove(x, y);
    },
    [onTouchMove]
  );

  const renderStroke = (stroke: Stroke, key: string | number) => {
    const color   = STROKE_COLORS[stroke.strokeColor] ?? "#003E8F";
    const width_  = SIZE_MAP[stroke.strokeSize]        ?? 2;
    const style   = TYPE_STYLE[stroke.strokeType]      ?? TYPE_STYLE.pen;
    const d       = pointsToPath(stroke.points);
    if (!d) return null;

    return (
      <Path
        key={key}
        d={d}
        stroke={color}
        strokeWidth={width_}
        strokeOpacity={style.opacity}
        strokeLinecap={style.linecap}
        strokeLinejoin="round"
        fill="none"
      />
    );
  };

  return (
    <View
      style={[styles.canvas, { width, height }]}
      onStartShouldSetResponder={() => drawingMode}
      onMoveShouldSetResponder={()  => drawingMode}
      onResponderGrant={handleStart}
      onResponderMove={handleMove}
      onResponderRelease={onTouchEnd}
      onResponderTerminate={onTouchEnd}
      pointerEvents={drawingMode ? 'box-only' : 'none'}
    >
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        {/* Finished strokes */}
        {strokes.map((s, i) => renderStroke(s, i))}

        {/* Live stroke preview */}
        {livePoints.length > 0 && renderStroke(
          { ...currentOptions, points: livePoints },
          "live"
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%', 
    height: '100%'
  },
});