/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ModeAtlas } from "../types/mode";
import type { AliasTable, VocabEntry } from "../types/ingredient";
import type { ModelName } from "../types/model";
import { EMBEDDING_DIM, MODEL_NAMES, STYLE_SEED_SETS, VOCAB_SIZE } from "../utils/constants";

const DATA_ROOT = join(process.cwd(), "public", "data");

describe("preprocessed static data assets", () => {
  it("keeps vocab and embedding binaries aligned", () => {
    const vocab = readJSON<VocabEntry[]>("vocab.json");

    expect(vocab).toHaveLength(VOCAB_SIZE);
    expect(new Set(vocab.map((entry) => entry.name)).size).toBe(VOCAB_SIZE);

    for (const model of MODEL_NAMES) {
      const bytes = readBytes(`${model}.f32.bin`);
      expect(bytes.byteLength).toBe(VOCAB_SIZE * EMBEDDING_DIM * Float32Array.BYTES_PER_ELEMENT);
    }
  });

  it("ships mode atlas entries for all sibling models", () => {
    const atlas = readJSON<ModeAtlas>("mode_atlas.json");

    for (const model of MODEL_NAMES) {
      expect(atlas[model].length).toBeGreaterThan(100);
      expect(atlas[model].every((mode) => mode.members.length > 0)).toBe(true);
    }
  });

  it("ships mode atlas coverage summaries for product limits", () => {
    const atlas = readJSON<ModeAtlas>("mode_atlas.json");
    const summaries = readJSON<ModeAtlasSummaryAsset[]>("mode_atlas_summary.json");

    expect(summaries.map((entry) => entry.model)).toEqual(MODEL_NAMES);
    expect(summaries.every((entry) => entry.totalModes > 100)).toBe(true);
    expect(summaries.some((entry) => entry.model === "chem" && entry.largestMode.nMembers > 250)).toBe(true);
    for (const summary of summaries) {
      const modes = atlas[summary.model];
      const kindCounts = modes.reduce<Record<string, number>>((counts, mode) => {
        counts[mode.kind] = (counts[mode.kind] ?? 0) + 1;
        return counts;
      }, {});
      const largest = [...modes].sort((a, b) => b.nMembers - a.nMembers)[0];

      expect(summary.totalModes).toBe(modes.length);
      expect(summary.kindCounts).toEqual(kindCounts);
      expect(summary.largestMode).toEqual({
        label: largest.label,
        nMembers: largest.nMembers,
        kind: largest.kind,
        property: largest.property,
      });
    }
  });

  it("ships paper-derived sensory axes for every sibling model", () => {
    const axes = readJSON<SensoryAxisAsset[]>("sensory_axes.json");

    expect(axes.map((axis) => axis.model)).toEqual(MODEL_NAMES);
    expect(axes.every((axis) => axis.axisLabel.length > 0)).toBe(true);
    expect(axes.every((axis) => axis.poleA.topIngredients.length === 5)).toBe(true);
  });

  it("ships direction arithmetic benchmark summaries for supported style controls", () => {
    const benchmarks = readJSON<StyleBenchmarkAsset[]>("style_direction_benchmarks.json");

    expect(benchmarks).toHaveLength(9);
    expect(benchmarks.some((entry) => entry.style === "Japanese" && entry.targetHits === 5)).toBe(true);
    expect(benchmarks.every((entry) => entry.totalHits === 5)).toBe(true);
  });

  it("ships orthogonal direction benchmark summaries for supported style controls", () => {
    const benchmarks = readJSON<OrthogonalBenchmarkAsset[]>("style_orthogonal_benchmarks.json");

    expect(benchmarks).toHaveLength(9);
    expect(benchmarks.some((entry) => entry.style === "Japanese" && entry.meanSnr > 0.5)).toBe(true);
    expect(benchmarks.every((entry) => entry.totalHits === 5)).toBe(true);
  });

  it("ships product style seed sets with canonical vocab seeds", () => {
    const vocab = new Set(readJSON<VocabEntry[]>("vocab.json").map((entry) => entry.name));
    const seedSets = readJSON<Record<string, string[]>>("style_seed_sets.json");

    expect(seedSets).toEqual(STYLE_SEED_SETS);
    expect(Object.keys(seedSets)).toHaveLength(9);
    expect(Object.values(seedSets).every((seeds) => seeds.length >= 4)).toBe(true);
    expect(Object.values(seedSets).flat().every((seed) => vocab.has(seed))).toBe(true);
  });

  it("ships WEAT association checks including skipped limitations", () => {
    const checks = readJSON<WeatCheckAsset[]>("weat_checks.json");

    expect(checks.length).toBeGreaterThan(5);
    expect(checks.some((entry) => entry.test === "Health Halo" && entry.skipped)).toBe(true);
    expect(checks.some((entry) => entry.test === "Sweet vs Savory" && entry.effectSizeD !== null)).toBe(true);
  });

  it("ships cross-modal validation rows from external USDA and ChemFlavor sources", () => {
    const metrics = readJSON<CrossModalAsset[]>("cross_modal_evidence.json");

    expect(metrics.length).toBeGreaterThan(50);
    expect(metrics.some((entry) => entry.source === "USDA" && entry.dimension === "usda_fiber_g")).toBe(true);
    expect(metrics.some((entry) => entry.source === "CF" && entry.dimension === "cf_bitter")).toBe(true);
  });

  it("ships linear probe metrics for cuisine and product-boundary evidence", () => {
    const metrics = readJSON<LinearProbeAsset[]>("linear_probe_metrics.json");

    expect(metrics).toHaveLength(20);
    expect(metrics.some((entry) => entry.model === "core" && entry.dimension === "cuisine_South_Asian" && entry.f1Mean > 0.95)).toBe(true);
    expect(metrics.some((entry) => entry.dimension === "nova_level" && entry.f1Mean < 0.7)).toBe(true);
  });

  it("ships continuous probe metrics for flavor and nutrition interpretability", () => {
    const metrics = readJSON<ContinuousProbeAsset[]>("continuous_probe_metrics.json");

    expect(metrics.length).toBeGreaterThan(50);
    expect(metrics.some((entry) => entry.model === "core" && entry.dimension === "cf_sweet" && entry.rhoCvMean > 0.45)).toBe(true);
    expect(metrics.some((entry) => entry.model === "cooc" && entry.dimension === "usda_protein_fat_ratio")).toBe(true);
  });

  it("keeps aliases pointed at canonical vocab names", () => {
    const vocab = new Set(readJSON<VocabEntry[]>("vocab.json").map((entry) => entry.name));
    const aliases = readJSON<AliasTable>("aliases_zh_en.json");

    expect(Object.keys(aliases).length).toBeGreaterThan(10);
    expect(Object.keys(aliases).every((name) => vocab.has(name))).toBe(true);
  });
});

function readJSON<T>(filename: string): T {
  return JSON.parse(readFileSync(assetPath(filename), "utf-8")) as T;
}

function readBytes(filename: string): Buffer {
  return readFileSync(assetPath(filename));
}

function assetPath(filename: string): string {
  return join(DATA_ROOT, filename);
}

interface SensoryAxisAsset {
  model: ModelName;
  axisLabel: string;
  poleA: { topIngredients: string[] };
}

interface ModeAtlasSummaryAsset {
  model: ModelName;
  totalModes: number;
  kindCounts: Record<string, number>;
  largestMode: { label: string; nMembers: number; kind: string; property: string };
}

interface StyleBenchmarkAsset {
  style: string;
  targetHits: number;
  totalHits: number;
}

interface OrthogonalBenchmarkAsset {
  style: string;
  meanSnr: number;
  totalHits: number;
}

interface WeatCheckAsset {
  test: string;
  effectSizeD: number | null;
  skipped: boolean;
}

interface CrossModalAsset {
  dimension: string;
  source: string;
}

interface LinearProbeAsset {
  model: ModelName;
  dimension: string;
  f1Mean: number;
}

interface ContinuousProbeAsset {
  model: ModelName;
  dimension: string;
  rhoCvMean: number;
}
