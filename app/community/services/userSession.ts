import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email?: string;
  level: number;
  tokens: number;
}

interface SessionStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
updateUser: (fields: Partial<User>) => Promise<void>;

}

export const useSessionStore = create<SessionStore>((set, get) => ({
  user: null,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),
    updateUser: async (fields) => {
    const updated = { ...get().user!, ...fields };
    set({ user: updated });
    await AsyncStorage.setItem('user', JSON.stringify(updated)); // 👈 keep in sync
  },
}));