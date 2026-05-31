import { describe, expect, it } from "vitest";
import { dotProduct, l2Norm, slerpVectors } from "./math";

describe("slerpVectors", () => {
  it("moves halfway along the unit arc between orthogonal vectors", () => {
    const result = slerpVectors(
      new Float32Array([1, 0]),
      new Float32Array([0, 1]),
      0.5,
      2
    );

    expect(result[0]).toBeCloseTo(Math.SQRT1_2, 5);
    expect(result[1]).toBeCloseTo(Math.SQRT1_2, 5);
    expect(l2Norm(result, 2)).toBeCloseTo(1, 5);
  });

  it("clamps travel fraction and preserves endpoints", () => {
    const start = new Float32Array([1, 0]);
    const end = new Float32Array([0, 1]);

    expect(dotProduct(slerpVectors(start, end, -1, 2), start, 2)).toBeCloseTo(1, 5);
    expect(dotProduct(slerpVectors(start, end, 2, 2), end, 2)).toBeCloseTo(1, 5);
  });
});
