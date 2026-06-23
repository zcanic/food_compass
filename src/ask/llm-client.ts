const LLM_API_URL = import.meta.env.VITE_LLM_API_URL ?? "";
const LLM_API_URL_STORAGE_KEY = "food_compass_llm_api_url";
export const LLM_REQUEST_TIMEOUT_MS = 8_000;

interface LLMRequestOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

export function isLLMConfigured(): boolean {
  return getLLMApiUrl().trim().length > 0;
}

export function isLLMRequestAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function callLLM(
  prompt: string,
  systemPrompt?: string,
  options: LLMRequestOptions = {}
): Promise<string> {
  const llmApiUrl = getLLMApiUrl();
  if (!llmApiUrl) {
    throw new Error("LLM API URL not configured. Set VITE_LLM_API_URL environment variable.");
  }
  if (options.signal?.aborted) {
    throw createAbortError();
  }

  const messages: { role: string; content: string }[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const timeoutMs = Math.max(1, Math.round(options.timeoutMs ?? LLM_REQUEST_TIMEOUT_MS));
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let removeExternalAbortListener: (() => void) | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`LLM request timed out after ${timeoutMs} ms`));
    }, timeoutMs);
  });
  const cancellation = options.signal
    ? new Promise<never>((_, reject) => {
        const abort = () => {
          controller.abort();
          reject(createAbortError());
        };
        options.signal?.addEventListener("abort", abort, { once: true });
        removeExternalAbortListener = () => options.signal?.removeEventListener("abort", abort);
      })
    : null;

  try {
    const pending: Promise<Response | never>[] = [
      fetch(llmApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, max_tokens: 512 }),
        signal: controller.signal,
      }),
      timeout,
    ];
    if (cancellation) pending.push(cancellation);
    const res = await Promise.race(pending);

    if (!res.ok) {
      throw new Error(`LLM API error: ${res.status}`);
    }

    const data = await res.json();
    return data.content ?? data.choices?.[0]?.message?.content ?? "";
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    removeExternalAbortListener?.();
  }
}

export function getLLMApiUrl(): string {
  if (typeof window === "undefined") return LLM_API_URL;
  try {
    return window.localStorage.getItem(LLM_API_URL_STORAGE_KEY) ?? LLM_API_URL;
  } catch {
    return LLM_API_URL;
  }
}

export function getLLMEndpointOverride(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(LLM_API_URL_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setLLMEndpointOverride(url: string): void {
  if (typeof window === "undefined") return;
  const normalized = url.trim();
  try {
    if (normalized) {
      window.localStorage.setItem(LLM_API_URL_STORAGE_KEY, normalized);
    } else {
      window.localStorage.removeItem(LLM_API_URL_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function createAbortError(): Error {
  const error = new Error("LLM request aborted");
  error.name = "AbortError";
  return error;
}
