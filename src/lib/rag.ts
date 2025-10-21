import { embedText } from "@/lib/gemini";

export interface RAGChunk {
  id: string;
  source: string; // file or URL
  title?: string;
  text: string;
  embedding: number[];
}

let cachedIndex: RAGChunk[] | null = null;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function loadIndex(): Promise<RAGChunk[]> {
  if (cachedIndex) return cachedIndex;
  try {
    const res = await fetch('/rag/index.json', { cache: 'no-store' });
    if (!res.ok) return (cachedIndex = []);
    const json = await res.json();
    return (cachedIndex = Array.isArray(json) ? json : []);
  } catch {
    return (cachedIndex = []);
  }
}

export async function retrieveRelevantContext(query: string, topK = 5): Promise<string> {
  const [index, qvec] = await Promise.all([loadIndex(), embedText(query)]);
  if (!index.length || !qvec.length) return '';
  const scored = index
    .map((c) => ({ c, s: cosineSimilarity(qvec, c.embedding) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, topK);
  const ctx = scored
    .map(({ c }) => `Source: ${c.source}${c.title ? ` | ${c.title}` : ''}\n${c.text}`)
    .join('\n\n---\n\n');
  return ctx.slice(0, 8000); // keep context reasonable
}
