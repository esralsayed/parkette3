// ─────────────────────────────────────────────────────────────
//  diaryApi.ts  –  All diary-related API calls live here
//  Add new endpoints below as the feature grows.
// ─────────────────────────────────────────────────────────────
//import type { JSONContent } from '@tiptap/react';

const BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/diary` || 'http://localhost:5000/api/diary';

// JSONContent is tiptap's format: a recursive node tree
export type JSONContent = {
  type?: string;
  content?: JSONContent[];
  attrs?: Record<string, any>;
  marks?: { type: string; attrs?: Record<string, any> }[];
  text?: string;
};
// ── Types ──────────────────────────────────────────────────────

export interface DiaryCustomLetter {
  letter: string
  style: {
    fontFamily: string
    fontSize: number
    alignment: string
    color: string
  }
  position: { x: number; y: number }
}

export interface DiarySticker {
  id: string
  x: number
  y: number
  page: "left" | "right"
}

export interface DiaryEntry {
  _id: string
  diaryId: string
  date: string
  favorite: boolean
  content: {leftPage: string[]; rightPage: string[]}
  drawing: {
    strokeType: "pen" | "brush"
    strokeSize: "big" | "small"
    strokeColor: "lilac" | "blue"
    points: { x: number; y: number }[]
  }[]
  stickers: DiarySticker[]
  fillColor: string
}

export interface DiaryStats {
  totalDays: number;
  missedDays: number;
  favoriteDates: string[]; // ISO date strings
}

export interface Diary {
  _id: string
  userId: string
  diaryTitle: {
    text: string
    defaultStyle: {
      fontFamily: string
      fontSize: number
      color: string
    }
    letters: DiaryCustomLetter[]
  }
  theme: "lilac" | "blue"
  stickers: DiarySticker[]
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
export async function getDiary(userId: string): Promise<Diary> {
  return apiFetch<Diary>(`/${userId}`);  // removed trailing slash
}

// ── 2. Save cover changes ──────────────────────────────────────
export async function saveChangesCover(diaryId: string, body: object) {
  return apiFetch(`/save/${diaryId}/cover`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ── 3. Save a diary entry ──────────────────────────────────────
export async function saveDiaryEntry(diaryId: string, body: object) {
  return apiFetch(`/entry/${diaryId}/save`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── 4. Get entry by date ───────────────────────────────────────
export async function getEntryByDate(diaryId: string, date: Date) {
  return apiFetch<{ entry: DiaryEntry; isNew: boolean }>(
    `/${diaryId}/entry?date=${date.toISOString()}`
  );
}

// ── 5. Toggle favourite ────────────────────────────────────────
// Route: PATCH /api/diary/:diaryId/entry/:entryId/favourite
export async function toggleFavourite(
  diaryId: string,
  entryId: string,
  favorite: boolean
): Promise<DiaryEntry> {
  return apiFetch(`/${diaryId}/entry/${entryId}/favourite`, {
    method: "PATCH",
    body: JSON.stringify({ favorite }),
  });
}

export async function getDiaryStats(diaryId: string): Promise<DiaryStats> {
  console.log("are u here?")
  return apiFetch<DiaryStats>(`/${diaryId}/stats`);
}

export interface FavoriteEntry {
  _id: string;
  Date: string;
  content: { leftPage: string[]; rightPage: string[] };
}

export async function getFavouriteEntries(diaryId: string): Promise<FavoriteEntry[]> {
  return apiFetch<FavoriteEntry[]>(`/${diaryId}/favourites`);
}

// ── More endpoints go here ─────────────────────────────────────