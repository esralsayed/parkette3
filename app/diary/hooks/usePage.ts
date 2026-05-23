import { AppColors } from "@/constants/theme";
import { useCallback, useEffect, useRef, useState } from "react";
import { DiaryEntry, DiarySticker, getEntryByDate, saveDiaryEntry, toggleFavourite } from "../repository/Diary";
import { Stroke } from "./useDrawing";

const LINE_COUNT = 9; 
const TOTAL_LINES = LINE_COUNT * 2; 

interface usePageOptions {
    diaryId: string | null; 
    initialLines?: string[]; 
}

export function usePage ({ diaryId, initialLines }: usePageOptions) {
    const [lines, setLines] = useState<string[]>(
        initialLines ?? Array(TOTAL_LINES).fill("")
    );
    const [isSaving, setIsSaving] = useState(false); 
    const [lastSaved, setLastSaved] = useState<Date | null>(null); 
    const [entry, setEntry] = useState<DiaryEntry | null>(null); 
    const [isFavourite, setIsFavourite] = useState(false);
    const [stickers,  setStickers]  = useState<DiarySticker[]>([]);
    const [fillColor, setFillColor] = useState<string | null>(null);

    // ── Drawing state ─────────────────────────────────────────────────────────
    const [initialDrawing, setInitialDrawing] = useState<Stroke[] | null>(null);

    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null); 
    const drawingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Keep a ref to the latest strokes so saveEntry can include them
    const latestStrokes = useRef<Stroke[]>([]);
    const latestStickers  = useRef<DiarySticker[]>([]);
    const latestFillColor = useRef<string | null>(null);

    const saveEntry = useCallback(async (currentLines: string[], strokes?: Stroke[]) => {
        try {
            if (!diaryId) return; 
            setIsSaving(true); 
            const today = new Date(); 
            await saveDiaryEntry(diaryId, {
                date: today.toISOString(),
                day: today.toLocaleDateString("en-US", { weekday: "long" }),
                content: {
                    leftPage: currentLines.slice(0, LINE_COUNT),
                    rightPage: currentLines.slice(LINE_COUNT),
                },
                // Include strokes if provided, otherwise keep whatever was last saved
                drawing: strokes ?? latestStrokes.current,
                stickers: latestStickers.current,
                favorite: false,
                fillColor: latestFillColor.current,
            });
            setLastSaved(new Date()); 
        } catch (err) {
            console.error("Failed to save entry:", err); 
        } finally {
            setIsSaving(false); 
        }
    }, [diaryId, fillColor]); 

    // ── Text save (debounced 1.5s) ────────────────────────────────────────────
    const scheduleSave = useCallback((currentLines: string[]) => {
        if (saveTimer.current) clearTimeout(saveTimer.current); 
        saveTimer.current = setTimeout(() => saveEntry(currentLines), 1500); 
    }, [saveEntry]); 

    const updateLine = useCallback((text: string, index: number) => {
        setLines(prev => {
            const next = [...prev]; 
            next[index] = text; 
            scheduleSave(next); 
            return next; 
        }); 
    }, [scheduleSave]);

    // ── Drawing save (debounced 1s) ───────────────────────────────────────────
    const saveDrawing = useCallback((strokes: Stroke[]) => {
        latestStrokes.current = strokes;
        if (drawingTimer.current) clearTimeout(drawingTimer.current);
        drawingTimer.current = setTimeout(() => {
            saveEntry(lines, strokes);
        }, 1000);
    }, [saveEntry, lines]);

        // ── Sticker helpers ───────────────────────────────────────────────────────
    const addSticker = useCallback((sticker: DiarySticker) => {
        setStickers(prev => {
            const next = [...prev, sticker];
            latestStickers.current = next;
            saveEntry(lines);   // immediate save — sticker placement feels instant
            return next;
        });
    }, [lines, saveEntry]);
 
    const removeSticker = useCallback((id: string) => {
        setStickers(prev => {
            const next = prev.filter(s => s.id !== id);
            latestStickers.current = next;
            saveEntry(lines);
            return next;
        });
    }, [lines, saveEntry]);
 
    const updateStickerPosition = useCallback((id: string, x: number, y: number) => {
        setStickers(prev => {
            const next = prev.map(s => s.id === id ? { ...s, x, y } : s);
            latestStickers.current = next;
            // debounce position updates — user may still be dragging
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => saveEntry(lines), 800);
            return next;
        });
    }, [lines, saveEntry]);
 
    // ── Fill colour helper ────────────────────────────────────────────────────
    const updateFillColor = useCallback((color: string | null) => {
        setFillColor(color);
        latestFillColor.current = color;
        saveEntry(lines);   // immediate — colour changes feel instant
    }, [lines, saveEntry]);

    // ── Manual save ───────────────────────────────────────────────────────────
    const saveNow = useCallback(() => {
        if (saveTimer.current) clearTimeout(saveTimer.current); 
        if (drawingTimer.current) clearTimeout(drawingTimer.current);
        saveEntry(lines, latestStrokes.current); 
    }, [saveEntry, lines]); 

    // ── Load entry for a given date ───────────────────────────────────────────
    const loadEntryForDate = useCallback(async (date: Date) => {
        if (!diaryId) return;
        try {
            const { entry, isNew } = await getEntryByDate(diaryId, date);
            setEntry(entry);
            setIsFavourite(entry.favorite ?? false);
            if (entry.fillColor) {
            setFillColor(entry.fillColor);
            latestFillColor.current = entry.fillColor;
        }
            if (!isNew) {
                setLines([...entry.content.leftPage, ...entry.content.rightPage]);
                // Hydrate drawing strokes from the saved entry
                const saved = entry.drawing ?? [];
                latestStrokes.current = saved;
                setInitialDrawing(saved);
                setStickers(entry.stickers ?? []);          // ← always reset
                latestStickers.current = entry.stickers ?? [];
                const color = entry.fillColor ?? AppColors.lilac;
                setFillColor(color);
                latestFillColor.current = color;
            } else {
                setLines(Array(TOTAL_LINES).fill(''));
                latestStrokes.current = [];
                setInitialDrawing([]);
                setStickers([]);                    // ← clear stickers for new entries
                latestStickers.current = [];
                // Set default fillColor for new entries
                if (!fillColor) {
                setFillColor(AppColors.lilac); // Default theme
                latestFillColor.current = AppColors.lilac;
            }
            }
        } catch (err) {
            console.error("Failed to load entry:", err);
        }
    }, [diaryId]);

    // ── Favourite toggle ──────────────────────────────────────────────────────
    const toggleFavorite = useCallback(async () => {
        if (!diaryId) return; 
        if (!entry?._id) return;
        await toggleFavourite(diaryId, entry._id, !isFavourite);
        setIsFavourite(prev => !prev);
    }, [entry, isFavourite, diaryId]);

    // ── Date navigation ───────────────────────────────────────────────────────
    const [currentDate, setCurrentDate] = useState(new Date());

    const goToPrevDay = useCallback(() => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() - 1);
            return d;
        });
    }, []);

    const goToNextDay = useCallback(() => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() + 1);
            return d;
        });
    }, []);

    const isToday = currentDate.toDateString() === new Date().toDateString();
    const canGoNext = !isToday;

    useEffect(() => {
        loadEntryForDate(currentDate);
    }, [currentDate, loadEntryForDate]);

    // ── Cleanup timers on unmount ─────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (saveTimer.current)    clearTimeout(saveTimer.current);
            if (drawingTimer.current) clearTimeout(drawingTimer.current);
        };
    }, []);

    return {
        lines, setLines, updateLine, saveNow,
        isSaving, lastSaved,
        loadEntryForDate,
        toggleFavorite, isFavourite,
        goToNextDay, goToPrevDay, canGoNext, currentDate,
        // drawing
        saveDrawing,
        initialDrawing,
        //stickers
        stickers, addSticker, removeSticker, updateStickerPosition,
        // fill color
        fillColor, updateFillColor,
    };
}