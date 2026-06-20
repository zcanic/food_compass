import { useState } from "react";
import { routeIntent } from "../../ask/intent-router";
import { buildSkillPlan } from "../../ask/skill-plan";
import { executeSkill } from "../../skills";
import { composeResponse } from "../../ask/response-composer";
import {
  getLLMEndpointOverride,
  isLLMConfigured,
  setLLMEndpointOverride,
} from "../../ask/llm-client";
import type { AskRoutingSource, IntentResult, RetrievalBackend } from "../../types/query";
import type { SkillResult, AskResponse } from "../../types/result";
import { getMatcher, getSearchBackend } from "../../engine";
import { displayName } from "../../utils/text";
import { ResultList } from "../results/ResultList";

interface AskDiagnostics {
  backend: RetrievalBackend;
  elapsedMs: number;
  toolCount: number;
  vectorToolCount: number;
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
};

const COMPOSER_LABELS: Record<"llm" | "local" | "fallback", string> = {
  llm: "LLM",
  local: "本地模板",
  fallback: "本地模板 fallback",
};

export function AskPanel() {
  const [question, setQuestion] = useState("");
  const [intent, setIntent] = useState<IntentResult | null>(null);
  const [matchedIngredients, setMatchedIngredients] = useState<string[]>([]);
  const [toolResults, setToolResults] = useState<SkillResult[]>([]);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [diagnostics, setDiagnostics] = useState<AskDiagnostics | null>(null);
  const [loading, setLoading] = useState(false);
  const [endpointOverride, setEndpointOverrideState] = useState(() => getLLMEndpointOverride());
  const [endpointDraft, setEndpointDraft] = useState(() => getLLMEndpointOverride());
  const recommendationGroups = toolResults.filter((r) => r.recommendations.length > 0);
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

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setIntent(null);
    setMatchedIngredients([]);
    setToolResults([]);
    setResponse(null);
    setDiagnostics(null);

    try {
      // Step 1: Intent routing
      const parsed = await routeIntent(question);
      setIntent(parsed);

      // Step 2: Extract ingredients using matcher
      const matcher = getMatcher();
      const extracted = matcher.extractFromText(question);
      const ingredients = extracted.map((m) => m.name);
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
        return;
      }

      // Step 3: Execute skills based on intent
      const plan = buildSkillPlan(parsed, ingredients);
      const toolStart = readNow();
      const vectorToolCount = plan.filter((step) => isVectorSkill(step.name)).length;
      const modeToolCount = plan.filter((step) => step.name === "lookup_mode").length;
      const skillResults: SkillResult[] = await Promise.all(
        plan.map((step) => executeSkill(step.name, step.params))
      );
      let executedToolCount = skillResults.length;
      let constraintToolCount = 0;

      const recommendationNames = skillResults.flatMap((r) =>
        r.recommendations.map((rec) => rec.name)
      );
      if (parsed.constraints.length > 0 && recommendationNames.length > 0) {
        skillResults.push(
          await executeSkill("constraint_filter", {
            candidates: recommendationNames,
            constraints: parsed.constraints,
          })
        );
        executedToolCount += 1;
        constraintToolCount += 1;
      }
      // Step 4: Compose response
      const askResponse = await composeResponse(question, skillResults, llmConfigured);
      setDiagnostics({
        backend: vectorToolCount > 0 ? getSearchBackend() : "mode-atlas",
        elapsedMs: Math.max(0, Math.round(readNow() - toolStart)),
        toolCount: executedToolCount,
        vectorToolCount,
        modeToolCount,
        constraintToolCount,
        intentSource: parsed.source ?? "rules",
        composer: askResponse.trace.composer ?? "local",
        llmConfigured,
      });
      setToolResults(skillResults);
      setResponse({
        ...askResponse,
        trace: {
          intent: parsed.intent ?? "",
          ingredients,
          toolsUsed: askResponse.trace.toolsUsed,
        },
      });
    } catch (e) {
      setResponse({
        answer: `处理请求时出错: ${e instanceof Error ? e.message : "未知错误"}`,
        trace: { intent: "", ingredients: [], toolsUsed: [] },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="panel-title">Ask Mode</div>
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
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="描述你想做什么... 如：我有番茄和鸡蛋，想做得更日式一点，可以加什么？"
        rows={3}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 15,
          border: "1px solid #ccc",
          borderRadius: 8,
          resize: "vertical",
          marginBottom: 8,
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "8px 20px",
          background: "#2a7",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        {loading ? "处理中..." : "提问"}
      </button>

      {intent && (
        <div
          role="region"
          aria-label="Ask 解析结果"
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "#f5f5f5",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <strong>解析结果</strong>
          <div style={{ marginTop: 6 }}>
            意图：{intent.intent ?? "未知"} · 置信度：{(intent.confidence * 100).toFixed(0)}%
            {intent.targetStyle && <> · 风格：{intent.targetStyle}</>}
            {intent.multiIntent && " · 多意图"}
          </div>
          <div style={{ marginTop: 6 }}>
            编排层：{ROUTER_LABELS[intent.source ?? "rules"]} · 工具层：Cooc/Core/Chem
          </div>
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
        </div>
      )}

      {response && (
        <div
          style={{
            marginTop: 16,
            padding: "14px 18px",
            background: "#fafafa",
            borderRadius: 8,
            border: "1px solid #eee",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
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
              {" "}向量工具 {diagnostics.vectorToolCount} · 街区 {diagnostics.modeToolCount} · 约束 {diagnostics.constraintToolCount}
              {" "}LLM：{diagnostics.llmConfigured ? "已配置" : "未配置"} · 回答组织：{COMPOSER_LABELS[diagnostics.composer]}
            </div>
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
