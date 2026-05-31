export interface ConstraintFilterResult {
  kept: string[];
  removed: { item: string; reason: string }[];
  status: "not_enabled" | "ok";
  message: string;
}

export function constraintFilter(
  candidates: string[],
  constraints: string[]
): ConstraintFilterResult {
  const requested = constraints.length > 0 ? `请求的约束：${constraints.join("、")}。` : "";

  return {
    kept: candidates,
    removed: [],
    status: "not_enabled",
    message: `${requested}当前版本未接入完整饮食约束数据，结果未做可靠过滤。`,
  };
}
