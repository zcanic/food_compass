export interface StyleDirectionBenchmark {
  style: string;
  testCase: string;
  seed: string;
  benchmarkDirection: string;
  model: "cooc" | "core" | "chem";
  angleDeg: number;
  targetHits: number;
  totalHits: number;
  source: string;
}

export const STYLE_DIRECTION_BENCHMARKS: Record<string, StyleDirectionBenchmark> = {
  Japanese: {
    style: "Japanese",
    testCase: "chicken + Japanese",
    seed: "chicken",
    benchmarkDirection: "Japanese",
    model: "chem",
    angleDeg: 30,
    targetHits: 5,
    totalHits: 5,
    source: "direction_arithmetic_full.csv",
  },
  East_Asian: {
    style: "East_Asian",
    testCase: "beef + East_Asian",
    seed: "beef",
    benchmarkDirection: "East_Asian",
    model: "core",
    angleDeg: 30,
    targetHits: 5,
    totalHits: 5,
    source: "direction_arithmetic_full.csv",
  },
  South_Asian: {
    style: "South_Asian",
    testCase: "rice + South_Asian",
    seed: "rice",
    benchmarkDirection: "South_Asian",
    model: "chem",
    angleDeg: 30,
    targetHits: 5,
    totalHits: 5,
    source: "direction_arithmetic_full.csv",
  },
  Mediterranean: {
    style: "Mediterranean",
    testCase: "salmon + Mediterranean",
    seed: "salmon",
    benchmarkDirection: "Mediterranean",
    model: "chem",
    angleDeg: 60,
    targetHits: 4,
    totalHits: 5,
    source: "direction_arithmetic_full.csv",
  },
  Latin_American: {
    style: "Latin_American",
    testCase: "corn + Latin_American",
    seed: "corn",
    benchmarkDirection: "Latin_American",
    model: "chem",
    angleDeg: 30,
    targetHits: 5,
    totalHits: 5,
    source: "direction_arithmetic_full.csv",
  },
  sweet: {
    style: "sweet",
    testCase: "chicken + sweet",
    seed: "chicken",
    benchmarkDirection: "sweet",
    model: "chem",
    angleDeg: 60,
    targetHits: 5,
    totalHits: 5,
    source: "direction_arithmetic_full.csv",
  },
  savory_umami: {
    style: "savory_umami",
    testCase: "bread + savory",
    seed: "bread",
    benchmarkDirection: "savory proxy",
    model: "cooc",
    angleDeg: 30,
    targetHits: 5,
    totalHits: 5,
    source: "direction_arithmetic_full.csv",
  },
  sour: {
    style: "sour",
    testCase: "rice + sour",
    seed: "rice",
    benchmarkDirection: "sour",
    model: "chem",
    angleDeg: 60,
    targetHits: 4,
    totalHits: 5,
    source: "direction_arithmetic_full.csv",
  },
  spicy: {
    style: "spicy",
    testCase: "salmon + pungent",
    seed: "salmon",
    benchmarkDirection: "pungent proxy",
    model: "chem",
    angleDeg: 30,
    targetHits: 3,
    totalHits: 5,
    source: "direction_arithmetic_full.csv",
  },
};
