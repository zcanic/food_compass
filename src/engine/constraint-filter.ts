export interface ConstraintFilterResult {
  kept: string[];
  removed: { item: string; reason: string }[];
  status: "not_enabled" | "ok";
  message: string;
}

export function constraintFilter(
  candidates: string[],
  _constraints: string[]
): ConstraintFilterResult {
  return {
    kept: candidates,
    removed: [],
    status: "not_enabled",
    message: "当前版本未接入完整饮食约束数据，结果未做可靠过滤。",
  };
}
