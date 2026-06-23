import type { AskIntent, IntentResult } from "../types/query";
import { STYLE_SEED_SETS } from "../utils/constants";
import { callLLM, isLLMConfigured, isLLMRequestAbort } from "./llm-client";

const SUPPORTED_INTENTS: AskIntent[] = [
  "pairing",
  "substitute",
  "style_shift",
  "complete_combo",
  "explain",
];
const INTENT_SET = new Set(SUPPORTED_INTENTS);
const STYLE_SET = new Set(Object.keys(STYLE_SEED_SETS));
const CONSTRAINT_SET = new Set(["vegan", "low_fat", "high_protein", "halal", "simple", "easy"]);

const INTENT_SYSTEM_PROMPT = `你是 Flavor Compass 的 Ask 编排器，只负责把用户自然语言转换成工具计划。

严格规则：
1. 只返回 JSON，不要 Markdown。
2. 不要生成推荐食材。推荐食材只能由后续 Cooc/Core/Chem 工具产生。
3. intent 和 matchedIntents 只能来自：pairing, substitute, style_shift, complete_combo, explain。
4. targetStyle 只能来自：${Object.keys(STYLE_SEED_SETS).join(", ")}。
5. constraints 只能用可识别的限制词，例如 vegan, low_fat, high_protein, halal, simple, easy。

工具语义：
- pairing -> Cooc 常见搭配工具
- substitute -> Chem 风味替代工具
- complete_combo -> Core 组合补全工具
- style_shift -> Core seed-set 风格插值工具
- explain -> Core mode atlas 街区解释工具

返回格式：
{"intent":"style_shift","matchedIntents":["pairing","style_shift","complete_combo"],"targetStyle":"Japanese","constraints":[],"confidence":0.82}`;

export async function routeIntentWithLLM(
  query: string,
  ruleFallback: IntentResult | null,
  options: { signal?: AbortSignal } = {}
): Promise<IntentResult | null> {
  if (!isLLMConfigured()) return null;

  const prompt = `用户问题：${query}

本地规则初判：
${JSON.stringify(ruleFallback, null, 2)}

请返回 JSON 工具计划。`;

  try {
    const raw = await callLLM(prompt, INTENT_SYSTEM_PROMPT, { signal: options.signal });
    return sanitizeIntent(JSON.parse(extractJSON(raw)), ruleFallback);
  } catch (error) {
    if (isLLMRequestAbort(error)) throw error;
    return null;
  }
}

function sanitizeIntent(value: unknown, ruleFallback: IntentResult | null): IntentResult | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const intent = normalizeIntent(raw.intent);
  const matchedIntents = normalizeIntentList(raw.matchedIntents);
  if (!intent && matchedIntents.length === 0) return null;

  const targetStyle = typeof raw.targetStyle === "string" && STYLE_SET.has(raw.targetStyle)
    ? raw.targetStyle
    : ruleFallback?.targetStyle;
  const constraints = normalizeConstraints(raw.constraints, ruleFallback?.constraints ?? []);
  const confidence = clampConfidence(raw.confidence);
  const finalIntents = matchedIntents.length > 0 ? matchedIntents : intent ? [intent] : [];
  const primary = intent ?? finalIntents[0] ?? null;

  return {
    intent: primary,
    matchedIntents: finalIntents,
    ingredients: [],
    targetStyle,
    constraints,
    confidence,
    multiIntent: finalIntents.length > 1,
    source: "llm",
  };
}

function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) return raw.slice(start, end + 1);
  return raw;
}

function normalizeIntent(value: unknown): AskIntent | null {
  return typeof value === "string" && INTENT_SET.has(value as AskIntent)
    ? value as AskIntent
    : null;
}

function normalizeIntentList(value: unknown): AskIntent[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeIntent).filter(Boolean) as AskIntent[];
}

function normalizeConstraints(value: unknown, fallback: string[]): string[] {
  const constraints = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : fallback;
  return Array.from(new Set(constraints.filter((item) => CONSTRAINT_SET.has(item))));
}

function clampConfidence(value: unknown): number {
  const raw = typeof value === "number" ? value : 0.75;
  return Math.max(0.3, Math.min(0.95, raw));
}
