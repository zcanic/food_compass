import type { ModelName } from "./model";

export type AppMode =
  | "pairing"
  | "substitute"
  | "style_shift"
  | "lookup_mode"
  | "complete_combo"
  | "compare_models"
  | "ask";

export type AskIntent =
  | "pairing"
  | "substitute"
  | "style_shift"
  | "complete_combo"
  | "explain";

export type StyleStrength = "light" | "medium" | "strong";

export interface IntentResult {
  intent: AskIntent | null;
  matchedIntents?: AskIntent[];
  ingredients: string[];
  targetStyle?: string;
  constraints: string[];
  confidence: number;
  multiIntent: boolean;
}

export interface QueryState {
  rawInput: string;
  matchedIngredients: string[];
  activeMode: AppMode;
  activeModel: ModelName;
  targetStyle?: string;
  strength?: StyleStrength;
}
