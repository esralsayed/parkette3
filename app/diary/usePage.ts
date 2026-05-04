import { useCallback, useEffect, useRef, useState } from "react";
import { DiaryEntry, getEntryByDate, saveDiaryEntry, toggleFavourite } from "../repositories/Diary";

const LINE_COUNT = 9; 
const TOTAL_LINES = LINE_COUNT * 2; 
interface usePageOptions {
    diaryId: string | null; 
    initialLines?: string[]; 
}
export function usePage ({diaryId , initialLines} : usePageOptions) {
    const [lines, setLines] = useState<string[]>(
        initialLines ?? Array(TOTAL_LINES).fill("")
    )
    const [isSaving, setIsSaving] = useState(false); 
    const [lastSaved, setLastSaved] = useState<Date | null>(null); 
    const [entry, setEntry] = useState<DiaryEntry | null>(null); 
    const [isFavourite, setIsFavourite] = useState(false); 

    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null); 

    const saveEntry = useCallback
    (
        async (currentLines: String[]) => {
        try{
            if (!diaryId) return; 
            setIsSaving(true); 
            const today = new Date(); 
            await saveDiaryEntry (diaryId, {
                date: today.toISOString(),
                day: today.toLocaleDateString("en-US", { weekday: "long"}),
                content:{
                    leftPage: currentLines.slice(0,LINE_COUNT),
                    rightPage: currentLines.slice(LINE_COUNT),
                }
            });
            setLastSaved(new Date()); 
            console.log(currentLines);
        }
        catch (err) {
            console.error("Failed to save entry:" , err); 
        } finally {
            setIsSaving(false); 
        }

    },
[diaryId]
); 

// debounced save, fires every 1.5s secs after user stops typing
const scheduleSave = useCallback(
    (currentLines: String[]) => {
        if (saveTimer.current) clearTimeout(saveTimer.current); 
        saveTimer.current = setTimeout(() => saveEntry(currentLines), 1500); 
    } , [saveEntry]
); 

const updateLine = useCallback(
    (text: string, index: number) => {
        setLines(prev => {
            const next = [...prev]; 
            next[index] = text; 
            scheduleSave(next); 
            return next; 
        }); 
    }, [scheduleSave]
)

//manual save
const saveNow = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current); 
    saveEntry(lines); 
}, [saveEntry, lines]); 

//loads todayss
// const loadToday = useCallback(async () => {
//   if (!diaryId) return;
//   try {
//     const { entry, isNew } = await getTodayEntry(diaryId);
//     setEntry(entry); 
//     setIsFavourite(entry.favorite ?? false);
//     if (!isNew) {
//       // flatten the two pages back into the lines array
//       setLines([...entry.content.leftPage, ...entry.content.rightPage]);
//     }
//   } catch (err) {
//     console.error("Failed to load today's entry:", err);
//   }
// }, [diaryId]);

const loadEntryForDate = useCallback(async (date: Date) => {
  if (!diaryId) return;
  try {
    const { entry, isNew } = await getEntryByDate(diaryId, date);
    setEntry(entry);
    setIsFavourite(entry.favorite ?? false);
    if (!isNew) {
      setLines([...entry.content.leftPage, ...entry.content.rightPage]);
    } else {
      setLines(Array(TOTAL_LINES).fill(''));  // fresh page for that day
    }
  } catch (err) {
    console.error("Failed to load entry:", err);
  }
}, [diaryId]);

//favorite an entry
const toggleFavorite = useCallback(async () => {
  if (!diaryId) return; 
  if (!entry?._id) return;
  await toggleFavourite(diaryId, entry._id, !isFavourite);
  setIsFavourite(prev => !prev);
}, [entry, isFavourite, diaryId]);

//get prev or next entry
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
const canGoNext = !isToday; // can't go past today

useEffect(() => {
  loadEntryForDate(currentDate);
}, [currentDate, loadEntryForDate]);

return { lines, setLines, updateLine, saveNow, isSaving, lastSaved, loadEntryForDate, toggleFavorite, goToNextDay, goToPrevDay, isFavourite, canGoNext, currentDate }
}