import { describe, expect, it } from "vitest";
import { summarizeModelComparison } from "./model-comparison-summary";
import type { Recommendation } from "../types/result";

const rec = (
  name: string,
  model: Recommendation["model"],
  score = 0.9
): Recommendation => ({
  name,
  model,
  score,
});

describe("summarizeModelComparison", () => {
  it("counts shared and model-unique recommendations", () => {
    const summary = summarizeModelComparison([
      rec("basil", "cooc"),
      rec("garlic", "cooc"),
      rec("basil", "core"),
      rec("soy_sauce", "core"),
      rec("basil", "chem"),
      rec("vanilla", "chem"),
    ]);

    expect(summary.totalUnique).toBe(4);
    expect(summary.sharedNames).toEqual(["basil"]);
    expect(summary.uniqueCounts).toEqual({
      cooc: 1,
      core: 1,
      chem: 1,
    });
    expect(summary.topByModel).toEqual({
      cooc: "basil",
      core: "basil",
      chem: "basil",
    });
  });

  it("orders shared names by coverage before name", () => {
    const summary = summarizeModelComparison([
      rec("zaatar", "cooc"),
      rec("zaatar", "core"),
      rec("basil", "cooc"),
      rec("basil", "core"),
      rec("basil", "chem"),
      rec("anise", "core"),
      rec("anise", "chem"),
    ]);

    expect(summary.sharedNames).toEqual(["basil", "anise", "zaatar"]);
  });
});
