import { describe, expect, it } from "vitest";
import { buildSkillPlan } from "./skill-plan";
import type { IntentResult } from "../types/query";

const baseIntent = (intent: Partial<IntentResult>): IntentResult => ({
  intent: null,
  ingredients: [],
  constraints: [],
  confidence: 0.7,
  multiIntent: false,
  ...intent,
});

describe("buildSkillPlan", () => {
  it("puts the primary intent first and keeps secondary tools", () => {
    const plan = buildSkillPlan(
      baseIntent({
        intent: "style_shift",
        matchedIntents: ["pairing", "style_shift", "complete_combo"],
        targetStyle: "Japanese",
        multiIntent: true,
      }),
      ["tomato", "egg"]
    );

    expect(plan.map((step) => step.name)).toEqual([
      "shift_style",
      "find_pairings",
      "complete_combination",
    ]);
  });

  it("falls back to core pairings when no intent is understood", () => {
    const plan = buildSkillPlan(baseIntent({ intent: null }), ["tomato"]);

    expect(plan).toEqual([
      {
        name: "find_pairings",
        params: { ingredient: "tomato", model: "core", top_k: 8 },
      },
    ]);
  });

  it("uses an LLM-declared tool order while binding local ingredients and model semantics", () => {
    const plan = buildSkillPlan(
      baseIntent({
        intent: "style_shift",
        matchedIntents: ["pairing", "style_shift", "complete_combo"],
        targetStyle: "Japanese",
        multiIntent: true,
        toolPlan: [
          { name: "find_pairings", topK: 5 },
          { name: "shift_style", strength: "strong", topK: 7 },
          { name: "complete_combination", topK: 6 },
        ],
      }),
      ["tomato", "egg"]
    );

    expect(plan).toEqual([
      {
        name: "find_pairings",
        params: { ingredient: "tomato", model: "cooc", top_k: 5 },
      },
      {
        name: "shift_style",
        params: {
          ingredients: ["tomato", "egg"],
          target_style: "Japanese",
          strength: "strong",
          model: "core",
          top_k: 7,
        },
      },
      {
        name: "complete_combination",
        params: { ingredients: ["tomato", "egg"], model: "core", top_k: 6 },
      },
    ]);
  });
});
