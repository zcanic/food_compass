import type { IntentResult } from "../types/query";
import { routeIntentWithLLM } from "./llm-intent";
import { ruleBasedIntent } from "./intent-rules";

export async function routeIntent(
  query: string,
  options: { signal?: AbortSignal } = {}
): Promise<IntentResult> {
  const ruleResult = ruleBasedIntent(query);
  const llmResult = await routeIntentWithLLM(query, ruleResult, options);
  if (llmResult) return llmResult;

  if (ruleResult && ruleResult.confidence >= 0.7) {
    return { ...ruleResult, source: "rules" };
  }

  return {
    intent: null,
    matchedIntents: [],
    ingredients: [],
    constraints: [],
    confidence: 0.3,
    multiIntent: false,
    source: "fallback",
  };
}
