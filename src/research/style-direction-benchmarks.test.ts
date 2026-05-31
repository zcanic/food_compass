import { describe, expect, it } from "vitest";
import { STYLE_SEED_SETS } from "../utils/constants";
import { STYLE_DIRECTION_BENCHMARKS } from "./style-direction-benchmarks";

describe("style direction benchmarks", () => {
  it("keeps benchmark evidence for every exposed style option", () => {
    expect(Object.keys(STYLE_DIRECTION_BENCHMARKS)).toEqual(Object.keys(STYLE_SEED_SETS));
  });

  it("labels benchmark data as evidence instead of recommendation source", () => {
    const japanese = STYLE_DIRECTION_BENCHMARKS.Japanese;

    expect(japanese.source).toBe("direction_arithmetic_full.csv");
    expect(japanese.testCase).toBe("chicken + Japanese");
    expect(japanese.targetHits).toBe(5);
  });
});
