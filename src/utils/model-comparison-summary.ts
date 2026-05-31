import type { ModelName } from "../types/model";
import type { Recommendation } from "../types/result";

export const COMPARISON_MODELS: ModelName[] = ["cooc", "core", "chem"];

export interface ModelComparisonSummary {
  totalUnique: number;
  sharedNames: string[];
  uniqueCounts: Record<ModelName, number>;
  topByModel: Record<ModelName, string | undefined>;
}

export function summarizeModelComparison(results: Recommendation[]): ModelComparisonSummary {
  const coverage = new Map<string, Set<ModelName>>();
  const topByModel: Record<ModelName, string | undefined> = {
    cooc: undefined,
    core: undefined,
    chem: undefined,
  };
  const uniqueCounts: Record<ModelName, number> = {
    cooc: 0,
    core: 0,
    chem: 0,
  };

  for (const rec of results) {
    topByModel[rec.model] ??= rec.name;
    const models = coverage.get(rec.name) ?? new Set<ModelName>();
    models.add(rec.model);
    coverage.set(rec.name, models);
  }

  const sharedNames: string[] = [];
  for (const [name, models] of coverage.entries()) {
    if (models.size > 1) {
      sharedNames.push(name);
      continue;
    }

    const [model] = Array.from(models);
    uniqueCounts[model] += 1;
  }

  sharedNames.sort((a, b) => {
    const coverageDiff = (coverage.get(b)?.size ?? 0) - (coverage.get(a)?.size ?? 0);
    return coverageDiff || a.localeCompare(b);
  });

  return {
    totalUnique: coverage.size,
    sharedNames,
    uniqueCounts,
    topByModel,
  };
}
