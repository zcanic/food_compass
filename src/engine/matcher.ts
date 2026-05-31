import type { VocabEntry, AliasTable } from "../types/ingredient";
import type { SearchMatch } from "../types/ingredient";
import { normalizeText, toUnderscore, simplePluralStrip } from "../utils/text";

export interface TextIngredientMatch {
  name: string;
  term: string;
  score: number;
  position: number;
}

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
          this.aliasToCanonical.set(normalizeText(alias), canonical);
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
      if (
        display.includes(normalized) ||
        v.name.includes(underscored) ||
        containsTerm(normalized, display) ||
        containsTerm(normalized, v.name)
      ) {
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

  extractFromText(text: string, max = 8): TextIngredientMatch[] {
    const normalized = normalizeText(text);
    const hits = new Map<string, TextIngredientMatch>();
    const addHit = (name: string, term: string, score: number) => {
      const position = Math.max(0, normalized.indexOf(term));
      const existing = hits.get(name);
      if (!existing || score > existing.score || term.length > existing.term.length) {
        hits.set(name, { name, term, score, position });
      }
    };

    const roughTerms = normalized
      .split(/[\s,，、;；。.!?？]+/)
      .map((part) => part.trim())
      .filter(Boolean);

    for (const term of roughTerms) {
      const matched = this.match(term);
      if (matched.name && matched.score >= 0.85) {
        addHit(matched.name, term, matched.score);
      }
    }

    const aliasEntries = [...this.aliasToCanonical.entries()].sort(
      (a, b) => b[0].length - a[0].length
    );

    for (const [alias, canonical] of aliasEntries) {
      if (alias.length < 2) continue;
      if (containsTerm(normalized, alias)) {
        addHit(canonical, alias, 1);
      }
    }

    for (const v of this.vocab) {
      const display = v.name.replace(/_/g, " ");
      if (display.length < 3) continue;
      if (containsTerm(normalized, display) || containsTerm(normalized, v.name)) {
        addHit(v.name, display, 0.95);
      }
    }

    return [...hits.values()]
      .sort((a, b) => a.position - b.position || b.score - a.score || b.term.length - a.term.length)
      .slice(0, max);
  }

  getIndex(name: string): number {
    return this.nameToIndex.get(name) ?? -1;
  }

  getName(index: number): string {
    return this.vocab[index]?.name ?? "";
  }
}

function containsTerm(text: string, term: string): boolean {
  if (!term) return false;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (/^[a-z0-9_ ]+$/i.test(term)) {
    const pattern = new RegExp(`(^|[^a-z0-9_])${escaped}([^a-z0-9_]|$)`, "i");
    return pattern.test(text);
  }
  return text.includes(term);
}
