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

export const PRODUCT_LIMITS = [
  "推荐候选来自 embedding 检索和 mode atlas，不是完整菜谱数据库。",
  "风味相似不等于现实中一定好吃，也不等于可以 1:1 替换。",
  "当前没有可靠的过敏源、医疗、宗教饮食、营养硬过滤数据。",
  "风格迁移是产品层 seed set 球面插值实验，不是论文完整 direction system。",
  "本产品不是官方 Epicure App，也没有声称重新训练了底层模型。",
];
