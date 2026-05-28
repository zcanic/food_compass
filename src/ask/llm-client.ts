const LLM_API_URL = import.meta.env.VITE_LLM_API_URL ?? "";

export async function callLLM(prompt: string, systemPrompt?: string): Promise<string> {
  if (!LLM_API_URL) {
    throw new Error("LLM API URL not configured. Set VITE_LLM_API_URL environment variable.");
  }

  const messages: { role: string; content: string }[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const res = await fetch(LLM_API_URL, {
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
