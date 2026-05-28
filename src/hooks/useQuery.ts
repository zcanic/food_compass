import { useCallback } from "react";
import { useQueryStore } from "../store/query-store";
import {
  findPairings,
  findSubstitutes,
  completeCombination,
  shiftStyle,
  lookupModes,
} from "../engine";
import type { ModelName } from "../types/model";
import type { AppMode, StyleStrength } from "../types/query";

export function useQuery() {
  const store = useQueryStore();

  const runQuery = useCallback(
    (
      mode: AppMode,
      ingredients: string[],
      model: ModelName = "core",
      targetStyle?: string,
      strength?: StyleStrength
    ) => {
      store.setLoading(true);
      store.setMatchedIngredients(ingredients);

      try {
        switch (mode) {
          case "pairing": {
            const results = findPairings(ingredients[0], model);
            store.setResults(results);
            store.setExplanation("这些结果来自" + (model === "cooc" ? "常见搭配" : model === "chem" ? "风味相似" : "综合推荐") + "模型。");
            break;
          }
          case "substitute": {
            const results = findSubstitutes(ingredients[0]);
            store.setResults(results);
            store.setExplanation("这些是风味相似候选，不保证用量和烹饪方式可以直接等价替换。");
            break;
          }
          case "lookup_mode": {
            const modes = lookupModes(ingredients[0], model);
            store.setModes(modes);
            store.setExplanation("在当前模型空间中，该食材常出现在以下食材街区附近。");
            break;
          }
          case "complete_combo": {
            const { recommendations, modes } = completeCombination(ingredients, model);
            store.setResults(recommendations);
            store.setModes(modes);
            store.setExplanation("基于组合向量的最近邻检索结果。");
            break;
          }
          case "style_shift": {
            if (targetStyle) {
              const results = shiftStyle(ingredients, targetStyle, strength ?? "medium", model);
              if (results) {
                store.setResults(results);
                store.setExplanation(`向 ${targetStyle} 风格做了 ${strength ?? "medium"} 强度偏移。目标风格由产品层 seed set 构造，用于早期探索。`);
              }
            }
            break;
          }
          case "ask": {
            // Ask mode is handled separately via the ask panel
            break;
          }
        }
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  return { ...store, runQuery };
}
