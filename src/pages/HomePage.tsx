import { SearchBox } from "../components/search/SearchBox";
import { ModeTabs } from "../components/mode-selector/ModeTabs";
import { ModelToggle } from "../components/mode-selector/ModelToggle";
import { ResultList } from "../components/results/ResultList";
import { ModePanel } from "../components/mode-panel/ModePanel";
import { StyleShiftPanel } from "../components/style-shift/StyleShiftPanel";
import { AskPanel } from "../components/ask-panel/AskPanel";
import { useQueryStore } from "../store/query-store";
import { useQuery } from "../hooks/useQuery";
import type { AppMode } from "../types/query";
import type { ModelName } from "../types/model";

export function HomePage() {
  const store = useQueryStore();
  const { runQuery } = useQuery();

  const handleSearch = () => {
    const ingredients = store.matchedIngredients;
    if (ingredients.length === 0) return;

    if (store.activeMode === "ask") return; // handled by AskPanel

    runQuery(
      store.activeMode,
      ingredients,
      store.activeModel,
      store.targetStyle || undefined,
      store.strength
    );
  };

  const handleModeChange = (mode: AppMode) => {
    store.setActiveMode(mode);
    if (mode === "lookup_mode") {
      store.setResults([]);
    }
    if (mode === "style_shift") {
      store.setTargetStyle("Japanese");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 16px" }}>
        Flavor Compass · 食材罗盘
      </h1>

      <SearchBox />
      <ModeTabs active={store.activeMode} onChange={handleModeChange} />

      {store.activeMode !== "ask" && (
        <ModelToggle active={store.activeModel} onChange={(m: ModelName) => store.setActiveModel(m)} />
      )}

      {store.activeMode === "style_shift" && (
        <StyleShiftPanel
          selectedStyle={store.targetStyle}
          strength={store.strength}
          onChangeStyle={(s) => store.setTargetStyle(s)}
          onChangeStrength={(s) => store.setStrength(s)}
        />
      )}

      {store.activeMode !== "ask" && (
        <button
          onClick={handleSearch}
          disabled={store.matchedIngredients.length === 0 || store.isLoading}
          style={{
            padding: "8px 20px",
            background: store.matchedIngredients.length > 0 ? "#2a7" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: store.matchedIngredients.length > 0 ? "pointer" : "default",
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          {store.isLoading ? "检索中..." : "探索"}
        </button>
      )}

      {store.activeMode === "ask" ? (
        <AskPanel />
      ) : (
        <>
          <ResultList
            results={store.results}
            explanation={store.explanation}
            loading={store.isLoading}
          />
          <ModePanel modes={store.modes} />
        </>
      )}
    </div>
  );
}
