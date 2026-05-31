import { describe, expect, it } from "vitest";
import { ruleBasedIntent } from "./intent-rules";

describe("ruleBasedIntent", () => {
  it("routes explicit substitution questions to substitute", () => {
    const result = ruleBasedIntent("没有罗勒可以用什么替代？");

    expect(result?.intent).toBe("substitute");
  });

  it("prioritizes target style over generic pairing language", () => {
    const result = ruleBasedIntent("我有番茄和鸡蛋，想做得更日式一点，可以加什么？");

    expect(result?.intent).toBe("style_shift");
    expect(result?.targetStyle).toBe("Japanese");
    expect(result?.multiIntent).toBe(true);
  });

  it("captures dietary constraints as warnings instead of hard filters", () => {
    const result = ruleBasedIntent("我想要低脂高蛋白的鸡肉搭配");

    expect(result?.intent).toBe("pairing");
    expect(result?.constraints).toEqual(["low_fat", "high_protein"]);
  });

  it("returns null when no supported intent is present", () => {
    expect(ruleBasedIntent("今天心情不错")).toBeNull();
  });
});
