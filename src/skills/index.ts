import type { ModelName } from "../types/model";
import type { Recommendation, SkillResult } from "../types/result";
import { STYLE_LABELS, STYLE_STRENGTH_LABELS } from "../utils/constants";
import {
  findPairingsAsync,
  findSubstitutesAsync,
  completeCombinationAsync,
  shiftStyleAsync,
  lookupModes,
  compareModelsAsync,
  constraintFilter,
  getMatcher,
} from "../engine";

export async function executeSkill(
  name: string,
  params: Record<string, unknown>
): Promise<SkillResult> {
  switch (name) {
    case "match_ingredients": {
      const rawTerms = params.raw_terms as string[];
      const matcher = getMatcher();
      const matched = rawTerms.map((term) => {
        const m = matcher.match(term);
        return m.kind === "exact" ? m.name : null;
      }).filter(Boolean) as string[];
      return {
        skillName: "match_ingredients",
        recommendations: [],
        status: matched.length > 0 ? "ok" : "partial",
        message: matched.length > 0 ? undefined : "部分食材未匹配",
      };
    }

    case "find_pairings": {
      const ingredient = params.ingredient as string;
      const model = (params.model as ModelName) ?? "cooc";
      const topK = (params.top_k as number) ?? 20;
      const results = await findPairingsAsync(ingredient, model, topK);
      return { skillName: "find_pairings", recommendations: results, status: "ok" };
    }

    case "find_substitutes": {
      const ingredient = params.ingredient as string;
      const topK = (params.top_k as number) ?? 20;
      const results = await findSubstitutesAsync(ingredient, topK);
      return { skillName: "find_substitutes", recommendations: results, status: "ok" };
    }

    case "complete_combination": {
      const ingredients = params.ingredients as string[];
      const model = (params.model as ModelName) ?? "core";
      const topK = (params.top_k as number) ?? 20;
      const { recommendations, modes } = await completeCombinationAsync(ingredients, model, topK);
      return {
        skillName: "complete_combination",
        recommendations,
        modes: modes.map((m) => ({
          label: m.mode.label,
          model: m.model,
          members: m.neighborsInMode,
        })),
        status: "ok",
      };
    }

    case "shift_style": {
      const ingredients = params.ingredients as string[];
      const targetStyle = params.target_style as string;
      const strength = (params.strength as "light" | "medium" | "strong") ?? "medium";
      const model = (params.model as ModelName) ?? "core";
      const topK = (params.top_k as number) ?? 20;
      const results = await shiftStyleAsync(ingredients, targetStyle, strength, model, topK);
      if (!results) {
        return {
          skillName: "shift_style",
          recommendations: [],
          status: "partial",
          message: `风格 "${targetStyle}" 暂不支持`,
        };
      }
      return {
        skillName: "shift_style",
        recommendations: results,
        status: "ok",
        styleSummary: `向 ${STYLE_LABELS[targetStyle] ?? targetStyle} 风格做了 ${STYLE_STRENGTH_LABELS[strength] ?? strength} 强度向量插值`,
      };
    }

    case "lookup_mode": {
      const ingredient = params.ingredient as string;
      const model = (params.model as ModelName) ?? "core";
      const modes = lookupModes(ingredient, model);
      return {
        skillName: "lookup_mode",
        recommendations: [],
        status: "ok",
        modes: modes.map((m) => ({
          label: m.mode.label,
          model: m.model,
          members: m.neighborsInMode,
        })),
      };
    }

    case "compare_models": {
      const ingredient = params.ingredient as string;
      const topK = (params.top_k as number) ?? 10;
      const compared = await compareModelsAsync(ingredient, topK);
      const allRecs: Recommendation[] = [
        ...compared.cooc,
        ...compared.core,
        ...compared.chem,
      ];
      return {
        skillName: "compare_models",
        recommendations: allRecs,
        status: "ok",
      };
    }

    case "constraint_filter": {
      const candidates = params.candidates as string[];
      const constraints = params.constraints as string[];
      const result = constraintFilter(candidates, constraints);
      return {
        skillName: "constraint_filter",
        recommendations: [],
        status: result.status,
        message: result.message,
      };
    }

    default:
      return {
        skillName: name,
        recommendations: [],
        status: "partial",
        message: `Unknown skill: ${name}`,
      };
  }
}
