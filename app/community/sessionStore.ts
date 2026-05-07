import { create } from "zustand";

//to store the community session globally

interface SessionStore {
  session: any | null;
  setSession: (session: any) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}));