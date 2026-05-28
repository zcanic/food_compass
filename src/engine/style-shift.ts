import type { EmbeddingStore } from "../types/ingredient";
import type { ModelName } from "../types/model";
import { STYLE_SEED_SETS, STYLE_STRENGTH_ALPHA } from "../utils/constants";
import { lerpVectors, normalize } from "../utils/math";
import { getVector, averageVec } from "./embedding-store";
import { EMBEDDING_DIM } from "../utils/constants";

export function computeStyleVector(
  store: EmbeddingStore,
  model: ModelName,
  styleName: string,
  nameToIndex: Map<string, number>
): Float32Array | null {
  const seeds = STYLE_SEED_SETS[styleName];
  if (!seeds) return null;

  const vecs: Float32Array[] = [];
  for (const seed of seeds) {
    const idx = nameToIndex.get(seed);
    if (idx === undefined) continue;
    vecs.push(getVector(store, model, idx));
  }

  if (vecs.length === 0) return null;
  return normalize(averageVec(vecs, EMBEDDING_DIM), EMBEDDING_DIM);
}

export function mixWithStyle(
  store: EmbeddingStore,
  model: ModelName,
  queryVec: Float32Array,
  styleName: string,
  strength: "light" | "medium" | "strong",
  nameToIndex: Map<string, number>
): Float32Array | null {
  const styleVec = computeStyleVector(store, model, styleName, nameToIndex);
  if (!styleVec) return null;

  const alpha = STYLE_STRENGTH_ALPHA[strength] ?? 0.4;
  return lerpVectors(queryVec, styleVec, alpha, EMBEDDING_DIM);
}
