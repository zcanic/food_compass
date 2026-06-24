import { useState } from "react";
import { useSearch } from "../../hooks/useSearch";
import { useQueryStore } from "../../store/query-store";
import { IngredientChip } from "./IngredientChip";
import { getMatcher } from "../../engine";
import { displayName } from "../../utils/text";
import { Search, Trash2 } from "lucide-react";
import {
  addRecentIngredients,
  clearRecentIngredients,
  loadRecentIngredients,
  saveRecentIngredients,
} from "../../utils/recent-ingredients";

const SPLIT_RE = /[,\n，、;；]+/;

export function SearchBox() {
  const [recentIngredients, setRecentIngredients] = useState(() => loadRecentIngredients());
  const { query, match, suggestions, search, clear } = useSearch();
  const matchedIngredients = useQueryStore((s) => s.matchedIngredients);
  const setMatchedIngredients = useQueryStore((s) => s.setMatchedIngredients);
  const setResults = useQueryStore((s) => s.setResults);
  const setModes = useQueryStore((s) => s.setModes);
  const setExplanation = useQueryStore((s) => s.setExplanation);
  const setHasSearched = useQueryStore((s) => s.setHasSearched);
  const activeMode = useQueryStore((s) => s.activeMode);
  const terms = query.split(SPLIT_RE).map((s) => s.trim()).filter(Boolean);
  const isBulkInput = terms.length > 1;

  const mergeIngredients = (names: string[]) => {
    const seen = new Set(matchedIngredients);
    const next = [...matchedIngredients];
    const added: string[] = [];
    for (const name of names) {
      if (!seen.has(name)) {
        seen.add(name);
        next.push(name);
        added.push(name);
      }
    }
    setMatchedIngredients(next);
    if (added.length > 0) {
      const nextRecent = addRecentIngredients(recentIngredients, added);
      setRecentIngredients(nextRecent);
      saveRecentIngredients(nextRecent);
    }
    setResults([]);
    setModes([]);
    setExplanation("");
    setHasSearched(false);
  };

  const resolveTerms = (rawTerms: string[]) => {
    const matcher = getMatcher();
    const found: string[] = [];
    const unresolved: string[] = [];

    for (const term of rawTerms) {
      const result = matcher.match(term);
      if (result.kind === "exact") {
        found.push(result.name);
      } else if (result.score >= 0.85 && result.name) {
        found.push(result.name);
      } else {
        unresolved.push(term);
      }
    }

    return { found, unresolved };
  };

  const bulkPreview = isBulkInput ? resolveTerms(terms) : { found: [], unresolved: [] };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBulkInput) {
      const { found } = resolveTerms(terms);
      if (found.length > 0) {
        mergeIngredients(found);
        clear();
      }
      return;
    }

    if (match?.kind === "exact") {
      mergeIngredients([match.name]);
      clear();
      return;
    }

    if (match?.kind === "fuzzy" && match.score >= 0.85 && match.name) {
      mergeIngredients([match.name]);
      clear();
    }
  };

  const handleSelect = (name: string) => {
    mergeIngredients([name]);
    clear();
  };

  const clearSelection = () => {
    setMatchedIngredients([]);
    setResults([]);
    setModes([]);
    setExplanation("");
    setHasSearched(false);
  };

  const clearRecent = () => {
    setRecentIngredients([]);
    clearRecentIngredients();
  };

  return (
    <div className="ingredient-search">
      <form onSubmit={handleSubmit} className="ingredient-search-form">
        <Search className="ingredient-search-icon" size={18} aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder={
            activeMode === "ask"
              ? "描述你想做什么菜或解决什么问题..."
              : "输入食材，如 tomato, soy sauce, 番茄、鸡蛋..."
          }
          className="ingredient-search-input"
        />
      </form>
      <div className="ingredient-search-help">
        Enter 添加；多个食材可用逗号、顿号或换行分隔。
      </div>

      {isBulkInput && (bulkPreview.found.length > 0 || bulkPreview.unresolved.length > 0) && (
        <div
          className="ingredient-search-preview"
        >
          {bulkPreview.found.length > 0 && (
            <div className="ingredient-search-found">
              Enter 将添加：{bulkPreview.found.map(displayName).join("、")}
            </div>
          )}
          {bulkPreview.unresolved.length > 0 && (
            <div className={`ingredient-search-unresolved ${bulkPreview.found.length > 0 ? "has-found" : ""}`}>
              未匹配：{bulkPreview.unresolved.join("、")}
            </div>
          )}
        </div>
      )}

      {!isBulkInput && query.trim() && match?.kind === "fuzzy" && (
        <div
          className="ingredient-suggestions"
        >
          {suggestions.length > 0 && match.score >= 0.75 && (
            <div className="ingredient-suggestions-title">
              你是不是想找...
            </div>
          )}
          {suggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSelect(s)}
              className="ingredient-suggestion"
            >
              {displayName(s)}
            </button>
          ))}
          {match.score < 0.75 && (
            <div className="ingredient-suggestions-empty">
              当前词表暂未覆盖该食材，请尝试英文名。
            </div>
          )}
        </div>
      )}
      {matchedIngredients.length > 0 && (
        <div className="ingredient-selection">
          <div className="ingredient-chip-list">
            {matchedIngredients.map((name) => (
              <IngredientChip
                key={name}
                name={name}
                onRemove={() => {
                  setMatchedIngredients(matchedIngredients.filter((n) => n !== name));
                  setResults([]);
                  setModes([]);
                  setExplanation("");
                  setHasSearched(false);
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="clear-ingredients-button"
          >
            <Trash2 size={13} aria-hidden="true" />
            清空当前选择
          </button>
        </div>
      )}
      {recentIngredients.length > 0 && (
        <div className="recent-ingredients">
          <div className="recent-ingredients-header">
            <div className="recent-ingredients-label">
              最近食材
            </div>
            <button
              type="button"
              onClick={clearRecent}
              className="recent-ingredients-clear"
            >
              清空最近
            </button>
          </div>
          <div className="recent-ingredients-list">
            {recentIngredients.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSelect(name)}
                aria-label={`添加最近食材 ${displayName(name)}`}
                className="recent-ingredient-button"
              >
                {displayName(name)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
