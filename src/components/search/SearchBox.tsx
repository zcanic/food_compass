import { useSearch } from "../../hooks/useSearch";
import { useQueryStore } from "../../store/query-store";
import { IngredientChip } from "./IngredientChip";

export function SearchBox() {
  const { query, match, suggestions, search, clear } = useSearch();
  const matchedIngredients = useQueryStore((s) => s.matchedIngredients);
  const setMatchedIngredients = useQueryStore((s) => s.setMatchedIngredients);
  const activeMode = useQueryStore((s) => s.activeMode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (match?.kind === "exact") {
      const updated = [...matchedIngredients, match.name];
      setMatchedIngredients(updated);
      clear();
    }
  };

  const handleSelect = (name: string) => {
    const updated = [...matchedIngredients, name];
    setMatchedIngredients(updated);
    clear();
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder={
            activeMode === "ask"
              ? "描述你想做什么菜或解决什么问题..."
              : "输入食材名称，如 tomato, soy sauce..."
          }
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: 16,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        />
      </form>
      {suggestions.length > 0 && (
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 8,
            marginTop: 4,
            padding: 8,
            background: "#fff",
          }}
        >
          {match?.kind === "fuzzy" && match.score >= 0.75 && (
            <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
              你是不是想找...
            </div>
          )}
          {suggestions.slice(0, 8).map((s) => (
            <div
              key={s}
              onClick={() => handleSelect(s)}
              style={{
                padding: "6px 12px",
                cursor: "pointer",
                borderRadius: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {s.replace(/_/g, " ")}
            </div>
          ))}
          {(match?.kind === "fuzzy" && match.score < 0.75) && (
            <div style={{ fontSize: 13, color: "#999" }}>
              当前词表暂未覆盖该食材，请尝试英文名。
            </div>
          )}
        </div>
      )}
      {matchedIngredients.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {matchedIngredients.map((name) => (
            <IngredientChip
              key={name}
              name={name}
              onRemove={() => {
                setMatchedIngredients(matchedIngredients.filter((n) => n !== name));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
