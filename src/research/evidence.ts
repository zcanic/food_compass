import type { ModelName } from "../types/model";

export interface ResearchFact {
  label: string;
  value: string;
  detail: string;
}

export interface ModelAxisEntry {
  model: ModelName;
  label: string;
  signal: string;
  bestFor: string;
}

export interface EvidenceMetric {
  label: string;
  value: string;
  source: string;
  detail: string;
}

export interface SensoryAxisEntry {
  model: ModelName;
  label: string;
  axisLabel: string;
  poleA: string;
  poleB: string;
  stabilityCosine: string;
  stabilityJaccard: string;
  source: string;
}

export interface WeatCheckEntry {
  label: string;
  value: string;
  source: string;
  detail: string;
}

export interface CrossModalEvidenceEntry {
  model: ModelName;
  label: string;
  value: string;
  source: string;
  detail: string;
}

export interface LinearProbeEvidenceEntry {
  label: string;
  value: string;
  source: string;
  detail: string;
}

export interface ContinuousProbeEvidenceEntry {
  label: string;
  value: string;
  source: string;
  detail: string;
}

export interface ModeAtlasSummaryEntry {
  model: ModelName;
  label: string;
  value: string;
  source: string;
  detail: string;
}

export const RESEARCH_FACTS: ResearchFact[] = [
  {
    label: "规范食材",
    value: "1,790",
    detail: "所有检索都落在这个 canonical ingredient vocabulary 内。",
  },
  {
    label: "向量维度",
    value: "300D",
    detail: "Cooc/Core/Chem 使用同一维度，支持统一的最近邻、组合和方向操作。",
  },
  {
    label: "菜谱语料",
    value: "4.14M",
    detail: "论文聚合多语言菜谱后归一化到同一食材词表。",
  },
  {
    label: "共现边",
    value: "203,508",
    detail: "Cooc 主要使用食材-食材 NPMI 共现图。",
  },
  {
    label: "化学边",
    value: "80,019",
    detail: "Core/Chem 使用食材-风味化合物 typed edges。",
  },
];

export const MODEL_AXIS: ModelAxisEntry[] = [
  {
    model: "cooc",
    label: "常见搭配",
    signal: "菜谱共现",
    bestFor: "找还能加什么、理解厨房语境里的常见同伴。",
  },
  {
    model: "core",
    label: "综合推荐",
    signal: "共现 + 化学",
    bestFor: "在搭配和风味相似之间取折中，适合作为默认探索视角。",
  },
  {
    model: "chem",
    label: "风味相似",
    signal: "风味化合物",
    bestFor: "找替代和相似风味，但不保证菜谱中常一起出现。",
  },
];

export const EVIDENCE_METRICS: EvidenceMetric[] = [
  {
    label: "菜系可分性",
    value: "d 2.43 / 2.70 / 3.07",
    source: "paper abstract",
    detail: "论文报告 Cooc/Core/Chem 在 8 个 cuisine macro-region probes 上都有线性可分信号。",
  },
  {
    label: "菜系探针 F1",
    value: "0.92 / 0.93",
    source: "linear_probe.csv",
    detail: "本地补充 CSV 中 Cooc/Core 的 cuisine probe 平均 F1 接近 0.9，支持把模型作为粗粒度风格导航底座。",
  },
  {
    label: "跨模态营养/风味相关",
    value: "rho 0.57 / 0.59",
    source: "cross_modal.csv",
    detail: "本地补充 CSV 中 Cooc 对 USDA fiber、Core 对 bitter 等维度有较强 Spearman 相关。",
  },
  {
    label: "化学覆盖限制",
    value: "523 hubs",
    source: "paper limitations",
    detail: "只有一部分食材直接锚定 FlavorDB 化合物，非 hub 食材的化学信号更间接。",
  },
];

export const SENSORY_AXES: SensoryAxisEntry[] = [
  {
    model: "cooc",
    label: "常见搭配",
    axisLabel: "Savory-Umami to Sweet-Floral Confection",
    poleA: "Savory Pantry Staples",
    poleB: "Sweet Confectionery & Floral Baking",
    stabilityCosine: "0.823",
    stabilityJaccard: "0.622",
    source: "procrustes_sensory.csv",
  },
  {
    model: "core",
    label: "综合推荐",
    axisLabel: "Sweet-Floral Aromatics vs Savory-Protein Staples",
    poleA: "Floral-Sweet Confections & Liqueurs",
    poleB: "Savory Staples & Plant Milks",
    stabilityCosine: "0.738",
    stabilityJaccard: "0.277",
    source: "procrustes_sensory.csv",
  },
  {
    model: "chem",
    label: "风味相似",
    axisLabel: "Savory-Umami to Sweet-Baked Spectrum",
    poleA: "Savory Pantry & Umami Staples",
    poleB: "Sweet Baking & Confectionery",
    stabilityCosine: "0.576",
    stabilityJaccard: "0.304",
    source: "procrustes_sensory.csv",
  },
];

