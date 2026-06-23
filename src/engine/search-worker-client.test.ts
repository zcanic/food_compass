import { describe, expect, it } from "vitest";
import type { EmbeddingStore } from "../types/ingredient";
import { topK } from "./embedding-store";
import { consumeSearchTimings, resetSearchTimings, topKWorkerOrLocal } from "./search-worker-client";

describe("topKWorkerOrLocal", () => {
  it("falls back to local topK when no worker client is ready", async () => {
    resetSearchTimings();
    const store: EmbeddingStore = {
      cooc: new Float32Array([1, 0, 0, 1, 0.7, 0.7]),
      core: new Float32Array([1, 0, 0, 1, 0.7, 0.7]),
      chem: new Float32Array([1, 0, 0, 1, 0.7, 0.7]),
      dim: 2,
      count: 3,
    };
    const query = new Float32Array([1, 0]);
    const exclude = new Set([0]);

    const expected = topK(store, "cooc", query, 2, exclude);
    const actual = await topKWorkerOrLocal(store, "cooc", query, 2, exclude);

    expect(actual).toEqual(expected);
    expect(consumeSearchTimings()).toEqual([
      expect.objectContaining({ backend: "local", elapsedMs: expect.any(Number) }),
    ]);
    expect(consumeSearchTimings()).toEqual([]);
  });
});
