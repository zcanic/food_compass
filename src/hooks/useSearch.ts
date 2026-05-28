import { useState, useCallback } from "react";
import { getMatcher } from "../engine";
import type { SearchMatch } from "../types/ingredient";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [match, setMatch] = useState<SearchMatch | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setMatch(null);
      setSuggestions([]);
      return;
    }
    const matcher = getMatcher();
    if (!matcher) return;
    const result = matcher.match(q);
    setMatch(result);
    setSuggestions(result.kind === "fuzzy" ? result.candidates ?? [] : []);
  }, []);

  const clear = useCallback(() => {
    setQuery("");
    setMatch(null);
    setSuggestions([]);
  }, []);

  return { query, match, suggestions, search, clear };
}
