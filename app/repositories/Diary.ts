// ─────────────────────────────────────────────────────────────
//  diaryApi.ts  –  All diary-related API calls live here
//  Add new endpoints below as the feature grows.
// ─────────────────────────────────────────────────────────────
import type { JSONContent } from '@tiptap/react';

const BASE_URL = 'http://localhost:5000/api/diary';

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
}

export interface DiaryEntry {
  _id: string //has to match backenddddd
  diaryId: string
  date: string
  isFavorite: boolean
  content: JSONContent
  drawings: {
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
  favoriteDays: string[]; // ISO date strings
}

export interface Diary {
  _id: string           // MongoDB uses _id not id
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
  theme: "lilac" | "blue"   // ← top level, NOT inside cover
  stickers: DiarySticker[]  // ← top level, NOT inside cover
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
export async function getDiary(userId: String): Promise<Diary> {
  return apiFetch<Diary>(`/${userId}/`);
}

export async function saveChangesCover(diaryId: String, body: object) {
  return apiFetch(`/save/${diaryId}/cover` , {method: "PUT",
    body: JSON.stringify(body)
  });
}

export async function saveDiaryEntry(diaryId: String, body: object){
  console.log(" are we in repo?"); 
  return apiFetch(`/entry/${diaryId}/save` , {
    method: "POST" , body: JSON.stringify(body)
  }); 
}

export async function getEntryByDate(diaryId: string, date: Date) {
  return apiFetch<{ entry: DiaryEntry; isNew: boolean }>(
    `/${diaryId}/entry?date=${date.toISOString()}`
  );
}

export async function toggleFavourite(
  diaryId: String,
  entryId: string,
  isFavorite: boolean
): Promise<DiaryEntry> {
  return apiFetch(`/diaries/${diaryId}/entries/${entryId}/favourite`, {
    method: "PATCH",
    body: JSON.stringify({ isFavorite }),
  });
}

// ── More endpoints go here ─────────────────────────────────────