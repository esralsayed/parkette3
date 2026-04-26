// ─────────────────────────────────────────────────────────────
//  diaryApi.ts  –  All diary-related API calls live here
//  Add new endpoints below as the feature grows.
// ─────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:5000/api/diary';

// ── Types ──────────────────────────────────────────────────────

export interface DiarySticker {
  id: String;
  x: Number;       // 0–1 ratio of cover width
  y: Number;       // 0–1 ratio of cover height
}

export interface DiaryCustomLetter {
  letter: String;
  fontFamily: String;
  color: String;
  fontSize: Number;
}

export interface DiaryCover {
  color: "lilac" | "blue";
  stickers: DiarySticker[];
  customLetters: DiaryCustomLetter[];
}

export interface DiaryStats {
  totalDays: Number;
  missedDays: Number;
  favoriteDays: String[]; // ISO date strings
}

export interface Diary {
  id: String;
  userId: String;
  ownerName: String; 
  cover: DiaryCover;
  stats: DiaryStats;
  createdAt: String;
  updatedAt: String;
}

export interface DiaryEntry {
  diaryId: String;
  date: String;               // ISO date string
  isFavorite: Boolean;
  content: {
    textBlocks: {
      content: string;
      fontFamily: string;
      fontSize: number;
      color: string;
      alignment: "left" | "center" | "right";
    }[];
    drawings: {
      strokeType: "pen" | "brush";
      strokeSize: number;
      color: string;
      points: [number, number][];
    }[];
    stickers: DiarySticker[];
    fillColor: string;
  };
}

// ── Helpers ────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      // TODO: inject auth token here, e.g.:
      // Authorization: `Bearer ${getToken()}`,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "API request failed");
  }

  return res.json() as Promise<T>;
}

// ── 1. Get the diary for the current child ─────────────────────
/**
 * Fetches the diary document for the authenticated child.
 * Called on page load to render the diary cover.
 */
export async function getDiary(childId: string): Promise<Diary> {
  return apiFetch<Diary>(`/children/${childId}/diary`);
}

// ── 2. Record a diary-opened event ────────────────────────────
/**
 * Called when the child clicks/taps the diary cover.
 * Logs the interaction for learning analytics and
 * returns the most recent (or today's) entry.
 */
export async function openDiary(
  diaryId: string
): Promise<{ entry: DiaryEntry | null; streakDays: number }> {
  return apiFetch(`/diaries/${diaryId}/open`, { method: "POST" });
}

// ── 3. (Placeholder) Get all entries ──────────────────────────
/**
 * Fetches paginated diary entries.
 * Used in the entries list / calendar view.
 */
export async function getDiaryEntries(
  diaryId: string,
  page = 1,
  limit = 20
): Promise<{ entries: DiaryEntry[]; total: number }> {
  return apiFetch(`/diaries/${diaryId}/entries?page=${page}&limit=${limit}`);
}

// ── 4. (Placeholder) Save / update the diary cover ────────────
/**
 * Persists cover customisation (color, stickers, custom letters).
 * Called when the child exits the cover editor.
 */
export async function updateDiaryCover(
  diaryId: string,
  cover: DiaryCover
): Promise<Diary> {
  return apiFetch(`/diaries/${diaryId}/cover`, {
    method: "PATCH",
    body: JSON.stringify({ cover }),
  });
}

// ── 5. (Placeholder) Save a diary entry ───────────────────────
/**
 * Creates or replaces today's diary entry.
 * Called on auto-save or when the child taps "Done".
 */
export async function saveDiaryEntry(
  diaryId: string,
  entry: Omit<DiaryEntry, "entryId" | "diaryId">
): Promise<DiaryEntry> {
  return apiFetch(`/diaries/${diaryId}/entries`, {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

// ── 6. (Placeholder) Toggle favourite on an entry ─────────────
export async function toggleFavourite(
  diaryId: string,
  entryId: string,
  isFavorite: boolean
): Promise<DiaryEntry> {
  return apiFetch(`/diaries/${diaryId}/entries/${entryId}/favourite`, {
    method: "PATCH",
    body: JSON.stringify({ isFavorite }),
  });
}

// ── More endpoints go here ─────────────────────────────────────