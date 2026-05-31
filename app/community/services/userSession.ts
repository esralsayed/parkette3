import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface Avatar {
  hair: string | null;
  skin: string | null;
  gender: 'boy' | 'girl';
  miniAvatar: string | null;  // e.g. "girl_hair1_skin2"
  pet?: {
    color?: string;
    accessory?: string;
    name?: string;
  };
}

interface User {
  id: string;
  name: string;
  email?: string;
  level: number;
  tokens: number;
  unlockedItems: { type: string; itemId: string }[];
  avatar: Avatar;
}

interface SessionStore {
  user: User | null;
  hydrated: boolean;
  setUser: (user: User) => void;
  setHydrated: (val: boolean) => void; // ← add this
  clearUser: () => void;
  updateUser: (fields: Partial<User>) => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  user: null,
  hydrated: false,
  setUser: (user) => {
    set({ user });
    AsyncStorage.setItem('user', JSON.stringify(user));
  },
  setHydrated: (val) => set({ hydrated: val }), // ← add this
  clearUser: () => {
    set({ user: null });
    AsyncStorage.removeItem('user');
  },
  updateUser: async (fields) => {
    const updated = { ...get().user!, ...fields };
    set({ user: updated });
    await AsyncStorage.setItem('user', JSON.stringify(updated));
  },
}));