import { EMBEDDING_DIM } from "../utils/constants";

type WorkerMessage =
  | { type: "topk"; model: string; queryVec: Float32Array; k: number; exclude: number[] }
  | { type: "init"; cooc: ArrayBuffer; core: ArrayBuffer; chem: ArrayBuffer; dim: number; count: number };

type WorkerResponse =
  | { type: "topk_result"; results: { index: number; score: number }[] }
  | { type: "ready" };

let coocData: Float32Array;
let coreData: Float32Array;
let chemData: Float32Array;
let dim: number;
let count: number;

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  switch (e.data.type) {
    case "init": {
      const { cooc, core, chem, dim: d, count: c } = e.data;
      coocData = new Float32Array(cooc);
      coreData = new Float32Array(core);
      chemData = new Float32Array(chem);
      dim = d;
      count = c;
      const resp: WorkerResponse = { type: "ready" };
      self.postMessage(resp);
      break;
    }
    case "topk": {
      const { model, queryVec, k, exclude } = e.data;
      const store = model === "cooc" ? coocData : model === "core" ? coreData : chemData;
      const excludeSet = new Set(exclude);
      const results: { index: number; score: number }[] = [];

      for (let i = 0; i < count; i++) {
        if (excludeSet.has(i)) continue;
        const offset = i * EMBEDDING_DIM;
        let score = 0;
        for (let j = 0; j < dim; j++) {
          score += queryVec[j] * store[offset + j];
        }
        results.push({ index: i, score });
      }

      results.sort((a, b) => b.score - a.score);
      const resp: WorkerResponse = {
        type: "topk_result",
        results: results.slice(0, k),
      };
      self.postMessage(resp);
      break;
    }
  }
};
