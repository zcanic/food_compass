/**
 * Data preprocessing script.
 * Converts CSV files from ../data/ into optimized static assets for the browser.
 *
 * Usage: npx tsx scripts/preprocess-data.ts
 */
import fs from "fs";
import path from "path";

const DATA_SRC = path.resolve("../data");
const DATA_OUT = path.resolve("public/data");

interface VocabRow {
  name: string;
  node_id_cooc: string;
  node_id_core: string;
  node_id_chem: string;
}

interface EmbeddingRow {
  node_id: string;
  name: string;
  [dim: string]: string;
}

interface ModeRow {
  mode_id: string;
  kind: string;
  property: string;
  label: string;
  n_members: string;
  prop_z_mean: string;
  members_pipe: string;
}

interface SensoryAxisRow {
  model: string;
  model_label: string;
  axis_label: string;
  pole_a_label: string;
  pole_a_coherence: string;
  pole_a_top5_pipe: string;
  pole_b_label: string;
  pole_b_coherence: string;
  pole_b_top5_pipe: string;
  stability_jaccard: string;
  stability_cosine: string;
}

interface DirectionArithmeticRow {
  test_case: string;
  seed: string;
  model: string;
  angle_deg: string;
  hit_name: string;
  hit_is_target: string;
}

interface WeatRow {
  test: string;
  model: string;
  effect_size_d: string;
  test_stat: string;
  p_value: string;
  significance: string;
  skipped: string;
}

interface CrossModalRow {
  model: string;
  dimension: string;
  source: string;
  n: string;
  spearman_rho: string;
  p_value: string;
  n_outliers: string;
}

const STYLE_BENCHMARK_CASES: Record<string, { cases: string[]; benchmarkDirection: string }> = {
  Japanese: { cases: ["chicken + Japanese"], benchmarkDirection: "Japanese" },
  East_Asian: { cases: ["beef + East_Asian"], benchmarkDirection: "East_Asian" },
  South_Asian: { cases: ["rice + South_Asian"], benchmarkDirection: "South_Asian" },
  Mediterranean: { cases: ["salmon + Mediterranean"], benchmarkDirection: "Mediterranean" },
  Latin_American: { cases: ["corn + Latin_American"], benchmarkDirection: "Latin_American" },
  sweet: { cases: ["chicken + sweet", "beef + sweet", "salmon + sweet"], benchmarkDirection: "sweet" },
  savory_umami: { cases: ["chocolate + savory", "bread + savory", "potato + savory"], benchmarkDirection: "savory proxy" },
  sour: { cases: ["butter + sour", "chicken + sour", "rice + sour"], benchmarkDirection: "sour" },
  spicy: { cases: ["salmon + pungent", "egg + pungent", "chicken + pungent"], benchmarkDirection: "pungent proxy" },
};

function readCSV<T>(filepath: string): T[] {
  const raw = fs.readFileSync(filepath, "utf-8").trim();
  const lines = raw.split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const vals = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h.trim()] = vals[i]?.trim() ?? ""; });
    return row as unknown as T;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}

