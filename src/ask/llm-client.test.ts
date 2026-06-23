import { afterEach, describe, expect, it, vi } from "vitest";
import { callLLM, setLLMEndpointOverride } from "./llm-client";

describe("callLLM", () => {
  afterEach(() => {
    setLLMEndpointOverride("");
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("aborts a slow endpoint after the configured timeout", async () => {
    setLLMEndpointOverride("/__slow_llm");
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => {})));

    const timeoutExpectation = expect(
      callLLM("test prompt", undefined, { timeoutMs: 25 })
    ).rejects.toThrow("LLM request timed out after 25 ms");
    await vi.advanceTimersByTimeAsync(25);

    await timeoutExpectation;
  });
});
