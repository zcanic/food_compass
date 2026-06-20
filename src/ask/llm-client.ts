const LLM_API_URL = import.meta.env.VITE_LLM_API_URL ?? "";
const LLM_API_URL_STORAGE_KEY = "food_compass_llm_api_url";

export function isLLMConfigured(): boolean {
  return getLLMApiUrl().trim().length > 0;
}

export async function callLLM(prompt: string, systemPrompt?: string): Promise<string> {
  const llmApiUrl = getLLMApiUrl();
  if (!llmApiUrl) {
    throw new Error("LLM API URL not configured. Set VITE_LLM_API_URL environment variable.");
  }

  const messages: { role: string; content: string }[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const res = await fetch(llmApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, max_tokens: 512 }),
  });

  if (!res.ok) {
    throw new Error(`LLM API error: ${res.status}`);
  }

  const data = await res.json();
  return data.content ?? data.choices?.[0]?.message?.content ?? "";
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
