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
    }));

    const result = await routeIntent("番茄鸡蛋做得更日式一点，简单点");

    expect(result.source).toBe("llm");
    expect(result.intent).toBe("style_shift");
    expect(result.matchedIntents).toEqual(["pairing", "style_shift", "complete_combo"]);
    expect(result.targetStyle).toBe("Japanese");
    expect(result.constraints).toEqual(["simple"]);
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
