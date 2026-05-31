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

export interface StyleOrthogonalBenchmark {
  style: string;
  testCase: string;
  seed: string;
  benchmarkDirection: string;
  model: "cooc" | "core" | "chem";
  targetHits: number;
  totalHits: number;
  meanSnr: number;
  meanCosToSeed: number;
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

export const STYLE_ORTHOGONAL_BENCHMARKS: Record<string, StyleOrthogonalBenchmark> = {
  Japanese: {
    style: "Japanese",
    testCase: "chicken + Japanese",
    seed: "chicken",
    benchmarkDirection: "Japanese",
    model: "core",
    targetHits: 5,
    totalHits: 5,
    meanSnr: 0.5378,
    meanCosToSeed: 0.37664,
    source: "direction_orthogonal.csv",
  },
  East_Asian: {
    style: "East_Asian",
    testCase: "beef + East_Asian",
    seed: "beef",
    benchmarkDirection: "East_Asian",
    model: "core",
    targetHits: 5,
    totalHits: 5,
    meanSnr: 0.55878,
    meanCosToSeed: 0.39254,
    source: "direction_orthogonal.csv",
  },
  South_Asian: {
    style: "South_Asian",
    testCase: "rice + South_Asian",
    seed: "rice",
    benchmarkDirection: "South_Asian",
    model: "core",
    targetHits: 5,
    totalHits: 5,
    meanSnr: 0.58632,
    meanCosToSeed: 0.44778,
    source: "direction_orthogonal.csv",
  },
  Mediterranean: {
    style: "Mediterranean",
    testCase: "salmon + Mediterranean",
    seed: "salmon",
    benchmarkDirection: "Mediterranean",
    model: "chem",
    targetHits: 5,
    totalHits: 5,
    meanSnr: 0.25342,
    meanCosToSeed: 0.1815,
    source: "direction_orthogonal.csv",
  },
  Latin_American: {
    style: "Latin_American",
    testCase: "corn + Latin_American",
    seed: "corn",
    benchmarkDirection: "Latin_American",
    model: "chem",
    targetHits: 5,
    totalHits: 5,
    meanSnr: 0.27076,
    meanCosToSeed: 0.20654,
    source: "direction_orthogonal.csv",
  },
  sweet: {
    style: "sweet",
    testCase: "salmon + sweet",
    seed: "salmon",
    benchmarkDirection: "sweet",
    model: "chem",
    targetHits: 5,
    totalHits: 5,
    meanSnr: 0.3,
    meanCosToSeed: 0.10492,
    source: "direction_orthogonal.csv",
  },
  savory_umami: {
    style: "savory_umami",
    testCase: "chocolate + savory",
    seed: "chocolate",
    benchmarkDirection: "savory proxy",
    model: "chem",
    targetHits: 3,
    totalHits: 5,
    meanSnr: 0.24164,
    meanCosToSeed: 0.1126,
    source: "direction_orthogonal.csv",
  },
  sour: {
    style: "sour",
    testCase: "chicken + sour",
    seed: "chicken",
    benchmarkDirection: "sour",
    model: "core",
    targetHits: 2,
    totalHits: 5,
    meanSnr: 0.28122,
    meanCosToSeed: 0.40416,
    source: "direction_orthogonal.csv",
  },
  spicy: {
    style: "spicy",
    testCase: "chicken + pungent",
    seed: "chicken",
    benchmarkDirection: "pungent proxy",
    model: "chem",
    targetHits: 4,
    totalHits: 5,
    meanSnr: 0.15786,
    meanCosToSeed: 0.1339,
    source: "direction_orthogonal.csv",
  },
};
