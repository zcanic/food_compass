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
import { MODEL_LABELS } from "../types/model";

const MODE_DEFAULT_MODEL: Record<AppMode, ModelName> = {
  pairing: "cooc",
  substitute: "chem",
  style_shift: "core",
  lookup_mode: "core",
  complete_combo: "core",
  ask: "core",
};

const MODE_HELP: Record<AppMode, string> = {
  pairing: "找经常一起出现的搭配，适合决定还能加什么。",
  substitute: "找风味更接近的候选，适合缺少某个食材时找替代灵感。",
  style_shift: "把当前食材组合轻度推向一个目标风格，属于实验功能。",
  lookup_mode: "查看食材在 Epicure 空间中靠近哪些食材街区。",
  complete_combo: "把多个食材平均成组合向量，找还可以补什么。",
  ask: "用一句话提问，系统会先解析意图，再调用本地工具。",
};

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
    store.setActiveModel(MODE_DEFAULT_MODEL[mode]);
    store.setResults([]);
    store.setModes([]);
    store.setExplanation("");
    store.setHasSearched(false);
    if (mode === "style_shift") {
      store.setTargetStyle("Japanese");
    }
  };

  const canExplore = store.matchedIngredients.length > 0 && !store.isLoading;
  const activeHelp = MODE_HELP[store.activeMode];
  const selectedText = store.matchedIngredients.length > 0
    ? `已选择 ${store.matchedIngredients.length} 个食材`
    : "先输入至少 1 个食材";
  const showResultList = store.activeMode !== "lookup_mode" || store.modes.length === 0;
  const emptyTitle = (() => {
    if (store.matchedIngredients.length === 0) return "先添加食材";
    if (!store.hasSearched) return "准备好了，点击探索";
    if (store.activeMode === "lookup_mode") return "没有找到街区";
    return "没有找到推荐结果";
  })();
  const emptyDetail = (() => {
    if (store.matchedIngredients.length === 0) {
      return "支持英文 canonical 名称，也支持少量中文别名，例如番茄、鸡蛋、酱油。";
    }
    if (!store.hasSearched) {
      return "结果会显示在这里，并附带当前模型视角的解释。";
    }
    if (store.activeMode === "lookup_mode") {
      return "不同模型下的街区覆盖不同，可以切换模型视角再试。";
    }
    return "可以切换模型视角、减少输入食材，或尝试英文 canonical 名称。";
  })();

  return (
    <div>
      <header className="workbench-header">
        <div>
          <div className="eyebrow">Flavor Compass</div>
          <h1 className="page-title">食材罗盘工作台</h1>
          <p className="page-subtitle">
            输入食材，选择任务，实时用 Epicure 的三种食材空间检索搭配、替代、组合补全和食材街区。
          </p>
        </div>
        <div className="status-pill">{selectedText}</div>
      </header>

      <div className="workbench-grid">
        <section className="panel control-stack" aria-label="Controls">
          <div>
            <div className="panel-title">1. 选择任务</div>
            <ModeTabs active={store.activeMode} onChange={handleModeChange} />
            <div className="secondary-note">{activeHelp}</div>
          </div>

          {store.activeMode !== "ask" && (
            <>
              <div>
                <div className="panel-title">2. 输入食材</div>
                <SearchBox />
              </div>

              <div>
                <div className="panel-title">3. 选择模型视角</div>
                <ModelToggle
                  active={store.activeModel}
                  onChange={(m: ModelName) => store.setActiveModel(m)}
                />
                <div className="secondary-note">
                  当前使用：{MODEL_LABELS[store.activeModel]}。
                </div>
              </div>
            </>
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
              disabled={!canExplore}
              className="primary-button"
            >
              {store.isLoading ? "检索中..." : "探索"}
            </button>
          )}
        </section>

        <section className="panel" aria-label="Results">
          {store.activeMode === "ask" ? (
            <AskPanel />
          ) : (
            <>
              {showResultList && (
                <ResultList
                  results={store.results}
                  explanation={store.explanation}
                  loading={store.isLoading}
                  emptyTitle={emptyTitle}
                  emptyDetail={emptyDetail}
                />
              )}
              <ModePanel modes={store.modes} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
