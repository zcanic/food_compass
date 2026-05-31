/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ModeAtlas } from "../types/mode";
import type { AliasTable, VocabEntry } from "../types/ingredient";
import { EMBEDDING_DIM, MODEL_NAMES, VOCAB_SIZE } from "../utils/constants";

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
