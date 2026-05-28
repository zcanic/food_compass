import type { SkillResult, AskResponse } from "../types/result";
import { callLLM } from "./llm-client";

const COMPOSER_SYSTEM_PROMPT = `你是一个食材灵感助手的回答组织器。你的任务是把工具返回的结构化食材推荐结果组织成自然语言回答。

规则：
1. 所有食材推荐必须来源于工具结果，不得凭空编造。
2. 可以解释、分组、改写，但不能声称工具未返回的食材与另一个食材相似。
3. 涉及过敏、疾病、营养治疗时，只给一般提醒，不做医疗建议。
4. 如果工具结果不能支持某个推荐，明确标注"这是一个启发式建议，非基于数据"。
5. 保持鼓励性语调，但不对食材的安全性做绝对保证。
6. 回答结构：推荐结果 → 为什么推荐 → 注意事项。`;

export async function composeResponse(
  userQuestion: string,
  skillResults: SkillResult[],
  useLLM = false
): Promise<AskResponse> {
  const allRecs = skillResults.flatMap((s) => s.recommendations);
  const toolsUsed = skillResults.map((s) => s.skillName);

  if (!useLLM) {
    return {
      answer: buildSimpleAnswer(allRecs, skillResults),
      trace: {
        intent: "",
        ingredients: [],
        toolsUsed,
      },
    };
  }

  try {
    const prompt = `用户问题: ${userQuestion}

工具返回结果:
${JSON.stringify(skillResults, null, 2)}

请按规则组织自然语言回答。`;

    const answer = await callLLM(prompt, COMPOSER_SYSTEM_PROMPT);
    return {
      answer,
      trace: {
        intent: "",
        ingredients: [],
        toolsUsed,
      },
    };
  } catch {
    return {
      answer: buildSimpleAnswer(allRecs, skillResults),
      trace: { intent: "", ingredients: [], toolsUsed },
    };
  }
}

function buildSimpleAnswer(
  recs: { name: string; score: number }[],
  skillResults: SkillResult[]
): string {
  if (recs.length === 0) {
    return "当前数据暂未找到匹配的食材推荐。请尝试输入其他食材或更具体的描述。";
  }

  const top = recs.slice(0, 10).map((r) => r.name.replace(/_/g, " ")).join("、");
  const notes = skillResults
    .filter((s) => s.message)
    .map((s) => s.message)
    .join("；");

  let answer = `推荐食材：${top}。`;
  if (notes) answer += `\n注意：${notes}`;
  answer += "\n注意：当前版本没有完整营养和过敏源数据库，不能保证满足特殊饮食限制。";
  return answer;
}
