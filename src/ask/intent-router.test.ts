import { beforeEach, describe, expect, it, vi } from "vitest";
import { callLLM, isLLMConfigured } from "./llm-client";
import { routeIntent } from "./intent-router";

vi.mock("./llm-client", () => ({
  callLLM: vi.fn(),
  isLLMConfigured: vi.fn(),
  isLLMRequestAbort: (error: unknown) => error instanceof Error && error.name === "AbortError",
}));

describe("routeIntent", () => {
  beforeEach(() => {
    vi.mocked(callLLM).mockReset();
    vi.mocked(isLLMConfigured).mockReturnValue(false);
  });

  it("uses local rules when no LLM endpoint is configured", async () => {
    const result = await routeIntent("我有番茄和鸡蛋，想做得更日式一点，可以加什么？");

    expect(result.intent).toBe("style_shift");
    expect(result.source).toBe("rules");
    expect(callLLM).not.toHaveBeenCalled();
  });

  it("lets LLM choose the tool plan but filters it to supported tools", async () => {
    vi.mocked(isLLMConfigured).mockReturnValue(true);
    vi.mocked(callLLM).mockResolvedValue(JSON.stringify({
      intent: "style_shift",
      matchedIntents: ["pairing", "style_shift", "unknown_tool", "complete_combo"],
      targetStyle: "Japanese",
      constraints: ["simple", "unsafe_claim"],
      confidence: 0.88,
      toolPlan: [
        { name: "find_pairings", topK: 99 },
        { name: "shift_style", strength: "strong", topK: 4 },
        { name: "complete_combination", topK: 1 },
        { name: "lookup_mode" },
      ],
    }));

    const result = await routeIntent("番茄鸡蛋做得更日式一点，简单点");

    expect(result.source).toBe("llm");
    expect(result.intent).toBe("style_shift");
    expect(result.matchedIntents).toEqual(["pairing", "style_shift", "complete_combo"]);
    expect(result.targetStyle).toBe("Japanese");
    expect(result.constraints).toEqual(["simple"]);
    expect(result.toolPlan).toEqual([
      { name: "find_pairings", topK: 12 },
      { name: "shift_style", strength: "strong", topK: 4 },
      { name: "complete_combination", topK: 3 },
    ]);
  });

  it("drops an incomplete LLM plan while retaining its safe intent parse", async () => {
    vi.mocked(isLLMConfigured).mockReturnValue(true);
    vi.mocked(callLLM).mockResolvedValue(JSON.stringify({
      intent: "style_shift",
      matchedIntents: ["pairing", "style_shift"],
      targetStyle: "Japanese",
      constraints: [],
      confidence: 0.88,
      toolPlan: [{ name: "shift_style", topK: 8 }],
    }));

    const result = await routeIntent("番茄做得更日式一点，可以加什么？");

    expect(result.source).toBe("llm");
    expect(result.toolPlan).toBeUndefined();
  });

  it("retains the primary intent when an LLM omits it from matchedIntents", async () => {
    vi.mocked(isLLMConfigured).mockReturnValue(true);
    vi.mocked(callLLM).mockResolvedValue(JSON.stringify({
      intent: "style_shift",
      matchedIntents: ["pairing"],
      targetStyle: "Japanese",
      constraints: [],
      confidence: 0.88,
      toolPlan: [
        { name: "shift_style", topK: 8 },
        { name: "find_pairings", topK: 8 },
      ],
    }));

    const result = await routeIntent("番茄做得更日式一点，可以加什么？");

    expect(result.matchedIntents).toEqual(["style_shift", "pairing"]);
    expect(result.toolPlan?.map((step) => step.name)).toEqual(["shift_style", "find_pairings"]);
  });

  it("falls back to local rules when the LLM router returns malformed JSON", async () => {
    vi.mocked(isLLMConfigured).mockReturnValue(true);
    vi.mocked(callLLM).mockResolvedValue("not json");

    const result = await routeIntent("我有番茄和鸡蛋，想做得更日式一点，可以加什么？");

    expect(result.source).toBe("rules");
    expect(result.intent).toBe("style_shift");
    expect(result.matchedIntents).toEqual(["pairing", "style_shift", "complete_combo"]);
  });

  it("falls back to local rules when the LLM router request fails", async () => {
    vi.mocked(isLLMConfigured).mockReturnValue(true);
    vi.mocked(callLLM).mockRejectedValue(new Error("LLM API error: 500"));

    const result = await routeIntent("番茄可以和什么搭配？");

    expect(result.source).toBe("rules");
    expect(result.intent).toBe("pairing");
  });
});
