import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STYLE_SEED_SETS } from "../utils/constants";
import {
  STYLE_DIRECTION_BENCHMARKS,
  STYLE_ORTHOGONAL_BENCHMARKS,
} from "./style-direction-benchmarks";

describe("style direction benchmarks", () => {
  it("keeps benchmark evidence for every exposed style option", () => {
    expect(Object.keys(STYLE_DIRECTION_BENCHMARKS)).toEqual(Object.keys(STYLE_SEED_SETS));
    expect(Object.keys(STYLE_ORTHOGONAL_BENCHMARKS)).toEqual(Object.keys(STYLE_SEED_SETS));
  });

  it("labels benchmark data as evidence instead of recommendation source", () => {
    const japanese = STYLE_DIRECTION_BENCHMARKS.Japanese;

    expect(japanese.source).toBe("direction_arithmetic_full.csv");
    expect(japanese.testCase).toBe("chicken + Japanese");
    expect(japanese.targetHits).toBe(5);
  });

  it("labels orthogonal benchmark data as evidence", () => {
    const japanese = STYLE_ORTHOGONAL_BENCHMARKS.Japanese;

    expect(japanese.source).toBe("direction_orthogonal.csv");
    expect(japanese.testCase).toBe("chicken + Japanese");
    expect(japanese.meanSnr).toBeGreaterThan(0.5);
  });

  it("matches the generated static benchmark asset", () => {
    const generated = readJSON<StyleBenchmarkAsset[]>("style_direction_benchmarks.json");
    const runtime = Object.values(STYLE_DIRECTION_BENCHMARKS).map((entry) => ({
      style: entry.style,
      testCase: entry.testCase,
      seed: entry.seed,
      benchmarkDirection: entry.benchmarkDirection,
      model: entry.model,
      angleDeg: entry.angleDeg,
      targetHits: entry.targetHits,
      totalHits: entry.totalHits,
    }));

    expect(runtime).toEqual(generated.map((entry) => ({
      style: entry.style,
      testCase: entry.testCase,
      seed: entry.seed,
      benchmarkDirection: entry.benchmarkDirection,
      model: entry.model,
      angleDeg: entry.angleDeg,
      targetHits: entry.targetHits,
      totalHits: entry.totalHits,
    })));
  });

  it("matches the generated orthogonal benchmark asset", () => {
    const generated = readJSON<OrthogonalBenchmarkAsset[]>("style_orthogonal_benchmarks.json");
    const runtime = Object.values(STYLE_ORTHOGONAL_BENCHMARKS).map((entry) => ({
      style: entry.style,
      testCase: entry.testCase,
      seed: entry.seed,
      benchmarkDirection: entry.benchmarkDirection,
      model: entry.model,
      targetHits: entry.targetHits,
      totalHits: entry.totalHits,
      meanSnr: entry.meanSnr,
      meanCosToSeed: entry.meanCosToSeed,
    }));

    expect(runtime).toEqual(generated.map((entry) => ({
      style: entry.style,
      testCase: entry.testCase,
      seed: entry.seed,
      benchmarkDirection: entry.benchmarkDirection,
      model: entry.model,
      targetHits: entry.targetHits,
      totalHits: entry.totalHits,
      meanSnr: entry.meanSnr,
      meanCosToSeed: entry.meanCosToSeed,
    })));
  });
});

function readJSON<T>(filename: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), "public", "data", filename), "utf-8")) as T;
}

interface StyleBenchmarkAsset {
  style: string;
  testCase: string;
  seed: string;
  benchmarkDirection: string;
  model: "cooc" | "core" | "chem";
  angleDeg: number;
  targetHits: number;
  totalHits: number;
}

interface OrthogonalBenchmarkAsset {
  style: string;
  testCase: string;
  seed: string;
  benchmarkDirection: string;
  model: "cooc" | "core" | "chem";
  targetHits: number;
  totalHits: number;
  meanSnr: number;
  meanCosToSeed: number;
}
