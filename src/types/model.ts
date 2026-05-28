export type ModelName = "cooc" | "core" | "chem";

export type ModelLabel = "常见搭配" | "风味相似" | "综合推荐";

export const MODEL_LABELS: Record<ModelName, ModelLabel> = {
  cooc: "常见搭配",
  core: "综合推荐",
  chem: "风味相似",
};

export const MODEL_EXPLANATIONS: Record<ModelName, string> = {
  cooc: "基于菜谱共现关系，适合找还能加什么。",
  core: "结合共现和化学信号，适合不知道选哪个时使用。",
  chem: "基于风味化学关系，适合找替代和相似风味。",
};
