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

  // 4. Aliases (placeholder)
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
