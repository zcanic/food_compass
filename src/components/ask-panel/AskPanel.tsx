import { useEffect, useRef, useState } from "react";
import { routeIntent } from "../../ask/intent-router";
import { buildSkillPlan, type SkillRequest } from "../../ask/skill-plan";
import { executeSkill } from "../../skills";
import { composeResponse } from "../../ask/response-composer";
import {
  getLLMEndpointOverride,
  isLLMConfigured,
  isLLMRequestAbort,
  setLLMEndpointOverride,
} from "../../ask/llm-client";
import type { AskIntent, AskRoutingSource, IntentResult, RetrievalBackend } from "../../types/query";
import type { SkillResult, AskResponse } from "../../types/result";
import type { SearchMatch } from "../../types/ingredient";
import { MODEL_EXPLANATIONS, MODEL_LABELS, type ModelName } from "../../types/model";
import { consumeSearchTimings, getMatcher, getSearchBackend, resetSearchTimings } from "../../engine";
import { STYLE_LABELS, STYLE_SEED_SETS } from "../../utils/constants";
import { displayName } from "../../utils/text";
import { ResultList } from "../results/ResultList";
import { IngredientChip } from "../search/IngredientChip";
import { Play, RotateCcw, Sparkles } from "lucide-react";

interface AskDiagnostics {
  backend: RetrievalBackend;
  elapsedMs: number;
  toolCount: number;
  vectorToolCount: number;
  vectorCallCount: number;
  vectorElapsedMs: number;
  modeToolCount: number;
  constraintToolCount: number;
  intentSource: AskRoutingSource;
  composer: "llm" | "local" | "fallback";
  llmConfigured: boolean;
}

const BACKEND_LABELS: Record<RetrievalBackend, string> = {
  worker: "Worker",
  local: "本地 fallback",
  "mode-atlas": "Mode atlas",
};

const ROUTER_LABELS: Record<AskRoutingSource, string> = {
  llm: "LLM",
  rules: "本地规则",
  fallback: "fallback",
  user: "用户调整",
};

const COMPOSER_LABELS: Record<"llm" | "local" | "fallback", string> = {
  llm: "LLM",
  local: "本地模板",
  fallback: "本地模板 fallback",
};

const INTENT_LABELS: Record<AskIntent, string> = {
  pairing: "找常见搭配",
  substitute: "找风味替代",
  style_shift: "换风格",
  complete_combo: "组合补全",
  explain: "查食材街区",
};

type AskPhase = "idle" | "parsing" | "review" | "executing";

