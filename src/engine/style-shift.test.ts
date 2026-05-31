import { describe, expect, it } from "vitest";
import type { EmbeddingStore } from "../types/ingredient";
import { EMBEDDING_DIM } from "../utils/constants";
import { mixWithStyle } from "./style-shift";

describe("mixWithStyle", () => {
  it("uses product seed-set vector interpolation rather than SLERP direction arithmetic", () => {
    const store = makeStoreWithJapaneseAxis();
    const query = new Float32Array(EMBEDDING_DIM);
    query[0] = 1;

    const mixed = mixWithStyle(
      store,
      "core",
      query,
      "Japanese",
      "medium",
      new Map([
        ["miso", 0],
        ["dashi", 1],
        ["mirin", 2],
        ["soy_sauce", 3],
        ["nori", 4],
      ])
    );

    expect(mixed).not.toBeNull();
    expect(mixed?.[0]).toBeCloseTo(0.83205, 4);
    expect(mixed?.[1]).toBeCloseTo(0.5547, 4);
  });
});

function makeStoreWithJapaneseAxis(): EmbeddingStore {
  const core = new Float32Array(EMBEDDING_DIM * 5);
  for (let row = 0; row < 5; row += 1) {
    core[row * EMBEDDING_DIM + 1] = 1;
  }

  return {
    cooc: new Float32Array(EMBEDDING_DIM * 5),
    core,
    chem: new Float32Array(EMBEDDING_DIM * 5),
    dim: EMBEDDING_DIM,
    count: 5,
  };
}
