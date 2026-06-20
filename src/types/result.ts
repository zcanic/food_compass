import type { ModelName } from "./model";

export interface Recommendation {
  name: string;
  score: number;
  model: ModelName;
  crossLabel?: "both" | "chem-only" | "cooc-only";
}

export interface SkillResult {
  skillName: string;
  recommendations: Recommendation[];
  modes?: { label: string; model: ModelName; members: string[] }[];
  styleSummary?: string;
  status: "ok" | "not_enabled" | "partial";
  message?: string;
}

export interface AskResponse {
  answer: string;
  trace: {
    intent: string;
    ingredients: string[];
    toolsUsed: string[];
    composer?: "llm" | "local" | "fallback";
    llmUsed?: boolean;
    corrections?: string[];
  };
}
