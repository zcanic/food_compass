import { describe, expect, it } from "vitest";
import { IngredientMatcher } from "./matcher";
import type { AliasTable, VocabEntry } from "../types/ingredient";

const vocab: VocabEntry[] = [
  { name: "tomato", nodeIdCooc: 0, nodeIdCore: 0, nodeIdChem: 0 },
  { name: "egg", nodeIdCooc: 1, nodeIdCore: 1, nodeIdChem: 1 },
  { name: "soy_sauce", nodeIdCooc: 2, nodeIdCore: 2, nodeIdChem: 2 },
  { name: "sesame_oil", nodeIdCooc: 3, nodeIdCore: 3, nodeIdChem: 3 },
  { name: "black_pepper", nodeIdCooc: 4, nodeIdCore: 4, nodeIdChem: 4 },
  { name: "rice", nodeIdCooc: 5, nodeIdCore: 5, nodeIdChem: 5 },
];

const aliases: AliasTable = {
  tomato: { zh: ["番茄", "西红柿"], en_alt: ["tomatoes"] },
  egg: { zh: ["鸡蛋", "蛋"], en_alt: ["eggs"] },
  soy_sauce: { zh: ["酱油", "生抽"], en_alt: ["soy sauce"] },
  sesame_oil: { zh: ["香油", "芝麻油"], en_alt: ["sesame oil"] },
};

function createMatcher() {
  const matcher = new IngredientMatcher();
  matcher.init(vocab, aliases);
  return matcher;
}

describe("IngredientMatcher", () => {
  it("normalizes spaces, hyphens, case, and plural aliases", () => {
    const matcher = createMatcher();

    expect(matcher.match("Soy Sauce")).toMatchObject({ kind: "exact", name: "soy_sauce" });
    expect(matcher.match("black-pepper")).toMatchObject({ kind: "exact", name: "black_pepper" });
    expect(matcher.match("tomatoes")).toMatchObject({ kind: "exact", name: "tomato" });
  });

  it("matches common Chinese aliases", () => {
    const matcher = createMatcher();

    expect(matcher.match("番茄")).toMatchObject({ kind: "exact", name: "tomato" });
    expect(matcher.match("鸡蛋")).toMatchObject({ kind: "exact", name: "egg" });
    expect(matcher.match("生抽")).toMatchObject({ kind: "exact", name: "soy_sauce" });
  });

  it("suggests close typo candidates without accepting unrelated words", () => {
    const matcher = createMatcher();

    expect(matcher.match("tomoto")).toMatchObject({
      kind: "fuzzy",
      name: "tomato",
      candidates: ["tomato"],
    });
    expect(matcher.match("priceless")).toMatchObject({
      kind: "fuzzy",
      name: "",
      score: 0,
    });
  });

  it("extracts ingredients from continuous Chinese Ask prompts", () => {
    const matcher = createMatcher();
    const extracted = matcher.extractFromText("我有番茄和鸡蛋，想做得更日式一点，可以加什么？");

    expect(extracted.map((m) => m.name)).toEqual(["tomato", "egg"]);
  });

  it("extracts embedded English ingredient names without matching inside unrelated words", () => {
    const matcher = createMatcher();
    const extracted = matcher.extractFromText("Add soy sauce and sesame oil, but ignore price notes.");

    expect(extracted.map((m) => m.name)).toEqual(["soy_sauce", "sesame_oil"]);
    expect(extracted.find((m) => m.name === "rice")).toBeUndefined();
  });
});