export function AskPanel() {
  const [question, setQuestion] = useState("");
  const [intent, setIntent] = useState<IntentResult | null>(null);
  const [matchedIngredients, setMatchedIngredients] = useState<string[]>([]);
  const [resolvedPlan, setResolvedPlan] = useState<SkillRequest[]>([]);
  const [toolResults, setToolResults] = useState<SkillResult[]>([]);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [diagnostics, setDiagnostics] = useState<AskDiagnostics | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<AskPhase>("idle");
  const [ingredientDraft, setIngredientDraft] = useState("");
  const [ingredientMatch, setIngredientMatch] = useState<SearchMatch | null>(null);
  const [endpointOverride, setEndpointOverrideState] = useState(() => getLLMEndpointOverride());
  const [endpointDraft, setEndpointDraft] = useState(() => getLLMEndpointOverride());
  const requestControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const recommendationGroups = toolResults.filter((r) => r.recommendations.length > 0);
  const planCandidateLimits = resolvedPlan.flatMap((step) => {
    const limit = planCandidateLimit(step);
    return limit ? [limit] : [];
  });
  const llmConfigured = isLLMConfigured();

  const saveEndpointOverride = () => {
    setLLMEndpointOverride(endpointDraft);
    setEndpointOverrideState(getLLMEndpointOverride());
    setEndpointDraft(getLLMEndpointOverride());
  };

  const clearEndpointOverride = () => {
    setLLMEndpointOverride("");
    setEndpointOverrideState("");
    setEndpointDraft("");
  };

  const cancelActiveRequest = () => {
    requestIdRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
  };

  useEffect(() => () => {
    requestIdRef.current += 1;
    requestControllerRef.current?.abort();
  }, []);

  const handleQuestionChange = (value: string) => {
    cancelActiveRequest();
    setLoading(false);
    setPhase("idle");
    setIntent(null);
    setMatchedIngredients([]);
    setResolvedPlan([]);
    setToolResults([]);
    setResponse(null);
    setDiagnostics(null);
    setIngredientDraft("");
    setIngredientMatch(null);
    setQuestion(value);
  };

  const handleParse = async () => {
    if (!question.trim()) return;
    cancelActiveRequest();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const isCurrentRequest = () => requestIdRef.current === requestId;
    setLoading(true);
    setPhase("parsing");
    setIntent(null);
    setMatchedIngredients([]);
    setResolvedPlan([]);
    setToolResults([]);
    setResponse(null);
    setDiagnostics(null);
    setIngredientDraft("");
    setIngredientMatch(null);

    try {
      const parsed = await routeIntent(question, { signal: controller.signal });
      if (!isCurrentRequest()) return;
      setIntent(parsed);

      const matcher = getMatcher();
      const extracted = matcher.extractFromText(question);
      const ingredients = extracted.map((match) => match.name);
      setMatchedIngredients(ingredients);

      if (ingredients.length === 0) {
        setResponse({
          answer: "没有识别到可用食材。请补充英文 canonical 名称，或使用当前支持的中文别名，例如番茄、鸡蛋、酱油、豆腐。",
          trace: {
            intent: parsed.intent ?? "",
            ingredients: [],
            toolsUsed: [],
          },
        });
        setPhase("idle");
        return;
      }

      const plan = buildSkillPlan(parsed, ingredients);
      setResolvedPlan(plan);
      setPhase("review");
    } catch (error) {
      if (!isCurrentRequest() || isLLMRequestAbort(error)) return;
      setResponse({
        answer: `处理请求时出错: ${error instanceof Error ? error.message : "未知错误"}`,
        trace: { intent: "", ingredients: [], toolsUsed: [] },
      });
      setPhase("idle");
    } finally {
      if (isCurrentRequest()) {
        requestControllerRef.current = null;
        setLoading(false);
      }
    }
  };

  const updateReviewIntent = (nextIntent: AskIntent) => {
    if (!intent) return;
    const next: IntentResult = {
      ...intent,
      intent: nextIntent,
      matchedIntents: [nextIntent],
      targetStyle: nextIntent === "style_shift" ? intent.targetStyle ?? "Japanese" : undefined,
      multiIntent: false,
      source: "user",
      toolPlan: undefined,
    };
    setIntent(next);
    setResolvedPlan(buildSkillPlan(next, matchedIngredients));
    setToolResults([]);
    setResponse(null);
    setDiagnostics(null);
  };

  const updateReviewStyle = (targetStyle: string) => {
    if (!intent) return;
    const next: IntentResult = {
      ...intent,
      targetStyle,
      source: "user",
      toolPlan: undefined,
    };
    setIntent(next);
    setResolvedPlan(buildSkillPlan(next, matchedIngredients));
    setToolResults([]);
    setResponse(null);
    setDiagnostics(null);
  };

  const updateReviewedIngredients = (nextIngredients: string[]) => {
    if (!intent) return;
    const next: IntentResult = {
      ...intent,
      source: "user",
      toolPlan: undefined,
    };
    setIntent(next);
    setMatchedIngredients(nextIngredients);
    setResolvedPlan(buildSkillPlan(next, nextIngredients));
    setToolResults([]);
    setResponse(null);
    setDiagnostics(null);
  };

  const handleIngredientDraftChange = (value: string) => {
    setIngredientDraft(value);
    setIngredientMatch(value.trim() ? getMatcher().match(value) : null);
  };

  const addReviewedIngredient = (name?: string) => {
    if (!intent) return;
    const resolved = name ?? (ingredientMatch?.kind === "exact" ? ingredientMatch.name : "");
    if (!resolved) return;
    const nextIngredients = matchedIngredients.includes(resolved)
      ? matchedIngredients
      : [...matchedIngredients, resolved];
    updateReviewedIngredients(nextIngredients);
    setIngredientDraft("");
    setIngredientMatch(null);
  };

  const removeReviewedIngredient = (name: string) => {
    updateReviewedIngredients(matchedIngredients.filter((ingredient) => ingredient !== name));
  };

  const handleExecutePlan = async () => {
    if (!intent || matchedIngredients.length === 0) return;
    const plan = buildSkillPlan(intent, matchedIngredients);
    if (plan.length === 0) return;

    cancelActiveRequest();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const isCurrentRequest = () => requestIdRef.current === requestId;
    setLoading(true);
    setPhase("executing");
    setResolvedPlan(plan);
    setToolResults([]);
    setResponse(null);
    setDiagnostics(null);

    try {
      resetSearchTimings();
      const toolStart = readNow();
      const vectorToolCount = plan.filter((step) => isVectorSkill(step.name)).length;
      const modeToolCount = plan.filter((step) => step.name === "lookup_mode").length;
      const skillResults: SkillResult[] = await Promise.all(
        plan.map((step) => executeSkill(step.name, step.params))
      );
      if (!isCurrentRequest()) return;
      let executedToolCount = skillResults.length;
      let constraintToolCount = 0;

      const recommendationNames = skillResults.flatMap((result) =>
        result.recommendations.map((recommendation) => recommendation.name)
      );
      if (intent.constraints.length > 0 && recommendationNames.length > 0) {
        skillResults.push(
          await executeSkill("constraint_filter", {
            candidates: recommendationNames,
            constraints: intent.constraints,
          })
        );
        if (!isCurrentRequest()) return;
        executedToolCount += 1;
        constraintToolCount += 1;
      }

      const vectorTimings = consumeSearchTimings();
      const toolElapsedMs = Math.max(0, Math.round(readNow() - toolStart));

      const askResponse = await composeResponse(question, skillResults, llmConfigured, {
        signal: controller.signal,
      });
      if (!isCurrentRequest()) return;
      setDiagnostics({
        backend: vectorToolCount > 0 ? getSearchBackend() : "mode-atlas",
        elapsedMs: toolElapsedMs,
        toolCount: executedToolCount,
        vectorToolCount,
        vectorCallCount: vectorTimings.length,
        vectorElapsedMs: vectorTimings.reduce((total, timing) => total + timing.elapsedMs, 0),
        modeToolCount,
        constraintToolCount,
        intentSource: intent.source ?? "rules",
        composer: askResponse.trace.composer ?? "local",
        llmConfigured,
      });
      setToolResults(skillResults);
      setResponse({
        ...askResponse,
        trace: {
          ...askResponse.trace,
          intent: intent.intent ?? "",
          ingredients: matchedIngredients,
          toolsUsed: askResponse.trace.toolsUsed,
        },
      });
    } catch (error) {
      if (!isCurrentRequest() || isLLMRequestAbort(error)) return;
      setResponse({
        answer: `处理请求时出错: ${error instanceof Error ? error.message : "未知错误"}`,
        trace: { intent: "", ingredients: [], toolsUsed: [] },
      });
    } finally {
      if (isCurrentRequest()) {
        requestControllerRef.current = null;
        setLoading(false);
        setPhase("review");
      }
    }
  };

  return (
    <div className="ask-panel">
      <div className="ask-heading-row">
        <div className="panel-title">Ask Mode</div>
        <span className="ask-heading-badge">LLM + tools</span>
      </div>
      <section className="ask-stack-status" aria-label="Ask LLM 状态">
        <div className="ask-status-item">
          <span>LLM endpoint</span>
          <strong>{llmConfigured ? "configured" : "missing"}</strong>
        </div>
        <div className="ask-status-item">
          <span>编排层</span>
          <strong>{llmConfigured ? "LLM + rules fallback" : "rules fallback"}</strong>
        </div>
        <div className="ask-status-item">
          <span>候选来源</span>
          <strong>Cooc / Core / Chem</strong>
        </div>
      </section>
      <div className="ask-endpoint-control" role="region" aria-label="Ask LLM endpoint 设置">
        <input
          aria-label="LLM endpoint override"
          value={endpointDraft}
          onChange={(event) => setEndpointDraft(event.target.value)}
          placeholder="/api/llm-proxy"
        />
        <button type="button" onClick={saveEndpointOverride}>
          保存
        </button>
        <button type="button" onClick={clearEndpointOverride} disabled={!endpointOverride && !endpointDraft}>
          清除
        </button>
      </div>
      <textarea
        value={question}
        onChange={(event) => handleQuestionChange(event.target.value)}
        placeholder="描述你想做什么... 如：我有番茄和鸡蛋，想做得更日式一点，可以加什么？"
        rows={3}
        className="ask-question-input"
      />
      <button
        onClick={handleParse}
        disabled={loading}
        className={`ask-parse-button ${phase === "review" ? "is-secondary" : ""}`}
      >
        {phase === "review" ? <RotateCcw size={15} aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}
        {loading ? (phase === "parsing" ? "处理中..." : "执行中...") : phase === "review" ? "重新解析" : "提问"}
      </button>

      {intent && (
        <div
          role="region"
          aria-label="Ask 解析结果"
          className="ask-review transition-reveal"
        >
          <strong>{phase === "review" || phase === "executing" ? "执行前审阅" : "解析结果"}</strong>
          <div style={{ marginTop: 6 }}>
            意图：{intent.intent ?? "未知"} · 置信度：{(intent.confidence * 100).toFixed(0)}%
            {intent.targetStyle && <> · 风格：{intent.targetStyle}</>}
            {intent.multiIntent && " · 多意图"}
          </div>
          <div style={{ marginTop: 6 }}>
            编排层：{ROUTER_LABELS[intent.source ?? "rules"]} · 工具层：Cooc/Core/Chem
          </div>
          <div style={{ marginTop: 6 }}>
            工具计划：{intent.source === "user" ? "用户调整后本地计划" : intent.toolPlan?.length ? "LLM 已选择" : "本地默认"}
            {resolvedPlan.length > 0 && <> · {resolvedPlan.map(planStepLabel).join(" → ")}</>}
          </div>
          {resolvedPlan.length > 0 && (
            <div style={{ marginTop: 6, color: "var(--subtle)" }}>
              模型依据：{resolvedPlan.map(planLensSummary).join("；")}
            </div>
          )}
          {planCandidateLimits.length > 0 && (
            <div style={{ marginTop: 6, color: "var(--subtle)" }}>
              候选上限：{planCandidateLimits.join("；")}
            </div>
          )}
          {intent.matchedIntents && intent.matchedIntents.length > 1 && (
            <div style={{ marginTop: 6 }}>
              意图链：{intent.matchedIntents.join("、")}
            </div>
          )}
          <div style={{ marginTop: 6 }}>
            食材：
            {matchedIngredients.length > 0
              ? matchedIngredients.map(displayName).join("、")
              : "未识别，请补充英文 canonical 名称或常见中文别名"}
          </div>
          {intent.constraints.length > 0 && (
            <div style={{ marginTop: 6 }}>
              约束：{intent.constraints.join("、")}（当前仅提示，不做可靠过滤）
            </div>
          )}
          {(phase === "review" || phase === "executing") && (
            <div
              role="group"
              aria-label="Ask 计划修正"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "end",
                marginTop: 12,
                paddingTop: 10,
                borderTop: "1px solid #ddd",
              }}
            >
              <label style={{ display: "grid", gap: 4 }}>
                <span>主任务</span>
                <select
                  aria-label="Ask 主意图"
                  value={intent.intent ?? "pairing"}
                  disabled={loading}
                  onChange={(event) => updateReviewIntent(event.target.value as AskIntent)}
                >
                  {Object.entries(INTENT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              {intent.intent === "style_shift" && (
                <label style={{ display: "grid", gap: 4 }}>
                  <span>目标风格</span>
                  <select
                    aria-label="Ask 目标风格"
                    value={intent.targetStyle ?? "Japanese"}
                    disabled={loading}
                    onChange={(event) => updateReviewStyle(event.target.value)}
                  >
                    {Object.keys(STYLE_SEED_SETS).map((style) => (
                      <option key={style} value={style}>{STYLE_LABELS[style] ?? style}</option>
                    ))}
                  </select>
                </label>
              )}
              <div
                role="group"
                aria-label="Ask 食材修正"
                style={{ display: "grid", gap: 5, flex: "1 1 220px", minWidth: 0 }}
              >
                <span>已识别食材</span>
                {matchedIngredients.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {matchedIngredients.map((name) => (
                      <IngredientChip
                        key={name}
                        name={name}
                        onRemove={() => removeReviewedIngredient(name)}
                        removeLabel={`移除 Ask 食材 ${displayName(name)}`}
                      />
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    aria-label="添加 Ask 食材"
                    value={ingredientDraft}
                    disabled={loading}
                    onChange={(event) => handleIngredientDraftChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && ingredientMatch?.kind === "exact") {
                        event.preventDefault();
                        addReviewedIngredient();
                      }
                    }}
                    placeholder="添加 canonical 或别名"
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => addReviewedIngredient()}
                    disabled={loading || ingredientMatch?.kind !== "exact"}
                  >
                    添加
                  </button>
                </div>
                {ingredientMatch?.kind === "fuzzy" && (
                  ingredientMatch.candidates.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {ingredientMatch.candidates.slice(0, 4).map((candidate) => (
                        <button
                          key={candidate}
                          type="button"
                          disabled={loading}
                          onClick={() => addReviewedIngredient(candidate)}
                        >
                          使用 {displayName(candidate)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>当前词表未匹配该食材</span>
                  )
                )}
              </div>
              <button
                type="button"
                onClick={handleExecutePlan}
                disabled={loading || resolvedPlan.length === 0}
                className="ask-execute-button"
              >
                <Play size={15} aria-hidden="true" />
                {phase === "executing" ? "执行中..." : "执行计划"}
              </button>
            </div>
          )}
        </div>
      )}

      {response && (
        <div
          className="ask-response result-list-reveal"
        >
          {response.answer}
          {response.trace.toolsUsed.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 11, color: "#aaa" }}>
              调用工具：{response.trace.toolsUsed.join("、")}
            </div>
          )}
          {diagnostics && (
            <div
              role="region"
              aria-label="Ask 执行诊断"
              style={{ marginTop: 6, fontSize: 11, color: "#aaa" }}
            >
              工具执行：{diagnostics.toolCount} 个 · {BACKEND_LABELS[diagnostics.backend]} · {diagnostics.elapsedMs} ms
              <span> 向量工具 {diagnostics.vectorToolCount} · 街区 {diagnostics.modeToolCount} · 约束 {diagnostics.constraintToolCount}</span>
              <span> 检索 {diagnostics.vectorCallCount} 次 · {diagnostics.vectorElapsedMs} ms</span>
              {" "}LLM：{diagnostics.llmConfigured ? "已配置" : "未配置"} · 回答组织：{COMPOSER_LABELS[diagnostics.composer]}
            </div>
          )}
          {diagnostics?.llmConfigured && diagnostics.composer === "fallback" && (
            <button
              type="button"
              className="ask-retry-button"
              onClick={handleExecutePlan}
              disabled={loading}
            >
              重试 LLM
            </button>
          )}
        </div>
      )}

      {recommendationGroups.length === 1 && (
        <div style={{ marginTop: 16 }}>
          <ResultList
            results={recommendationGroups[0].recommendations}
            explanation="这些是 Ask Mode 调用本地工具得到的结构化候选。"
            loading={false}
          />
        </div>
      )}

      {recommendationGroups.length > 1 && (
        <section style={{ marginTop: 16 }} aria-label="Ask 工具结果">
          {recommendationGroups.map((group) => {
            const label = toolLabel(group.skillName);
            return (
              <div key={group.skillName} style={{ marginTop: 14 }}>
                <h4 style={{ color: "var(--text)", fontSize: 13, marginBottom: 6 }}>
                  {label}
                </h4>
                <ResultList
                  results={group.recommendations}
                  explanation="这些是 Ask Mode 调用本地工具得到的结构化候选。"
                  loading={false}
                  listLabel={`${label}推荐结果`}
                />
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

function readNow(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function isVectorSkill(skillName: string): boolean {
  return [
    "find_pairings",
    "find_substitutes",
    "shift_style",
    "complete_combination",
    "compare_models",
  ].includes(skillName);
}

function toolLabel(skillName: string) {
  switch (skillName) {
    case "shift_style":
      return "风格偏移";
    case "find_pairings":
      return "常见搭配";
    case "find_substitutes":
      return "风味替代";
    case "complete_combination":
      return "组合补全";
    case "compare_models":
      return "模型对比";
    default:
      return skillName;
  }
}

function planStepLabel(step: SkillRequest): string {
  const model = getPlanModel(step);
  const suffix = model ? `/${model}` : "";
  return `${toolLabel(step.name)}${suffix}`;
}

function planLensSummary(step: SkillRequest): string {
  const model = getPlanModel(step);
  if (!model) return toolLabel(step.name);
  return `${toolLabel(step.name)}：${MODEL_LABELS[model]}（${model}），${MODEL_EXPLANATIONS[model]}`;
}

function planCandidateLimit(step: SkillRequest): string | null {
  const topK = step.params.top_k;
  return typeof topK === "number" && Number.isFinite(topK)
    ? `${toolLabel(step.name)} ${topK} 项`
    : null;
}

function getPlanModel(step: SkillRequest): ModelName | null {
  const model = step.params.model;
  return model === "cooc" || model === "core" || model === "chem" ? model : null;
}
