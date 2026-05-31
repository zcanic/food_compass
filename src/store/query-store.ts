import { create } from "zustand";
import type { ModelName } from "../types/model";
import type { AppMode, QueryDiagnostics, StyleStrength } from "../types/query";
import type { Recommendation } from "../types/result";
import type { ModeMatch } from "../types/mode";

interface QueryStore {
  rawInput: string;
  matchedIngredients: string[];
  activeMode: AppMode;
  activeModel: ModelName;
  targetStyle: string;
  strength: StyleStrength;
  results: Recommendation[];
  modes: ModeMatch[];
  explanation: string;
  isLoading: boolean;
  hasSearched: boolean;
  diagnostics: QueryDiagnostics | null;

  setRawInput: (s: string) => void;
  setMatchedIngredients: (ingredients: string[]) => void;
  setActiveMode: (mode: AppMode) => void;
  setActiveModel: (model: ModelName) => void;
  setTargetStyle: (style: string) => void;
  setStrength: (s: StyleStrength) => void;
  setResults: (r: Recommendation[]) => void;
  setModes: (m: ModeMatch[]) => void;
  setExplanation: (e: string) => void;
  setLoading: (l: boolean) => void;
  setHasSearched: (v: boolean) => void;
  setDiagnostics: (diagnostics: QueryDiagnostics | null) => void;
  reset: () => void;
}

export const useQueryStore = create<QueryStore>((set) => ({
  rawInput: "",
  matchedIngredients: [],
  activeMode: "pairing",
  activeModel: "cooc",
  targetStyle: "",
  strength: "medium",
  results: [],
  modes: [],
  explanation: "",
  isLoading: false,
  hasSearched: false,
  diagnostics: null,

  setRawInput: (s) => set({ rawInput: s }),
  setMatchedIngredients: (ingredients) => set({ matchedIngredients: ingredients }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setActiveModel: (model) => set({ activeModel: model }),
  setTargetStyle: (style) => set({ targetStyle: style }),
  setStrength: (s) => set({ strength: s }),
  setResults: (r) => set({ results: r }),
  setModes: (m) => set({ modes: m }),
  setExplanation: (e) => set({ explanation: e }),
  setLoading: (l) => set({ isLoading: l }),
  setHasSearched: (v) => set({ hasSearched: v }),
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  reset: () =>
    set({
      rawInput: "",
      matchedIngredients: [],
      results: [],
      modes: [],
      explanation: "",
      isLoading: false,
      hasSearched: false,
      diagnostics: null,
    }),
}));
