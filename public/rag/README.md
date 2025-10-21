Place the generated `index.json` here to enable Retrieval-Augmented Generation (RAG) in the AI Assistant. Use the ingestion script:

- Add local source files under `data/` (e.g., `data/manuals/*.md`, `data/specs/*.txt`).
- Optionally set `GITHUB_TOKEN` and provide a list of repos.
- Run: `npm run ingest:repos` (after setting up dependencies).
