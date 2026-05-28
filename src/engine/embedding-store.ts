import type { EmbeddingStore } from "../types/ingredient";
import type { ModelName } from "../types/model";
import { EMBEDDING_DIM } from "../utils/constants";
import { dotProduct } from "../utils/math";

export function getVector(
  store: EmbeddingStore,
  model: ModelName,
  index: number
): Float32Array {
  const offset = index * EMBEDDING_DIM;
  return store[model].subarray(offset, offset + EMBEDDING_DIM);
}

export function topK(
  store: EmbeddingStore,
  model: ModelName,
  queryVec: Float32Array,
  k: number,
  excludeIndices: Set<number> = new Set()
): { index: number; score: number }[] {
  const n = store.count;
  const results: { index: number; score: number }[] = [];

  for (let i = 0; i < n; i++) {
    if (excludeIndices.has(i)) continue;
    const vec = getVector(store, model, i);
    const score = dotProduct(queryVec, vec, EMBEDDING_DIM);
    results.push({ index: i, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, k);
}

export function averageVec(
  vecs: Float32Array[],
  dim: number
): Float32Array {
  const avg = new Float32Array(dim);
  for (const v of vecs) {
    for (let i = 0; i < dim; i++) avg[i] += v[i];
  }
  const n = vecs.length;
  for (let i = 0; i < dim; i++) avg[i] /= n;

  let norm = 0;
  for (let i = 0; i < dim; i++) norm += avg[i] * avg[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) avg[i] /= norm;
  }
  return avg;
}
