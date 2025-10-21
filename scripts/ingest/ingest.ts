#!/usr/bin/env tsx
/*
Ingest local files (data/**/*.{md,txt}) and optional GitHub repos to build a RAG index.
Requires: GEMINI_API_KEY (or VITE_GEMINI_API_KEY) and optional GITHUB_TOKEN.
Outputs: public/rag/index.json
*/

import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT = path.join(ROOT, 'public', 'rag', 'index.json');

async function embed(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: { parts: [{ text }] } }),
  });
  if (!res.ok) throw new Error(`Embed failed: ${res.status}`);
  const json = await res.json();
  return json?.embedding?.values ?? [];
}

function chunkText(text: string, chunkSize = 1500, overlap = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + chunkSize);
    chunks.push(text.slice(i, end));
    if (end >= text.length) break;
    i = end - overlap;
  }
  return chunks;
}

async function ingestLocalFiles(): Promise<any[]> {
  if (!fs.existsSync(DATA_DIR)) return [];
  const entries = await fg(['**/*.md', '**/*.txt'], { cwd: DATA_DIR, dot: false, absolute: true });
  const out: any[] = [];
  for (const file of entries) {
    const rel = path.relative(ROOT, file);
    const text = fs.readFileSync(file, 'utf8');
    const chunks = chunkText(text);
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const embedding = await embed(chunk);
      out.push({ id: `${rel}#${idx}`, source: rel, text: chunk, embedding });
    }
  }
  return out;
}

async function ingestGitHubRepos(): Promise<any[]> {
  const listFile = path.join(ROOT, 'data', 'repos.json');
  if (!fs.existsSync(listFile)) return [];
  const repos: string[] = JSON.parse(fs.readFileSync(listFile, 'utf8'));
  if (!repos.length) return [];
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not set; skipping GitHub ingestion');
    return [];
  }
  const out: any[] = [];
  for (const repo of repos) {
    // Fetch README as a starting point
    const api = `https://api.github.com/repos/${repo}/readme`;
    const res = await fetch(api, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' } });
    if (!res.ok) { console.warn(`Skip ${repo}: ${res.status}`); continue; }
    const json = await res.json();
    if (json.download_url) {
      const raw = await fetch(json.download_url);
      if (raw.ok) {
        const text = await raw.text();
        const chunks = chunkText(text);
        for (let idx = 0; idx < chunks.length; idx++) {
          const chunk = chunks[idx];
          const embedding = await embed(chunk);
          out.push({ id: `${repo}/README#${idx}`, source: `https://github.com/${repo}`, title: 'README', text: chunk, embedding });
        }
      }
    }
  }
  return out;
}

async function main() {
  const localDocs = await ingestLocalFiles();
  const ghDocs = await ingestGitHubRepos();
  const index = [...localDocs, ...ghDocs];
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(index), 'utf8');
  console.log(`Wrote ${index.length} chunks → ${path.relative(ROOT, OUTPUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