export const WEAT_CHECKS: WeatCheckEntry[] = [
  {
    label: "European vs Asian",
    value: "d 1.65 / 1.85",
    source: "weat.csv",
    detail: "Cooc/Core 都显示显著关联；这是语料和嵌入空间里的文化关联信号，不应包装成价值判断。",
  },
  {
    label: "Sweet vs Savory",
    value: "d 1.87 / 1.80",
    source: "weat.csv",
    detail: "甜/咸语义轴很强，说明模型可用于风味导航，也说明推荐解释需要避免把轴当成绝对分类。",
  },
  {
    label: "Land vs Sea Protein",
    value: "d 1.37 / 1.35",
    source: "weat.csv",
    detail: "蛋白来源存在稳定分离，适合解释相似性差异，但不等同于营养或可持续性判断。",
  },
  {
    label: "Health Halo",
    value: "skipped",
    source: "weat.csv",
    detail: "补充数据中该项被跳过；当前产品不能声称可以可靠判断健康光环、减脂或医疗饮食。",
  },
];

export const CROSS_MODAL_EVIDENCE: CrossModalEvidenceEntry[] = [
  {
    model: "cooc",
    label: "Cooc / USDA fiber",
    value: "rho 0.570",
    source: "cross_modal.csv",
    detail: "Cooc 与 USDA fiber_g 的 Spearman 相关最高，说明菜谱共现空间也携带部分营养结构信号。",
  },
  {
    model: "core",
    label: "Core / CF bitter",
    value: "rho 0.590",
    source: "cross_modal.csv",
    detail: "Core 与 ChemFlavor bitter 的相关最高，支持 Core 作为共现和化学信号的折中空间。",
  },
  {
    model: "core",
    label: "Core / USDA sodium",
    value: "rho 0.553",
    source: "cross_modal.csv",
    detail: "外部营养维度也会在嵌入空间中显现，但当前产品没有把它实现为可靠营养过滤。",
  },
];

export const LINEAR_PROBE_EVIDENCE: LinearProbeEvidenceEntry[] = [
  {
    label: "Cooc South Asian",
    value: "F1 0.952",
    source: "linear_probe.csv",
    detail: "Cooc 的 South Asian cuisine probe 很强，适合解释 recipe-context 风格邻近。",
  },
  {
    label: "Core South Asian",
    value: "F1 0.962",
    source: "linear_probe.csv",
    detail: "Core 在同一 probe 上更高，但这仍是离线线性可分性，不是严格菜系判定器。",
  },
  {
    label: "Core NOVA level",
    value: "F1 0.621",
    source: "linear_probe.csv",
    detail: "加工度信号弱于 cuisine probes，当前产品不应把它包装成可靠健康或加工度过滤。",
  },
];

export const CONTINUOUS_PROBE_EVIDENCE: ContinuousProbeEvidenceEntry[] = [
  {
    label: "Core sweet",
    value: "rho 0.468",
    source: "linear_probe_continuous.csv",
    detail: "Core 中甜味连续维度可读性最高，适合作为风味解释证据，而不是甜度数值预测。",
  },
  {
    label: "Core bitter",
    value: "rho 0.461",
    source: "linear_probe_continuous.csv",
    detail: "苦味也有较强连续信号，和 cross-modal 的 CF bitter 结果互相支撑。",
  },
  {
    label: "Cooc protein/fat",
    value: "rho 0.392",
    source: "linear_probe_continuous.csv",
    detail: "Cooc 中蛋白/脂肪比例可被弱到中等程度读出，但仍不足以作为可靠营养过滤器。",
  },
];

export const MODE_ATLAS_SUMMARY: ModeAtlasSummaryEntry[] = [
  {
    model: "cooc",
    label: "Cooc mode atlas",
    value: "150 modes",
    source: "mode_atlas_cooc.csv",
    detail: "17 binary / 73 continuous / 60 factor；最大街区是 Mediterranean savory herbs and cheeses，243 个成员。",
  },
  {
    model: "core",
    label: "Core mode atlas",
    value: "193 modes",
    source: "mode_atlas_core.csv",
    detail: "24 binary / 82 continuous / 87 factor；最大街区是 Mediterranean savory pantry staples，218 个成员。",
  },
  {
    model: "chem",
    label: "Chem mode atlas",
    value: "200 modes",
    source: "mode_atlas_chem.csv",
    detail: "19 binary / 94 continuous / 87 factor；最大街区是 Processed deli meats cheeses and condiments，254 个成员。",
  },
];

export const PRODUCT_LIMITS = [
  "推荐候选来自 embedding 检索和 mode atlas，不是完整菜谱数据库。",
  "风味相似不等于现实中一定好吃，也不等于可以 1:1 替换。",
  "当前没有可靠的过敏源、医疗、宗教饮食、营养硬过滤数据。",
  "风格迁移是产品层 seed set 向量插值实验，不是论文完整 direction system。",
  "本产品不是官方 Epicure App，也没有声称重新训练了底层模型。",
];
