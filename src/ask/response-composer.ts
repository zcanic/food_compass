import type { SkillResult, AskResponse } from "../types/result";
import { callLLM, isLLMRequestAbort } from "./llm-client";

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
  useLLM = false,
  options: { signal?: AbortSignal } = {}
): Promise<AskResponse> {
  const toolsUsed = skillResults.map((s) => s.skillName);

  if (!useLLM) {
    return {
      answer: buildSimpleAnswer(skillResults),
      trace: {
        intent: "",
        ingredients: [],
        toolsUsed,
        composer: "local",
        llmUsed: false,
      },
    };
  }

  try {
    const prompt = `用户问题: ${userQuestion}

工具返回结果:
${JSON.stringify(skillResults, null, 2)}

请按规则组织自然语言回答。`;

    const answer = await callLLM(prompt, COMPOSER_SYSTEM_PROMPT, { signal: options.signal });
    if (!answer.trim()) {
      throw new Error("LLM composer returned an empty response");
    }
    return {
      answer,
      trace: {
        intent: "",
        ingredients: [],
        toolsUsed,
        composer: "llm",
        llmUsed: true,
      },
    };
  } catch (error) {
    if (isLLMRequestAbort(error)) throw error;
    return {
      answer: buildSimpleAnswer(skillResults),
      trace: { intent: "", ingredients: [], toolsUsed, composer: "fallback", llmUsed: false },
    };
  }
}

function buildSimpleAnswer(skillResults: SkillResult[]): string {
  const recommendationSections = skillResults
    .filter((skill) => skill.recommendations.length > 0)
    .map((skill) => {
      const names = skill.recommendations
        .slice(0, 8)
        .map((r) => r.name.replace(/_/g, " "))
        .join("、");
      return `${toolLabel(skill.skillName)}：${names}`;
    });
  const modeSections = skillResults
    .filter((skill) => skill.modes && skill.modes.length > 0)
    .map((skill) => {
      const names = skill.modes
        ?.slice(0, 3)
        .map((mode) => `${mode.label}（${mode.model}）`)
        .join("、");
      return `${toolLabel(skill.skillName)}：${names}`;
    });

  if (recommendationSections.length === 0 && modeSections.length === 0) {
    return "当前数据暂未找到匹配的食材推荐。请尝试输入其他食材或更具体的描述。";
  }

  const notes = skillResults
    .map((s) => s.message ?? s.styleSummary)
    .filter(Boolean)
    .join("；");

  const blocks: string[] = [];
  if (recommendationSections.length > 0) {
    blocks.push(`推荐结果：\n${recommendationSections.join("\n")}`);
  }
  if (modeSections.length > 0) {
    blocks.push(`食材街区：\n${modeSections.join("\n")}`);
  }

  let answer = blocks.join("\n\n");
  if (notes) answer += `\n\n注意：${notes}`;
  answer += "\n注意：当前版本没有完整营养和过敏源数据库，不能保证满足特殊饮食限制。";
  return answer;
}

function toolLabel(skillName: string) {
  switch (skillName) {
    case "find_pairings":
      return "常见搭配";
    case "find_substitutes":
      return "风味替代";
    case "complete_combination":
      return "组合补全";
    case "shift_style":
      return "风格偏移";
    case "lookup_mode":
      return "食材街区";
    case "compare_models":
      return "模型对比";
    case "constraint_filter":
      return "约束提示";
    default:
      return skillName;
  }
}
