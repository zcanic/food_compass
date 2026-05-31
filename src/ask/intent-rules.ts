import type { IntentResult } from "../types/query";

interface Rule {
  pattern: RegExp;
  intent: IntentResult["intent"];
}

const rules: Rule[] = [
  { pattern: /(替|换|代替|替代|取代|没有.*用什么)/, intent: "substitute" },
  { pattern: /(搭配|配什么|和什么.*配|可以加什么|还能.*什么|和什么一起)/, intent: "pairing" },
  { pattern: /(日式|韩式|中式|西式|南亚|地中海|拉美|东亚|风格|做得更|换成|改成|往.*做|偏.*一点)/, intent: "style_shift" },
  { pattern: /(我有|我手头|我冰箱|现有.*食材|这些.*食材|还缺|缺什么|补全|补充)/, intent: "complete_combo" },
  { pattern: /(为什么.*搭|为什么.*配|为什么.*一起|原理|解释|属于什么|什么类型|什么街区)/, intent: "explain" },
];

const styleKeywords: Record<string, string> = {
  "日式": "Japanese", "日本": "Japanese",
  "东亚": "East_Asian",
  "南亚": "South_Asian", "印度": "South_Asian",
  "地中海": "Mediterranean",
  "拉美": "Latin_American", "墨西哥": "Latin_American",
  "甜": "sweet", "辣": "spicy", "酸": "sour", "咸鲜": "savory_umami",
};

export function ruleBasedIntent(query: string): IntentResult | null {
  const matchedIntents: IntentResult["intent"][] = [];
  for (const rule of rules) {
    if (rule.pattern.test(query)) {
      matchedIntents.push(rule.intent);
    }
  }

  if (matchedIntents.length === 0) return null;

  const targetStyle = Object.entries(styleKeywords).find(([kw]) =>
    query.includes(kw)
  )?.[1];

  // Extract constraint keywords
  const constraints: string[] = [];
  if (/素食|vegan|纯素/.test(query)) constraints.push("vegan");
  if (/低脂|减脂/.test(query)) constraints.push("low_fat");
  if (/高蛋白/.test(query)) constraints.push("high_protein");
  if (/清真|halal/.test(query)) constraints.push("halal");

  const intent = chooseIntent(matchedIntents, Boolean(targetStyle));

  return {
    intent,
    ingredients: [],
    targetStyle,
    constraints,
    confidence: 0.7,
    multiIntent: matchedIntents.length > 1,
  };
}

function chooseIntent(
  matchedIntents: IntentResult["intent"][],
  hasTargetStyle: boolean
): IntentResult["intent"] {
  if (matchedIntents.includes("substitute")) return "substitute";
  if (hasTargetStyle && matchedIntents.includes("style_shift")) return "style_shift";
  if (matchedIntents.includes("explain")) return "explain";
  if (matchedIntents.includes("complete_combo")) return "complete_combo";
  if (matchedIntents.includes("style_shift")) return "style_shift";
  return matchedIntents[0];
}
