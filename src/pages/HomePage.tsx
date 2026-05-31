import { SearchBox } from "../components/search/SearchBox";
import { ModeTabs } from "../components/mode-selector/ModeTabs";
import { ModelToggle } from "../components/mode-selector/ModelToggle";
import { ResultList } from "../components/results/ResultList";
import { QuerySummary } from "../components/results/QuerySummary";
import { ModePanel } from "../components/mode-panel/ModePanel";
import { StyleShiftPanel } from "../components/style-shift/StyleShiftPanel";
import { AskPanel } from "../components/ask-panel/AskPanel";
import { useQueryStore } from "../store/query-store";
import { useQuery } from "../hooks/useQuery";
import type { AppMode } from "../types/query";
import type { StyleStrength } from "../types/query";
import type { ModelName } from "../types/model";
import { MODEL_LABELS } from "../types/model";

interface ExampleQuery {
  label: string;
  hint: string;
  mode: AppMode;
  ingredients: string[];
  model: ModelName;
  targetStyle?: string;
  strength?: StyleStrength;
}

const MODE_DEFAULT_MODEL: Record<AppMode, ModelName> = {
  pairing: "cooc",
  substitute: "chem",
  style_shift: "core",
  lookup_mode: "core",
  complete_combo: "core",
  compare_models: "core",
  ask: "core",
};

const MODE_HELP: Record<AppMode, string> = {
  pairing: "找经常一起出现的搭配，适合决定还能加什么。",
  substitute: "找风味更接近的候选，适合缺少某个食材时找替代灵感。",
  style_shift: "把当前食材组合轻度推向一个目标风格，属于实验功能。",
  lookup_mode: "查看食材在 Epicure 空间中靠近哪些食材街区。",
  complete_combo: "把多个食材平均成组合向量，找还可以补什么。",
  compare_models: "同时查看常见搭配、综合推荐和风味相似三种视角的差异。",
  ask: "用一句话提问，系统会先解析意图，再调用本地工具。",
};

const EXAMPLES: ExampleQuery[] = [
  {
    label: "番茄找搭配",
    hint: "看它常和什么一起出现",
    mode: "pairing",
    ingredients: ["tomato"],
    model: "cooc",
  },
  {
    label: "罗勒找替代",
    hint: "缺少罗勒时找风味近邻",
    mode: "substitute",
    ingredients: ["basil"],
    model: "chem",
  },
  {
    label: "番茄鸡蛋做日式",
    hint: "把组合推向日式风格",
    mode: "style_shift",
    ingredients: ["tomato", "egg"],
    model: "core",
    targetStyle: "Japanese",
    strength: "medium",
  },
  {
    label: "酱油查街区",
    hint: "看它属于哪个食材街区",
    mode: "lookup_mode",
    ingredients: ["soy_sauce"],
    model: "core",
  },
  {
    label: "番茄模型对比",
    hint: "看三种模型的差异",
    mode: "compare_models",
    ingredients: ["tomato"],
    model: "core",
  },
];

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

  const runExample = (example: ExampleQuery) => {
    store.setActiveMode(example.mode);
    store.setActiveModel(example.model);
    store.setTargetStyle(example.targetStyle ?? "");
    store.setStrength(example.strength ?? "medium");
    store.setResults([]);
    store.setModes([]);
    store.setExplanation("");
    store.setHasSearched(false);

    runQuery(
      example.mode,
      example.ingredients,
      example.model,
      example.targetStyle,
      example.strength
    );
  };

  const runModeLookupExample = (ingredient: string) => {
    store.setActiveMode("lookup_mode");
    store.setActiveModel("core");
    store.setResults([]);
    store.setModes([]);
    store.setExplanation("");
    store.setHasSearched(false);
    runQuery("lookup_mode", [ingredient], "core");
  };

  const addRecommendationToQuery = (name: string) => {
    if (store.matchedIngredients.includes(name)) return;

    store.setMatchedIngredients([...store.matchedIngredients, name]);
    store.setResults([]);
    store.setModes([]);
    store.setExplanation("");
    store.setHasSearched(false);
  };

  const canExplore = store.matchedIngredients.length > 0 && !store.isLoading;
  const activeHelp = MODE_HELP[store.activeMode];
  const selectedText = store.matchedIngredients.length > 0
    ? `已选择 ${store.matchedIngredients.length} 个食材`
    : "先输入至少 1 个食材";
  const showResultList = store.activeMode !== "lookup_mode" || store.modes.length === 0;
  const showModelToggle = store.activeMode !== "ask" && store.activeMode !== "compare_models";
  const showModeLookupEmptyHint =
    store.activeMode === "lookup_mode" &&
    store.hasSearched &&
    !store.isLoading &&
    store.modes.length === 0 &&
    store.matchedIngredients.length > 0;
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

              {showModelToggle ? (
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
              ) : (
                <div className="secondary-note">
                  模型对比会同时运行常见搭配、综合推荐和风味相似，不需要单独选择模型。
                </div>
              )}
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

          <div>
            <div className="panel-title">试一个例子</div>
            <div className="example-grid">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => runExample(example)}
                  aria-label={`示例：${example.label}`}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    cursor: "pointer",
                    padding: "8px 10px",
                    textAlign: "left",
                  }}
                >
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700 }}>
                    {example.label}
                  </span>
                  <span style={{ color: "var(--subtle)", display: "block", fontSize: 11, marginTop: 2 }}>
                    {example.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="panel" aria-label="Results">
          {store.activeMode === "ask" ? (
            <AskPanel />
          ) : (
            <>
              <QuerySummary
                mode={store.activeMode}
                ingredients={store.matchedIngredients}
                model={store.activeModel}
                hasSearched={store.hasSearched}
                targetStyle={store.activeMode === "style_shift" ? store.targetStyle : undefined}
                strength={store.strength}
              />
              {showResultList && (
                <ResultList
                  results={store.results}
                  explanation={store.explanation}
                  loading={store.isLoading}
                  emptyTitle={emptyTitle}
                  emptyDetail={emptyDetail}
                  groupByModel={store.activeMode === "compare_models"}
                  onAddIngredient={addRecommendationToQuery}
                />
              )}
              {showModeLookupEmptyHint && (
                <section
                  aria-label="街区空态说明"
                  style={{
                    background: "#fffaf0",
                    border: "1px solid #efd5b9",
                    borderRadius: 8,
                    color: "var(--muted)",
                    fontSize: 12,
                    lineHeight: 1.6,
                    marginTop: 12,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ color: "var(--text)", fontWeight: 700, marginBottom: 4 }}>
                    mode atlas 未覆盖当前食材
                  </div>
                  <div>
                    这不代表食材没有风味关系，只表示它没有落入当前模型公开的命名街区成员列表。不同模型的街区覆盖和命名会不同。
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {["soy_sauce", "tomato", "tofu"].map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => runModeLookupExample(name)}
                        aria-label={`查街区示例 ${name.replace(/_/g, " ")}`}
                        style={{
                          background: "#fff",
                          border: "1px solid var(--border)",
                          borderRadius: 999,
                          color: "var(--accent-strong)",
                          cursor: "pointer",
                          fontSize: 12,
                          padding: "4px 9px",
                        }}
                      >
                        {name.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              <ModePanel modes={store.modes} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
