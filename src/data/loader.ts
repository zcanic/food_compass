import type { VocabEntry, EmbeddingStore, AliasTable } from "../types/ingredient";
import type { ModeAtlas } from "../types/mode";
import { EMBEDDING_DIM } from "../utils/constants";

const DATA_ROOT = "/data/";

interface LoadedData {
  vocab: VocabEntry[];
  embeddings: EmbeddingStore;
  modeAtlas: ModeAtlas;
  aliases: AliasTable;
  nameToIndex: Map<string, number>;
}

let cached: LoadedData | null = null;

export async function loadAllData(): Promise<LoadedData> {
  if (cached) return cached;

  const [vocab, coocBin, coreBin, chemBin, modeAtlas, aliases] = await Promise.all([
    fetchJSON<VocabEntry[]>(`${DATA_ROOT}vocab.json`),
    fetchBinary(`${DATA_ROOT}cooc.f32.bin`),
    fetchBinary(`${DATA_ROOT}core.f32.bin`),
    fetchBinary(`${DATA_ROOT}chem.f32.bin`),
    fetchJSON<ModeAtlas>(`${DATA_ROOT}mode_atlas.json`),
    fetchJSON<AliasTable>(`${DATA_ROOT}aliases_zh_en.json`).catch(() => ({})),
  ]);

  const count = vocab.length;
  const embeddings: EmbeddingStore = {
    cooc: new Float32Array(coocBin),
    core: new Float32Array(coreBin),
    chem: new Float32Array(chemBin),
    dim: EMBEDDING_DIM,
    count,
  };

  const nameToIndex = new Map<string, number>();
  vocab.forEach((v, i) => nameToIndex.set(v.name, i));

  cached = { vocab, embeddings, modeAtlas, aliases, nameToIndex };
  return cached;
}

export function getCached(): LoadedData | null {
  return cached;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.arrayBuffer();
}
