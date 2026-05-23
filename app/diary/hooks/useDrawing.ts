import { useCallback, useRef, useState } from "react";

// ── Types (mirror your Mongoose schema enums) ─────────────────────────────────
export type StrokeType  = "brush" | "pen";
export type StrokeSize  = "big"   | "small";
export type StrokeColor = "lilac" | "blue";

export interface Point  { x: number; y: number }
export interface Stroke {
  strokeType:  StrokeType;
  strokeSize:  StrokeSize;
  strokeColor: StrokeColor;
  points:      Point[];
}

export interface DrawingOptions {
  strokeType:  StrokeType;
  strokeSize:  StrokeSize;
  strokeColor: StrokeColor;
}

const DEFAULT_OPTIONS: DrawingOptions = {
  strokeType:  "pen",
  strokeSize:  "small",
  strokeColor: "blue",
};

// ─────────────────────────────────────────────────────────────────────────────
export function useDrawing(onSave?: (strokes: Stroke[]) => void) {
  const [strokes,     setStrokes]     = useState<Stroke[]>([]);
  const [options,     setOptions]     = useState<DrawingOptions>(DEFAULT_OPTIONS);
  const [isDrawing,   setIsDrawing]   = useState(false);
  const [drawingMode, setDrawingMode] = useState(false); // canvas active?

  // Current in-progress stroke (ref so we don't re-render every point)
  const currentStroke = useRef<Stroke | null>(null);

  // ── Pointer handlers ──────────────────────────────────────────────────────
  const onTouchStart = useCallback(
    (x: number, y: number) => {
      if (!drawingMode) return;
      setIsDrawing(true);
      currentStroke.current = {
        strokeType:  options.strokeType,
        strokeSize:  options.strokeSize,
        strokeColor: options.strokeColor,
        points:      [{ x, y }],
      };
    },
    [drawingMode, options]
  );

  const onTouchMove = useCallback(
    (x: number, y: number) => {
      if (!isDrawing || !currentStroke.current) return;
      currentStroke.current.points.push({ x, y });
      // Force a re-render so the live preview updates
      setStrokes(prev => [...prev]);
    },
    [isDrawing]
  );

  const onTouchEnd = useCallback(() => {
    if (!currentStroke.current) return;
    const finished = { ...currentStroke.current, points: [...currentStroke.current.points] };
    setStrokes(prev => {
      const next = [...prev, finished];
      onSave?.(next);
      return next;
    });
    currentStroke.current = null;
    setIsDrawing(false);
  }, [onSave]);

  // ── History helpers ───────────────────────────────────────────────────────
  const undo = useCallback(() => {
    setStrokes(prev => {
      const next = prev.slice(0, -1);
      onSave?.(next);
      return next;
    });
  }, [onSave]);

  const clear = useCallback(() => {
    setStrokes([]);
    onSave?.([]);
  }, [onSave]);

  // ── Option setters ────────────────────────────────────────────────────────
  const setStrokeType  = useCallback((v: StrokeType)  => setOptions(o => ({ ...o, strokeType:  v })), []);
  const setStrokeSize  = useCallback((v: StrokeSize)  => setOptions(o => ({ ...o, strokeSize:  v })), []);
  const setStrokeColor = useCallback((v: StrokeColor) => setOptions(o => ({ ...o, strokeColor: v })), []);

  const toggleDrawingMode = useCallback(() => setDrawingMode(d => !d), []);

  return {
    strokes,
    setStrokes,           // let parent hydrate from DB
    currentStroke,        // ref – read in canvas for live preview
    options,
    isDrawing,
    drawingMode,
    toggleDrawingMode,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    undo,
    clear,
    setStrokeType,
    setStrokeSize,
    setStrokeColor,
  };
}