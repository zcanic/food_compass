import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CROSS_MODAL_EVIDENCE,
  EVIDENCE_METRICS,
  LINEAR_PROBE_EVIDENCE,
  MODEL_AXIS,
  PRODUCT_LIMITS,
  RESEARCH_FACTS,
  SENSORY_AXES,
  WEAT_CHECKS,
} from "./evidence";

describe("research evidence copy", () => {
  it("covers all three sibling model perspectives", () => {
    expect(MODEL_AXIS.map((entry) => entry.model)).toEqual(["cooc", "core", "chem"]);
  });

  it("keeps metrics tied to explicit sources", () => {
    expect(EVIDENCE_METRICS.every((metric) => metric.source.length > 0)).toBe(true);
    expect(EVIDENCE_METRICS.some((metric) => metric.source.includes("linear_probe"))).toBe(true);
    expect(LINEAR_PROBE_EVIDENCE.every((entry) => entry.source === "linear_probe.csv")).toBe(true);
    expect(EVIDENCE_METRICS.some((metric) => metric.source.includes("cross_modal"))).toBe(true);
    expect(CROSS_MODAL_EVIDENCE.every((entry) => entry.source === "cross_modal.csv")).toBe(true);
    expect(WEAT_CHECKS.every((check) => check.source === "weat.csv")).toBe(true);
  });

  it("summarizes the Procrustes sensory axis for every model", () => {
    expect(SENSORY_AXES.map((axis) => axis.model)).toEqual(["cooc", "core", "chem"]);
    expect(SENSORY_AXES.every((axis) => axis.source === "procrustes_sensory.csv")).toBe(true);
    expect(SENSORY_AXES[0].stabilityCosine).toBe("0.823");
  });

  it("keeps sensory-axis copy aligned with the generated static asset", () => {
    const generated = readJSON<SensoryAxisAsset[]>("sensory_axes.json");

    expect(SENSORY_AXES.map((axis) => ({
      model: axis.model,
      axisLabel: axis.axisLabel,
      poleA: axis.poleA,
      poleB: axis.poleB,
      stabilityCosine: axis.stabilityCosine,
      stabilityJaccard: axis.stabilityJaccard,
    }))).toEqual(generated.map((axis) => ({
      model: axis.model,
      axisLabel: axis.axisLabel,
      poleA: axis.poleA.label,
      poleB: axis.poleB.label,
      stabilityCosine: axis.stabilityCosine.toFixed(3),
      stabilityJaccard: axis.stabilityJaccard.toFixed(3),
    })));
  });

  it("keeps linear-probe copy aligned with the generated static asset", () => {
    const generated = readJSON<LinearProbeAsset[]>("linear_probe_metrics.json");
    const coocSouthAsian = findLinearProbe(generated, "cooc", "cuisine_South_Asian");
    const coreSouthAsian = findLinearProbe(generated, "core", "cuisine_South_Asian");
    const coreNova = findLinearProbe(generated, "core", "nova_level");

    expect(LINEAR_PROBE_EVIDENCE.find((entry) => entry.label === "Cooc South Asian")?.value)
      .toBe(`F1 ${format3(coocSouthAsian.f1Mean)}`);
    expect(LINEAR_PROBE_EVIDENCE.find((entry) => entry.label === "Core South Asian")?.value)
      .toBe(`F1 ${format3(coreSouthAsian.f1Mean)}`);
    expect(LINEAR_PROBE_EVIDENCE.find((entry) => entry.label === "Core NOVA level")?.value)
      .toBe(`F1 ${format3(coreNova.f1Mean)}`);
  });

  it("keeps cross-modal copy aligned with the generated static asset", () => {
    const generated = readJSON<CrossModalAsset[]>("cross_modal_evidence.json");
    const coocFiber = findCrossModal(generated, "cooc", "usda_fiber_g");
    const coreBitter = findCrossModal(generated, "core", "cf_bitter");
    const coreSodium = findCrossModal(generated, "core", "usda_sodium_mg");

    expect(CROSS_MODAL_EVIDENCE.find((entry) => entry.label === "Cooc / USDA fiber")?.value)
      .toBe(`rho ${format3(coocFiber.spearmanRho)}`);
    expect(CROSS_MODAL_EVIDENCE.find((entry) => entry.label === "Core / CF bitter")?.value)
      .toBe(`rho ${format3(coreBitter.spearmanRho)}`);
    expect(CROSS_MODAL_EVIDENCE.find((entry) => entry.label === "Core / USDA sodium")?.value)
      .toBe(`rho ${format3(coreSodium.spearmanRho)}`);
  });

  it("states corpus scale and avoids unsupported product claims", () => {
    expect(RESEARCH_FACTS.some((fact) => fact.value === "1,790")).toBe(true);
    expect(WEAT_CHECKS.some((check) => check.value === "skipped")).toBe(true);
    expect(PRODUCT_LIMITS.join(" ")).toContain("不是官方 Epicure App");
    expect(PRODUCT_LIMITS.join(" ")).toContain("没有声称重新训练");
  });
});

function readJSON<T>(filename: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), "public", "data", filename), "utf-8")) as T;
}

function format3(value: number): string {
  return (Math.round((value + Number.EPSILON) * 1000) / 1000).toFixed(3);
}

interface SensoryAxisAsset {
  model: "cooc" | "core" | "chem";
  axisLabel: string;
  poleA: { label: string };
  poleB: { label: string };
  stabilityCosine: number;
  stabilityJaccard: number;
}

interface LinearProbeAsset {
  model: "cooc" | "core";
  dimension: string;
  f1Mean: number;
}

interface CrossModalAsset {
  model: "cooc" | "core";
  dimension: string;
  spearmanRho: number;
}

function findLinearProbe(
  metrics: LinearProbeAsset[],
  model: "cooc" | "core",
  dimension: string
): LinearProbeAsset {
  const metric = metrics.find((entry) => entry.model === model && entry.dimension === dimension);
  if (!metric) throw new Error(`Missing linear probe metric: ${model} ${dimension}`);
  return metric;
}

function findCrossModal(
  metrics: CrossModalAsset[],
  model: "cooc" | "core",
  dimension: string
): CrossModalAsset {
  const metric = metrics.find((entry) => entry.model === model && entry.dimension === dimension);
  if (!metric) throw new Error(`Missing cross-modal metric: ${model} ${dimension}`);
  return metric;
}
