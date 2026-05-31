export const EMBEDDING_DIM = 300;
export const VOCAB_SIZE = 1790;

export const MODEL_NAMES = ["cooc", "core", "chem"] as const;

export const STYLE_SEED_SETS: Record<string, string[]> = {
  Japanese: ["miso", "dashi", "mirin", "soy_sauce", "nori"],
  East_Asian: ["soy_sauce", "scallion", "ginger", "sesame_oil", "tofu"],
  South_Asian: ["cumin", "coriander", "turmeric", "curry_leaf", "garam_masala"],
  Mediterranean: ["olive_oil", "basil", "oregano", "feta_cheese", "lemon"],
  Latin_American: ["lime", "coriander", "chili_pepper", "corn", "black_bean"],
  sweet: ["sugar", "honey", "vanilla", "chocolate"],
  savory_umami: ["soy_sauce", "miso", "mushroom", "parmesan_cheese"],
  sour: ["lemon", "vinegar", "lime", "yogurt"],
  spicy: ["chili_pepper", "black_pepper", "ginger", "mustard"],
};

export const STYLE_LABELS: Record<string, string> = {
  Japanese: "日式",
  East_Asian: "东亚",
  South_Asian: "南亚",
  Mediterranean: "地中海",
  Latin_American: "拉美",
  sweet: "甜味",
  savory_umami: "咸鲜",
  sour: "酸味",
  spicy: "辛辣",
};

export const STYLE_STRENGTH_ALPHA: Record<string, number> = {
  light: 0.2,
  medium: 0.4,
  strong: 0.6,
};

export const STYLE_STRENGTH_LABELS: Record<string, string> = {
  light: "轻微",
  medium: "中等",
  strong: "强烈",
};
