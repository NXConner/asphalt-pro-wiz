# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/1282c161-32ae-4cc0-9d0c-60535b8cd60d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1282c161-32ae-4cc0-9d0c-60535b8cd60d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Quickstart

1. Copy env template and fill secrets:

```sh
cp .env.example .env
```

2. Install deps, hooks, and Playwright browsers:

```sh
./scripts/install_dependencies.sh
```

3. Start dev server (then refresh if running):

```sh
npm run dev
```

### Unified Supabase (single project for all apps)

See `docs/UNIFIED_SUPABASE_GUIDE.md` for step-by-step setup to connect this and other repositories to one Supabase project, run unified migrations, seed admin access, and use compatibility views for legacy schemas.

4. Optional: Build RAG index for AI:

```sh
npm run ingest:repos
```

## Database (optional for local dev)

```sh
docker compose up -d db
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pavement npm run migrate:up
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pavement npm run seed
```

See `docs/ADMIN_SETUP.md` for Supabase admin instructions.

### Gemini Proxy (recommended)

- Deploy Supabase Edge Function `gemini-proxy` (see `docs/SECRETS_AND_CONFIG.md`).
- Set `VITE_GEMINI_PROXY_URL` to the function URL; avoid exposing API keys in the browser.

## Tests

```sh
npm run test:unit
```

E2E (requires dev server):

```sh
npm run test:e2e
```

Key E2E flows covered:

- Theme toggle switches between light/dark.
- Feature Flags toggles (Image Area Analyzer, AI Assistant, Receipts).
- Uploads panel accepts a file and displays a Download link.

## Load Testing

With k6:

```sh
BASE_URL=http://localhost:8080 k6 run scripts/load/k6-estimate.js
```

With Artillery:

```sh
artillery run scripts/load/artillery.yml
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1282c161-32ae-4cc0-9d0c-60535b8cd60d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Ownership & Contributions

See `CODEOWNERS` and `CONTRIBUTING.md`.

## License

MIT — see `LICENSE`.
