import type { AskIntent, AskToolName, AskToolPlanStep, IntentResult } from "../types/query";

export interface SkillRequest {
  name: AskToolName;
  params: Record<string, unknown>;
}

const INTENT_TO_TOOL: Record<AskIntent, AskToolName> = {
  pairing: "find_pairings",
  substitute: "find_substitutes",
  style_shift: "shift_style",
  complete_combo: "complete_combination",
  explain: "lookup_mode",
};

export function buildSkillPlan(intent: IntentResult, ingredients: string[]): SkillRequest[] {
  const declaredPlan = intent.toolPlan
    ? buildDeclaredPlan(intent.toolPlan, intent, ingredients)
    : [];
  if (declaredPlan.length > 0) return declaredPlan;

  const candidates = intent.matchedIntents?.length
    ? intent.matchedIntents
    : intent.intent
      ? [intent.intent]
      : [];
  const ordered = orderIntents(candidates, intent.intent);
  const fallbackPlan = buildRequests(ordered.map((candidate) => INTENT_TO_TOOL[candidate]), intent, ingredients);

  if (fallbackPlan.length > 0) return fallbackPlan;
  if (ingredients.length === 0) return [];

  return [{
    name: "find_pairings",
    params: { ingredient: ingredients[0], model: "core", top_k: 8 },
  }];
}

function buildDeclaredPlan(
  declaredPlan: AskToolPlanStep[],
  intent: IntentResult,
  ingredients: string[]
): SkillRequest[] {
  const allowedTools = new Set(
    [...(intent.intent ? [intent.intent] : []), ...(intent.matchedIntents ?? [])]
      .map((candidate) => INTENT_TO_TOOL[candidate])
  );
  const safeSteps = declaredPlan.filter((step) => allowedTools.has(step.name));
  if (Array.from(allowedTools).some((tool) => !safeSteps.some((step) => step.name === tool))) return [];

  return buildRequests(safeSteps.map((step) => step.name), intent, ingredients, safeSteps);
}

function buildRequests(
  tools: AskToolName[],
  intent: IntentResult,
  ingredients: string[],
  declarations: AskToolPlanStep[] = []
): SkillRequest[] {
  if (ingredients.length === 0) return [];

  const declarationByTool = new Map(declarations.map((step) => [step.name, step]));
  const requests: SkillRequest[] = [];
  const seen = new Set<AskToolName>();

  for (const tool of tools) {
    if (seen.has(tool)) continue;
    const request = buildRequest(tool, ingredients, intent, declarationByTool.get(tool));
    if (!request) continue;
    seen.add(tool);
    requests.push(request);
  }

  return requests;
}

function buildRequest(
  tool: AskToolName,
  ingredients: string[],
  intent: IntentResult,
  declaration?: AskToolPlanStep
): SkillRequest | null {
  const topK = declaration?.topK ?? 8;

  switch (tool) {
    case "find_pairings":
      return {
        name: tool,
        params: { ingredient: ingredients[0], model: "cooc", top_k: topK },
      };
    case "find_substitutes":
      return {
        name: tool,
        params: { ingredient: ingredients[0], model: "chem", top_k: topK },
      };
    case "shift_style":
      return {
        name: tool,
        params: {
          ingredients,
          target_style: intent.targetStyle ?? "Japanese",
          strength: declaration?.strength ?? "medium",
          model: "core",
          top_k: topK,
        },
      };
    case "complete_combination":
      return {
        name: tool,
        params: { ingredients, model: "core", top_k: topK },
      };
    case "lookup_mode":
      return {
        name: tool,
        params: { ingredient: ingredients[0], model: "core" },
      };
  }
}

function orderIntents(intents: AskIntent[], primary: AskIntent | null): AskIntent[] {
  const unique = Array.from(new Set(intents));
  if (!primary) return unique;
  return [primary, ...unique.filter((intent) => intent !== primary)];
}
