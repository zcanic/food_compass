import type { VocabEntry, AliasTable } from "../types/ingredient";
import type { SearchMatch } from "../types/ingredient";
import { normalizeText, toUnderscore, simplePluralStrip } from "../utils/text";

export class IngredientMatcher {
  private vocab: VocabEntry[] = [];
  private nameToIndex: Map<string, number> = new Map();
  private aliasToCanonical: Map<string, string> = new Map();

  init(vocab: VocabEntry[], aliases: AliasTable) {
    this.vocab = vocab;
    this.nameToIndex.clear();
    this.aliasToCanonical.clear();

    for (let i = 0; i < vocab.length; i++) {
      this.nameToIndex.set(vocab[i].name, i);
    }

    for (const [canonical, aliasEntry] of Object.entries(aliases)) {
      for (const lang of ["zh", "ja", "en_alt"] as const) {
        for (const alias of aliasEntry[lang] ?? []) {
          this.aliasToCanonical.set(alias.toLowerCase(), canonical);
        }
      }
    }
  }

  match(query: string): SearchMatch {
    const normalized = normalizeText(query);

    // 1. Exact vocab match
    const underscored = toUnderscore(normalized);
    if (this.nameToIndex.has(underscored)) {
      return { kind: "exact", name: underscored, score: 1 };
    }

    // 2. Alias table match
    const aliasHit = this.aliasToCanonical.get(normalized);
    if (aliasHit) {
      return { kind: "exact", name: aliasHit, score: 1 };
    }

    // 3. Fuzzy: substring in vocab names
    const candidates: string[] = [];
    for (const v of this.vocab) {
      const display = v.name.replace(/_/g, " ");
      if (display.includes(normalized) || normalized.includes(display)) {
        candidates.push(v.name);
      }
    }

    if (candidates.length === 1) {
      return { kind: "fuzzy", name: candidates[0], score: 0.9, candidates };
    }
    if (candidates.length > 1) {
      return { kind: "fuzzy", name: candidates[0], score: 0.8, candidates };
    }

    // 4. Simple plural strip retry
    const stripped = simplePluralStrip(normalized);
    if (stripped !== normalized) {
      const retry = toUnderscore(stripped);
      if (this.nameToIndex.has(retry)) {
        return { kind: "fuzzy", name: retry, score: 0.85, candidates: [retry] };
      }
    }

    return { kind: "fuzzy", name: "", score: 0, candidates };
  }

  getIndex(name: string): number {
    return this.nameToIndex.get(name) ?? -1;
  }

  getName(index: number): string {
    return this.vocab[index]?.name ?? "";
  }
}
