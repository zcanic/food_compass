import { describe, expect, it } from "vitest";
import {
  EVIDENCE_METRICS,
  MODEL_AXIS,
  PRODUCT_LIMITS,
  RESEARCH_FACTS,
  SENSORY_AXES,
} from "./evidence";

describe("research evidence copy", () => {
  it("covers all three sibling model perspectives", () => {
    expect(MODEL_AXIS.map((entry) => entry.model)).toEqual(["cooc", "core", "chem"]);
  });

  it("keeps metrics tied to explicit sources", () => {
    expect(EVIDENCE_METRICS.every((metric) => metric.source.length > 0)).toBe(true);
    expect(EVIDENCE_METRICS.some((metric) => metric.source.includes("linear_probe"))).toBe(true);
    expect(EVIDENCE_METRICS.some((metric) => metric.source.includes("cross_modal"))).toBe(true);
  });

  it("summarizes the Procrustes sensory axis for every model", () => {
    expect(SENSORY_AXES.map((axis) => axis.model)).toEqual(["cooc", "core", "chem"]);
    expect(SENSORY_AXES.every((axis) => axis.source === "procrustes_sensory.csv")).toBe(true);
    expect(SENSORY_AXES[0].stabilityCosine).toBe("0.823");
  });

  it("states corpus scale and avoids unsupported product claims", () => {
    expect(RESEARCH_FACTS.some((fact) => fact.value === "1,790")).toBe(true);
    expect(PRODUCT_LIMITS.join(" ")).toContain("不是官方 Epicure App");
    expect(PRODUCT_LIMITS.join(" ")).toContain("没有声称重新训练");
  });
});
