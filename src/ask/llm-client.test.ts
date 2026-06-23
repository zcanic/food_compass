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

  it("honors an external AbortSignal before the timeout elapses", async () => {
    setLLMEndpointOverride("/__abort_llm");
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => {})));
    const controller = new AbortController();
    const abortExpectation = expect(
      callLLM("test prompt", undefined, { signal: controller.signal })
    ).rejects.toMatchObject({ name: "AbortError" });

    controller.abort();

    await abortExpectation;
  });
});
