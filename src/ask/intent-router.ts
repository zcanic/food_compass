import type { IntentResult } from "../types/query";
import { ruleBasedIntent } from "./intent-rules";

export async function routeIntent(query: string): Promise<IntentResult> {
  const ruleResult = ruleBasedIntent(query);
  if (ruleResult && ruleResult.confidence >= 0.7) {
    return ruleResult;
  }

  // Fallback: return low-confidence, rely on LLM if available
  return {
    intent: null,
    ingredients: [],
    constraints: [],
    confidence: 0.3,
    multiIntent: false,
  };
}
