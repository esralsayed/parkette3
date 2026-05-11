import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
interface SessionStore {
  session: any | null;
  setSession: (session: any) => void;
  clearSession: () => void;

  hydrateSession: (sessionId: string) => Promise<void>;
}

const API_URL = 'http://localhost:5000/api/community';  // same as Community.ts


export const useSessionStore = create<SessionStore>((set) => ({
  session: null,

  setSession: (session) => set({ session }),

  clearSession: () => set({ session: null }),

hydrateSession: async (sessionId: string) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_URL}/session/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      set({ session: null });
      return;
    }

    const data = await res.json();
    set({ session: data.session });
  } catch (err) {
    console.error("Failed to hydrate session", err);
    set({ session: null });
  }
},
}));