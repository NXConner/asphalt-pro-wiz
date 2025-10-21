// Gemini API client. Reads key from import.meta.env.VITE_GEMINI_API_KEY
// For production, route via a backend to avoid exposing keys.

type Part =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

type Content = { role?: 'user' | 'model'; parts: Part[] };

const GEMINI_GENERATE_URL = (model: string, apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

export async function generateChat(userMessage: string, context?: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error('Missing VITE_GEMINI_API_KEY');

  const contents: Content[] = [
    context ? { role: 'user', parts: [{ text: context }] } : undefined,
    { role: 'user', parts: [{ text: userMessage }] },
  ].filter(Boolean) as Content[];

  const response = await fetch(GEMINI_GENERATE_URL('gemini-1.5-pro-latest', apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });
  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text;
}

export async function analyzeImage(base64Data: string, mimeType: string, prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error('Missing VITE_GEMINI_API_KEY');

  const contents: Content[] = [
    {
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType, data: base64Data } },
      ],
    },
  ];

  const response = await fetch(GEMINI_GENERATE_URL('gemini-1.5-flash-latest', apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });
  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text;
}
