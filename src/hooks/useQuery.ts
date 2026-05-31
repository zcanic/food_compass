import { useCallback } from "react";
import { useQueryStore } from "../store/query-store";
import {
  findPairings,
  findSubstitutes,
  completeCombination,
  shiftStyle,
  lookupModes,
  compareModels,
} from "../engine";
import type { ModelName } from "../types/model";
import type { AppMode, StyleStrength } from "../types/query";
import { STYLE_LABELS, STYLE_STRENGTH_LABELS } from "../utils/constants";

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
      store.setHasSearched(true);

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
          case "compare_models": {
            const compared = compareModels(ingredients[0], 8);
            store.setResults([
              ...compared.cooc,
              ...compared.core,
              ...compared.chem,
            ]);
            store.setModes([]);
            store.setExplanation("三模型对比：常见搭配看菜谱共现，综合推荐混合共现和化学信号，风味相似看风味化学近邻。");
            break;
          }
          case "style_shift": {
            if (targetStyle) {
              const results = shiftStyle(ingredients, targetStyle, strength ?? "medium", model);
              if (results) {
                store.setResults(results);
                const styleLabel = STYLE_LABELS[targetStyle] ?? targetStyle;
                const strengthLabel = STYLE_STRENGTH_LABELS[strength ?? "medium"] ?? "中等";
                store.setExplanation(`向 ${styleLabel} 风格做了${strengthLabel}强度偏移。目标风格由产品层代表食材构造，用于早期探索。`);
              } else {
                store.setResults([]);
                store.setExplanation(`暂不支持 ${targetStyle} 风格。请选择面板中已有的风格方向。`);
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