function main() {
  fs.mkdirSync(DATA_OUT, { recursive: true });

  // 1. Vocab
  const vocabRows = readCSV<VocabRow>(path.join(DATA_SRC, "vocab.csv"));
  const vocab = vocabRows.map((r) => ({
    name: r.name,
    nodeIdCooc: Number(r.node_id_cooc),
    nodeIdCore: Number(r.node_id_core),
    nodeIdChem: Number(r.node_id_chem),
  }));
  fs.writeFileSync(path.join(DATA_OUT, "vocab.json"), JSON.stringify(vocab));
  console.log(`  vocab.json: ${vocab.length} entries`);

  // 2. Embeddings -> f32.bin
  for (const model of ["cooc", "core", "chem"] as const) {
    const fileName = `epicure_${model}.csv`;
    const rows = readCSV<EmbeddingRow>(path.join(DATA_SRC, fileName));
    const dim = 300;
    const buf = new Float32Array(rows.length * dim);
    rows.forEach((row, i) => {
      const offset = i * dim;
      for (let d = 0; d < dim; d++) {
        buf[offset + d] = Number(row[`dim_${d}`] ?? 0);
      }
    });
    // L2 normalize
    for (let i = 0; i < rows.length; i++) {
      const offset = i * dim;
      let norm = 0;
      for (let d = 0; d < dim; d++) norm += buf[offset + d] * buf[offset + d];
      norm = Math.sqrt(norm);
      if (norm > 0) {
        for (let d = 0; d < dim; d++) buf[offset + d] /= norm;
      }
    }
    fs.writeFileSync(path.join(DATA_OUT, `${model}.f32.bin`), Buffer.from(buf.buffer));
    console.log(`  ${model}.f32.bin: ${rows.length} x ${dim} float32`);
  }

  // 3. Mode atlas
  const modeAtlas: Record<string, unknown[]> = {};
  for (const model of ["cooc", "core", "chem"] as const) {
    const fileName = `mode_atlas_${model}.csv`;
    const rows = readCSV<ModeRow>(path.join(DATA_SRC, fileName));
    modeAtlas[model] = rows.map((r) => ({
      modeId: r.mode_id,
      kind: r.kind,
      property: r.property,
      label: r.label,
      nMembers: Number(r.n_members),
      propZMean: Number(r.prop_z_mean),
      members: r.members_pipe.split("|").map((m) => m.trim()).filter(Boolean),
    }));
    console.log(`  mode_atlas.${model}: ${rows.length} modes`);
  }
  fs.writeFileSync(path.join(DATA_OUT, "mode_atlas.json"), JSON.stringify(modeAtlas));
  console.log("  mode_atlas.json written");

  // 4. Sensory axes
  const sensoryRows = readCSV<SensoryAxisRow>(path.join(DATA_SRC, "procrustes_sensory.csv"));
  const sensoryAxes = sensoryRows.map((row) => ({
    model: row.model,
    modelLabel: row.model_label,
    axisLabel: row.axis_label,
    poleA: {
      label: row.pole_a_label,
      coherence: row.pole_a_coherence,
      topIngredients: row.pole_a_top5_pipe.split("|").map((name) => name.trim()).filter(Boolean),
    },
    poleB: {
      label: row.pole_b_label,
      coherence: row.pole_b_coherence,
      topIngredients: row.pole_b_top5_pipe.split("|").map((name) => name.trim()).filter(Boolean),
    },
    stabilityJaccard: Number(row.stability_jaccard),
    stabilityCosine: Number(row.stability_cosine),
  }));
  fs.writeFileSync(path.join(DATA_OUT, "sensory_axes.json"), JSON.stringify(sensoryAxes));
  console.log(`  sensory_axes.json: ${sensoryAxes.length} axes`);

  // 5. Direction arithmetic benchmark summaries
  const directionRows = readCSV<DirectionArithmeticRow>(path.join(DATA_SRC, "direction_arithmetic_full.csv"));
  const styleBenchmarks = Object.entries(STYLE_BENCHMARK_CASES).map(([style, config]) =>
    summarizeStyleBenchmark(style, config, directionRows)
  );
  fs.writeFileSync(path.join(DATA_OUT, "style_direction_benchmarks.json"), JSON.stringify(styleBenchmarks));
  console.log(`  style_direction_benchmarks.json: ${styleBenchmarks.length} styles`);

  // 6. WEAT checks
  const weatRows = readCSV<WeatRow>(path.join(DATA_SRC, "weat.csv"));
  const weatChecks = weatRows.map((row) => ({
    test: row.test,
    model: row.model,
    effectSizeD: row.effect_size_d ? Number(row.effect_size_d) : null,
    testStat: row.test_stat ? Number(row.test_stat) : null,
    pValue: row.p_value ? Number(row.p_value) : null,
    significance: row.significance,
    skipped: row.skipped === "True",
  }));
  fs.writeFileSync(path.join(DATA_OUT, "weat_checks.json"), JSON.stringify(weatChecks));
  console.log(`  weat_checks.json: ${weatChecks.length} checks`);

  // 7. Cross-modal validation metrics
  const crossModalRows = readCSV<CrossModalRow>(path.join(DATA_SRC, "cross_modal.csv"));
  const crossModal = crossModalRows.map((row) => ({
    model: row.model,
    dimension: row.dimension,
    source: row.source,
    n: Number(row.n),
    spearmanRho: Number(row.spearman_rho),
    pValue: Number(row.p_value),
    nOutliers: Number(row.n_outliers),
  }));
  fs.writeFileSync(path.join(DATA_OUT, "cross_modal_evidence.json"), JSON.stringify(crossModal));
  console.log(`  cross_modal_evidence.json: ${crossModal.length} metrics`);

  // 8. Aliases (placeholder)
  const aliases: Record<string, { zh?: string[]; ja?: string[]; en_alt?: string[] }> = {
    soy_sauce: { zh: ["酱油", "生抽", "老抽", "豉油"], ja: ["しょうゆ", "醤油"], en_alt: ["soy sauce"] },
    tomato: { zh: ["番茄", "西红柿", "蕃茄"], ja: ["トマト"], en_alt: ["tomatoes"] },
    egg: { zh: ["鸡蛋", "蛋", "鸡蛋"], ja: ["たまご", "卵"], en_alt: ["eggs"] },
    chicken: { zh: ["鸡肉", "鸡胸肉", "鸡腿肉"], ja: ["鶏肉", "とりにく"] },
    rice: { zh: ["米饭", "米", "大米", "白饭"], ja: ["ごはん", "米"] },
    tofu: { zh: ["豆腐", "嫩豆腐", "老豆腐"], ja: ["とうふ", "豆腐"] },
    scallion: { zh: ["葱", "葱花", "青葱", "小葱"], ja: ["ねぎ"] },
    ginger: { zh: ["姜", "生姜"], ja: ["しょうが"] },
    garlic: { zh: ["蒜", "大蒜", "蒜头"], ja: ["にんにく"] },
    onion: { zh: ["洋葱", "洋葱头"], ja: ["たまねぎ"] },
    potato: { zh: ["土豆", "马铃薯", "洋芋"], ja: ["じゃがいも"] },
    carrot: { zh: ["胡萝卜", "红萝卜"], ja: ["にんじん"] },
    milk: { zh: ["牛奶", "奶"], ja: ["牛乳", "ぎゅうにゅう"] },
    butter: { zh: ["黄油", "牛油"], ja: ["バター"] },
    cheese: { zh: ["奶酪", "芝士", "起司"], ja: ["チーズ"] },
    salt: { zh: ["盐", "食盐"], ja: ["しお"] },
    sugar: { zh: ["糖", "白糖", "砂糖"], ja: ["さとう"] },
    black_pepper: { zh: ["黑胡椒", "胡椒"], ja: ["こしょう"] },
    olive_oil: { zh: ["橄榄油"], ja: ["オリーブオイル"] },
    sesame_oil: { zh: ["麻油", "香油", "芝麻油"], ja: ["ごま油"] },
  };
  fs.writeFileSync(path.join(DATA_OUT, "aliases_zh_en.json"), JSON.stringify(aliases));
  console.log("  aliases_zh_en.json written");

  console.log("\nPreprocessing complete.");
}

main();

function summarizeStyleBenchmark(
  style: string,
  config: { cases: string[]; benchmarkDirection: string },
  rows: DirectionArithmeticRow[]
) {
  const candidates = new Map<string, DirectionArithmeticRow[]>();
  for (const row of rows) {
    if (!config.cases.includes(row.test_case)) continue;
    if (Number(row.angle_deg) === 0) continue;

    const key = `${row.test_case}|${row.model}|${row.angle_deg}`;
    const group = candidates.get(key) ?? [];
    group.push(row);
    candidates.set(key, group);
  }

  const summaries = Array.from(candidates.values()).map((group) => ({
    style,
    testCase: group[0].test_case,
    seed: group[0].seed,
    benchmarkDirection: config.benchmarkDirection,
    model: group[0].model,
    angleDeg: Number(group[0].angle_deg),
    targetHits: group.filter((row) => row.hit_is_target === "True").length,
    totalHits: group.length,
    topHits: group.map((row) => row.hit_name),
  }));

  summaries.sort((a, b) =>
    b.targetHits - a.targetHits ||
    a.angleDeg - b.angleDeg ||
    a.testCase.localeCompare(b.testCase) ||
    a.model.localeCompare(b.model)
  );

  return summaries[0];
}
