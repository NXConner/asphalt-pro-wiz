// Gemini API client. Reads key from import.meta.env.VITE_GEMINI_API_KEY
// For production, route via a backend to avoid exposing keys.

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

type Content = { role?: "user" | "model"; parts: Part[] };

const GEMINI_GENERATE_URL = (model: string, apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const GEMINI_EMBED_URL = (apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

export async function generateChat(userMessage: string, context?: string): Promise<string> {
  const envAny = (import.meta as any)?.env ?? (globalThis as any)?.process?.env ?? {};
  const proxyUrl = envAny.VITE_GEMINI_PROXY_URL as string | undefined;
  const apiKey = envAny.VITE_GEMINI_API_KEY as string | undefined;

  const contents: Content[] = [
    context ? { role: "user", parts: [{ text: context }] } : undefined,
    { role: "user", parts: [{ text: userMessage }] },
  ].filter(Boolean) as Content[];

  if (proxyUrl) {
    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "chat", contents }),
    });
    if (!res.ok) throw new Error(`Gemini proxy error: ${res.status}`);
    const data = await res.json();
    return data?.text ?? "";
  }

  if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");
  const response = await fetch(GEMINI_GENERATE_URL("gemini-1.5-pro-latest", apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });
  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

export async function analyzeImage(
  base64Data: string,
  mimeType: string,
  prompt: string,
): Promise<string> {
  const envAny = (import.meta as any)?.env ?? (globalThis as any)?.process?.env ?? {};
  const proxyUrl = envAny.VITE_GEMINI_PROXY_URL as string | undefined;
  const apiKey = envAny.VITE_GEMINI_API_KEY as string | undefined;

  const contents: Content[] = [
    {
      role: "user",
      parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }],
    },
  ];

  if (proxyUrl) {
    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "image", contents }),
    });
    if (!res.ok) throw new Error(`Gemini proxy error: ${res.status}`);
    const data = await res.json();
    return data?.text ?? "";
  }

  if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");
  const response = await fetch(GEMINI_GENERATE_URL("gemini-1.5-flash-latest", apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });
  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

export async function embedText(text: string): Promise<number[]> {
  const envAny = (import.meta as any)?.env ?? (globalThis as any)?.process?.env ?? {};
  const proxyUrl = envAny.VITE_GEMINI_PROXY_URL as string | undefined;
  const apiKey = (envAny.VITE_GEMINI_API_KEY as string | undefined) ?? envAny.GEMINI_API_KEY;
  const body = { content: { parts: [{ text }] } } as const;

  if (proxyUrl) {
    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "embed", text }),
    });
    if (!res.ok) throw new Error(`Gemini proxy error: ${res.status}`);
    const data = await res.json();
    const values = data?.embedding?.values as number[] | undefined;
    return values ?? [];
  }

  if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");
  const response = await fetch(GEMINI_EMBED_URL(apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Gemini embed error: ${response.status}`);
  const data = await response.json();
  const values = data?.embedding?.values as number[] | undefined;
  return values ?? [];
}
