import { beforeEach, describe, expect, it } from "vitest";
import {
  addRecentIngredients,
  clearRecentIngredients,
  loadRecentIngredients,
  saveRecentIngredients,
} from "./recent-ingredients";

describe("recent ingredients storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists a versioned recent ingredient list", () => {
    saveRecentIngredients(["tomato", "egg"]);

    expect(loadRecentIngredients()).toEqual(["tomato", "egg"]);
  });

  it("keeps latest unique additions first", () => {
    const result = addRecentIngredients(["tomato", "egg"], ["soy_sauce", "tomato"]);

    expect(result).toEqual(["soy_sauce", "tomato", "egg"]);
  });

  it("ignores malformed storage payloads", () => {
    window.localStorage.setItem("food_compass.recent_ingredients.v1", "{bad json");

    expect(loadRecentIngredients()).toEqual([]);
  });

  it("clears saved recent ingredients", () => {
    saveRecentIngredients(["tomato"]);
    clearRecentIngredients();

    expect(loadRecentIngredients()).toEqual([]);
  });
});
