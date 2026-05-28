export interface Ingredient {
  name: string;
  nodeIdCooc: number;
  nodeIdCore: number;
  nodeIdChem: number;
}

export interface EmbeddingStore {
  cooc: Float32Array;
  core: Float32Array;
  chem: Float32Array;
  dim: number;
  count: number;
}

export interface VocabEntry {
  name: string;
  nodeIdCooc: number;
  nodeIdCore: number;
  nodeIdChem: number;
}

export interface AliasTable {
  [canonical: string]: {
    zh?: string[];
    ja?: string[];
    en_alt?: string[];
  };
}

export type SearchMatch =
  | { kind: "exact"; name: string; score: 1 }
  | { kind: "fuzzy"; name: string; score: number; candidates: string[] };
