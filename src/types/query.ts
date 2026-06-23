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

export type AskToolName =
  | "find_pairings"
  | "find_substitutes"
  | "shift_style"
  | "complete_combination"
  | "lookup_mode";

export interface AskToolPlanStep {
  name: AskToolName;
  topK?: number;
  strength?: StyleStrength;
}

export type RetrievalBackend = "worker" | "local" | "mode-atlas";
export type AskRoutingSource = "llm" | "rules" | "fallback" | "user";

export interface QueryDiagnostics {
  backend: RetrievalBackend;
  elapsedMs: number;
}

export interface IntentResult {
  intent: AskIntent | null;
  matchedIntents?: AskIntent[];
  ingredients: string[];
  targetStyle?: string;
  constraints: string[];
  confidence: number;
  multiIntent: boolean;
  source?: AskRoutingSource;
  toolPlan?: AskToolPlanStep[];
}

export interface QueryState {
  rawInput: string;
  matchedIngredients: string[];
  activeMode: AppMode;
  activeModel: ModelName;
  targetStyle?: string;
  strength?: StyleStrength;
}
