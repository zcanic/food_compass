import type { ModelName } from "../types/model";

type WorkerMessage =
  | { type: "topk"; id: number; model: ModelName; queryVec: Float32Array; k: number; exclude: number[] }
  | { type: "init"; cooc: ArrayBuffer; core: ArrayBuffer; chem: ArrayBuffer; dim: number; count: number };

type WorkerResponse =
  | { type: "topk_result"; id: number; results: { index: number; score: number }[] }
  | { type: "ready" }
  | { type: "error"; id?: number; message: string };

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
      if (!store) {
        const resp: WorkerResponse = { type: "error", id: e.data.id, message: "Search worker is not initialized" };
        self.postMessage(resp);
        return;
      }

      const excludeSet = new Set(exclude);
      const results: { index: number; score: number }[] = [];

      for (let i = 0; i < count; i++) {
        if (excludeSet.has(i)) continue;
        const offset = i * dim;
        let score = 0;
        for (let j = 0; j < dim; j++) {
          score += queryVec[j] * store[offset + j];
        }
        results.push({ index: i, score });
      }

      results.sort((a, b) => b.score - a.score);
      const resp: WorkerResponse = {
        type: "topk_result",
        id: e.data.id,
        results: results.slice(0, k),
      };
      self.postMessage(resp);
      break;
    }
  }
};
