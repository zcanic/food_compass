import { useState } from "react";
import { routeIntent } from "../../ask/intent-router";
import { executeSkill } from "../../skills";
import { composeResponse } from "../../ask/response-composer";
import type { IntentResult } from "../../types/query";
import type { SkillResult, AskResponse } from "../../types/result";
import { getMatcher } from "../../engine";

export function AskPanel() {
  const [question, setQuestion] = useState("");
  const [intent, setIntent] = useState<IntentResult | null>(null);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setIntent(null);
    setResponse(null);

    try {
      // Step 1: Intent routing
      const parsed = await routeIntent(question);
      setIntent(parsed);

      // Step 2: Extract ingredients using matcher
      const matcher = getMatcher();
      const words = question.split(/[\s,，、]+/);
      const matchedIngredients: string[] = [];
      for (const w of words) {
        const m = matcher.match(w);
        if (m.kind === "exact") matchedIngredients.push(m.name);
      }

      // Step 3: Execute skills based on intent
      const skillResults: SkillResult[] = [];

      if (parsed.intent === "pairing" && matchedIngredients.length > 0) {
        skillResults.push(
          await executeSkill("find_pairings", {
            ingredient: matchedIngredients[0],
            model: "cooc",
            top_k: 12,
          })
        );
      } else if (parsed.intent === "substitute" && matchedIngredients.length > 0) {
        skillResults.push(
          await executeSkill("find_substitutes", {
            ingredient: matchedIngredients[0],
            top_k: 12,
          })
        );
      } else if (parsed.intent === "style_shift" && matchedIngredients.length > 0) {
        skillResults.push(
          await executeSkill("shift_style", {
            ingredients: matchedIngredients,
            target_style: parsed.targetStyle ?? "Japanese",
            strength: "medium",
            top_k: 12,
          })
        );
      } else if (parsed.intent === "complete_combo" && matchedIngredients.length > 0) {
        skillResults.push(
          await executeSkill("complete_combination", {
            ingredients: matchedIngredients,
            model: "core",
            top_k: 12,
          })
        );
      } else if (parsed.intent === "explain" && matchedIngredients.length > 0) {
        skillResults.push(
          await executeSkill("lookup_mode", {
            ingredient: matchedIngredients[0],
            model: "core",
          })
        );
      } else if (matchedIngredients.length > 0) {
        // Fallback: run pairings
        skillResults.push(
          await executeSkill("find_pairings", {
            ingredient: matchedIngredients[0],
            model: "core",
            top_k: 12,
          })
        );
      }

      // Step 4: Compose response
      const askResponse = await composeResponse(question, skillResults, false);
      setResponse(askResponse);
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
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "#f5f5f5",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <strong>解析结果：</strong>
          意图={intent.intent ?? "未知"}，
          置信度={(intent.confidence * 100).toFixed(0)}%
          {intent.targetStyle && <>，风格={intent.targetStyle}</>}
          {intent.multiIntent && "（多意图）"}
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
        </div>
      )}
    </div>
  );
}
