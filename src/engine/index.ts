import type { EmbeddingStore } from "../types/ingredient";
import type { ModelName } from "../types/model";
import type { ModeAtlas, ModeMatch } from "../types/mode";
import type { Recommendation } from "../types/result";
import { loadAllData } from "../data/loader";
import { IngredientMatcher } from "./matcher";
import { ModeLookup } from "./mode-lookup";
import { getVector, topK, averageVec } from "./embedding-store";
import { mixWithStyle } from "./style-shift";
import { constraintFilter } from "./constraint-filter";
import { EMBEDDING_DIM } from "../utils/constants";

let matcher: IngredientMatcher;
let modeLookup: ModeLookup;
let store: EmbeddingStore;
let nameToIndex: Map<string, number>;
let atlas: ModeAtlas;

export async function initEngine(): Promise<void> {
  const data = await loadAllData();
  store = data.embeddings;
  atlas = data.modeAtlas;
  nameToIndex = data.nameToIndex;

  matcher = new IngredientMatcher();
  matcher.init(data.vocab, data.aliases);

  modeLookup = new ModeLookup();
  modeLookup.init(atlas);
}

export function getMatcher(): IngredientMatcher {
  return matcher;
}

export function getStore(): EmbeddingStore {
  return store;
}

export function findPairings(
  ingredient: string,
  model: ModelName = "cooc",
  topKCount = 20
): Recommendation[] {
  const idx = nameToIndex.get(ingredient);
  if (idx === undefined) return [];

  const vec = getVector(store, model, idx);
  const results = topK(store, model, vec, topKCount + 1, new Set([idx]));

  return results.map((r) => ({
    name: matcher.getName(r.index),
    score: r.score,
    model,
  }));
}

export function findSubstitutes(
  ingredient: string,
  topKCount = 20
): Recommendation[] {
  const idx = nameToIndex.get(ingredient);
  if (idx === undefined) return [];

  const chemResults = topK(store, "chem", getVector(store, "chem", idx), topKCount + 1, new Set([idx]));
  const coocIdxSet = new Set<number>();

  const coocTop = topK(store, "cooc", getVector(store, "cooc", idx), topKCount + 1, new Set([idx]));
  coocTop.forEach((r) => coocIdxSet.add(r.index));

  return chemResults.map((r) => {
    const isCooc = coocIdxSet.has(r.index);
    return {
      name: matcher.getName(r.index),
      score: r.score,
      model: "chem" as ModelName,
      crossLabel: isCooc ? ("both" as const) : ("chem-only" as const),
    };
  });
}

export function completeCombination(
  ingredients: string[],
  model: ModelName = "core",
  topKCount = 20
): { recommendations: Recommendation[]; modes: ModeMatch[] } {
  const indices: number[] = [];
  const exclude = new Set<number>();

  for (const ing of ingredients) {
    const idx = nameToIndex.get(ing);
    if (idx !== undefined) {
      indices.push(idx);
      exclude.add(idx);
    }
  }

  if (indices.length === 0) return { recommendations: [], modes: [] };

  const vecs = indices.map((i) => getVector(store, model, i));
  const avg = averageVec(vecs, EMBEDDING_DIM);
  const results = topK(store, model, avg, topKCount, exclude);

  const recipes = results.map((r) => ({
    name: matcher.getName(r.index),
    score: r.score,
    model,
  }));

  const modes = modeLookup.lookupForIngredients(ingredients, model);

  return { recommendations: recipes, modes };
}

export function shiftStyle(
  ingredients: string[],
  targetStyle: string,
  strength: "light" | "medium" | "strong" = "medium",
  model: ModelName = "core",
  topKCount = 20
): Recommendation[] | null {
  const indices: number[] = [];
  const exclude = new Set<number>();

  for (const ing of ingredients) {
    const idx = nameToIndex.get(ing);
    if (idx !== undefined) {
      indices.push(idx);
      exclude.add(idx);
    }
  }

  if (indices.length === 0) return null;

  const vecs = indices.map((i) => getVector(store, model, i));
  const avg = averageVec(vecs, EMBEDDING_DIM);

  const mixed = mixWithStyle(store, model, avg, targetStyle, strength, nameToIndex);
  if (!mixed) return null;

  const results = topK(store, model, mixed, topKCount, exclude);

  return results.map((r) => ({
    name: matcher.getName(r.index),
    score: r.score,
    model,
  }));
}

export function lookupModes(
  ingredient: string,
  model: ModelName = "core"
): ModeMatch[] {
  return modeLookup.lookup(ingredient, model);
}

export function compareModels(
  ingredient: string,
  topKCount = 10
): Record<ModelName, Recommendation[]> {
  const idx = nameToIndex.get(ingredient);
  if (idx === undefined) return { cooc: [], core: [], chem: [] };

  const exclude = new Set([idx]);
  const result: Record<ModelName, Recommendation[]> = {
    cooc: [],
    core: [],
    chem: [],
  };

  for (const model of ["cooc", "core", "chem"] as ModelName[]) {
    const vec = getVector(store, model, idx);
    result[model] = topK(store, model, vec, topKCount + 1, exclude).map(
      (r) => ({
        name: matcher.getName(r.index),
        score: r.score,
        model,
      })
    );
  }

  return result;
}

export { constraintFilter };
