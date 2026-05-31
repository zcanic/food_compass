import { describe, expect, it } from "vitest";
import { ModeLookup } from "./mode-lookup";
import type { ModeAtlas } from "../types/mode";

const atlas: ModeAtlas = {
  cooc: [
    {
      modeId: "wide/M0",
      kind: "continuous",
      property: "cuisine_East_Asian",
      label: "Wide pantry",
      nMembers: 25,
      propZMean: 0.8,
      members: ["soy sauce", "ginger", "scallion"],
    },
    {
      modeId: "multi/M0",
      kind: "factor",
      property: "factor_2",
      label: "Multi ingredient pantry",
      nMembers: 40,
      propZMean: 0.9,
      members: ["soy sauce", "ginger", "tofu", "scallion"],
    },
    {
      modeId: "specific/M0",
      kind: "factor",
      property: "factor_1",
      label: "Specific umami sauces",
      nMembers: 8,
      propZMean: 1.2,
      members: ["soy sauce", "miso", "dashi"],
    },
  ],
  core: [],
  chem: [],
};

describe("ModeLookup", () => {
  it("matches canonical underscore names against atlas display members", () => {
    const lookup = new ModeLookup();
    lookup.init(atlas);

    const matches = lookup.lookup("soy_sauce", "cooc");

    expect(matches).toHaveLength(3);
    expect(matches[0].mode.label).toBe("Specific umami sauces");
    expect(matches[0].neighborsInMode).toEqual(["miso", "dashi"]);
    expect(matches[1].mode.label).toBe("Wide pantry");
  });

  it("ranks combination modes by matched ingredient count before specificity", () => {
    const lookup = new ModeLookup();
    lookup.init(atlas);

    const matches = lookup.lookupForIngredients(["soy_sauce", "tofu"], "cooc");

    expect(matches[0].mode.label).toBe("Multi ingredient pantry");
    expect(matches[0].matchedIngredients).toEqual(["soy_sauce", "tofu"]);
    expect(matches[0].neighborsInMode).toEqual(["ginger", "scallion"]);
  });

  it("returns no modes before initialization", () => {
    const lookup = new ModeLookup();

    expect(lookup.lookup("soy_sauce", "cooc")).toEqual([]);
  });
});
