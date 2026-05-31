import type { AskIntent, IntentResult } from "../types/query";

export interface SkillRequest {
  name: string;
  params: Record<string, unknown>;
}

const INTENT_TO_SKILL: Record<AskIntent, (ingredients: string[], intent: IntentResult) => SkillRequest | null> = {
  pairing: (ingredients) =>
    ingredients.length > 0
      ? {
          name: "find_pairings",
          params: { ingredient: ingredients[0], model: "cooc", top_k: 8 },
        }
      : null,
  substitute: (ingredients) =>
    ingredients.length > 0
      ? {
          name: "find_substitutes",
          params: { ingredient: ingredients[0], top_k: 8 },
        }
      : null,
  style_shift: (ingredients, intent) =>
    ingredients.length > 0
      ? {
          name: "shift_style",
          params: {
            ingredients,
            target_style: intent.targetStyle ?? "Japanese",
            strength: "medium",
            top_k: 8,
          },
        }
      : null,
  complete_combo: (ingredients) =>
    ingredients.length > 0
      ? {
          name: "complete_combination",
          params: { ingredients, model: "core", top_k: 8 },
        }
      : null,
  explain: (ingredients) =>
    ingredients.length > 0
      ? {
          name: "lookup_mode",
          params: { ingredient: ingredients[0], model: "core" },
        }
      : null,
};

export function buildSkillPlan(intent: IntentResult, ingredients: string[]): SkillRequest[] {
  const candidates = intent.matchedIntents?.length
    ? intent.matchedIntents
    : intent.intent
      ? [intent.intent]
      : [];
  const ordered = orderIntents(candidates, intent.intent);
  const requests: SkillRequest[] = [];
  const seen = new Set<string>();

  for (const candidate of ordered) {
    const request = INTENT_TO_SKILL[candidate](ingredients, intent);
    if (!request) continue;
    const key = `${request.name}:${JSON.stringify(request.params)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    requests.push(request);
  }

  if (requests.length === 0 && ingredients.length > 0) {
    requests.push({
      name: "find_pairings",
      params: { ingredient: ingredients[0], model: "core", top_k: 8 },
    });
  }

  return requests;
}

function orderIntents(intents: AskIntent[], primary: AskIntent | null): AskIntent[] {
  const unique = Array.from(new Set(intents));
  if (!primary) return unique;
  return [primary, ...unique.filter((intent) => intent !== primary)];
}
