import { create } from "zustand";

interface AppStore {
  engineReady: boolean;
  darkMode: boolean;
  setEngineReady: (v: boolean) => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  engineReady: false,
  darkMode: false,
  setEngineReady: (v) => set({ engineReady: v }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));
