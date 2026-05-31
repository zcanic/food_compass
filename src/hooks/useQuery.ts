import { useCallback } from "react";
import { useQueryStore } from "../store/query-store";
import {
  findPairingsAsync,
  findSubstitutesAsync,
  completeCombinationAsync,
  shiftStyleAsync,
  lookupModes,
  compareModelsAsync,
  getSearchBackend,
} from "../engine";
import type { ModelName } from "../types/model";
import type { AppMode, StyleStrength } from "../types/query";
import { STYLE_LABELS, STYLE_STRENGTH_LABELS } from "../utils/constants";

export function useQuery() {
  const store = useQueryStore();

  const runQuery = useCallback(
    async (
      mode: AppMode,
      ingredients: string[],
      model: ModelName = "core",
      targetStyle?: string,
      strength?: StyleStrength
    ) => {
      const startedAt = readNow();
      store.setLoading(true);
      store.setMatchedIngredients(ingredients);
      store.setHasSearched(true);
      store.setDiagnostics(null);

      try {
        switch (mode) {
          case "pairing": {
            const results = await findPairingsAsync(ingredients[0], model);
            store.setResults(results);
            store.setExplanation("这些结果来自" + (model === "cooc" ? "常见搭配" : model === "chem" ? "风味相似" : "综合推荐") + "模型。");
            break;
          }
          case "substitute": {
            const results = await findSubstitutesAsync(ingredients[0]);
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
            const { recommendations, modes } = await completeCombinationAsync(ingredients, model);
            store.setResults(recommendations);
            store.setModes(modes);
            store.setExplanation("基于组合向量的最近邻检索结果。");
            break;
          }
          case "compare_models": {
            const compared = await compareModelsAsync(ingredients[0], 8);
            store.setResults([
              ...compared.cooc,
              ...compared.core,
              ...compared.chem,
            ]);
            store.setModes((["cooc", "core", "chem"] as ModelName[]).flatMap((m) =>
              lookupModes(ingredients[0], m).slice(0, 2)
            ));
            store.setExplanation("三模型对比：常见搭配看菜谱共现，综合推荐混合共现和化学信号，风味相似看风味化学近邻。");
            break;
          }
          case "style_shift": {
            if (targetStyle) {
              const results = await shiftStyleAsync(ingredients, targetStyle, strength ?? "medium", model);
              if (results) {
                store.setResults(results);
                const styleLabel = STYLE_LABELS[targetStyle] ?? targetStyle;
                const strengthLabel = STYLE_STRENGTH_LABELS[strength ?? "medium"] ?? "中等";
                store.setExplanation(`向 ${styleLabel} 风格做了${strengthLabel}强度向量插值。目标风格由产品层代表食材构造，用于早期探索，不是论文完整方向系统。`);
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
      } catch (error) {
        store.setResults([]);
        store.setModes([]);
        store.setExplanation(error instanceof Error ? `检索失败：${error.message}` : "检索失败。");
      } finally {
        store.setDiagnostics({
          backend: mode === "lookup_mode" ? "mode-atlas" : getSearchBackend(),
          elapsedMs: Math.max(0, Math.round(readNow() - startedAt)),
        });
        store.setLoading(false);
      }
    },
    [store]
  );

  return { ...store, runQuery };
}

function readNow(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}
