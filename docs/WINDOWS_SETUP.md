## Windows & PowerShell Setup

> These instructions assume PowerShell 7+ and Windows 11. All commands are PowerShell-native and avoid Bash syntax that fails on Windows shells.

### 1. Install prerequisites

- **Node.js 18+** (https://nodejs.org/) – restart PowerShell after installation so `node` and `npm` are on `PATH`.
- **PostgreSQL 15+** – ensure the server is running and that you have a database for local development.
- **Git** (https://git-scm.com/download/win) – use the bundled credential helper.

### 2. Clone the repository

```powershell
cd $HOME\Desktop
git clone https://github.com/NXConner/asphalt-pro-wiz.git pavement-performance-suite
cd pavement-performance-suite
```

### 3. Install dependencies & Husky hooks

Always run the PowerShell installer; it wraps `npm ci`, Husky, lint-staged priming, and Playwright downloads.

```powershell
.\scripts\install_dependencies.ps1
# Optional flags:
#   -SkipPlaywright   -> skip Playwright browser download (CI containers)
#   -SkipHusky        -> skip Husky install on read-only file systems
```

### 4. Configure environment variables

The project reads secrets from `.env`. Copy the template and edit it with real values:

```powershell
Copy-Item .env.example .env
```

For ad-hoc commands (e.g., migrations or seeds), set environment variables inline using `$env:` syntax:

```powershell
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/pavement"  # change to your credentials
$env:ADMIN_EMAIL = "n8ter8@gmail.com"
```

To persist the values for future PowerShell sessions:

```powershell
[Environment]::SetEnvironmentVariable("DATABASE_URL", "postgres://...", "User")
[Environment]::SetEnvironmentVariable("ADMIN_EMAIL", "n8ter8@gmail.com", "User")
```

Clear values when you are done:

```powershell
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:ADMIN_EMAIL -ErrorAction SilentlyContinue
```

### 5. Run database migrations

`node-pg-migrate` is installed locally, so the command only succeeds after dependencies are installed. Ensure `DATABASE_URL` is set in the current session.

```powershell
npm run migrate:up
```

> If you see `'node-pg-migrate' is not recognized`, rerun `.\scripts\install_dependencies.ps1` to install dependencies and verify that the command is executed from the repository root.

### 6. Seed initial data

The seed script uses `tsx` with `dotenv`. Both are local dev dependencies; make sure you have run the installer before seeding.

```powershell
$env:ADMIN_EMAIL = "n8ter8@gmail.com"   # ensure the user exists in Supabase Auth
npm run seed
```

The script is idempotent – rerun whenever you need to sync the seed data.

### 7. Useful helpers

- Refresh the dev server instead of restarting when you change env variables inside Vite.
- Use `npm run lint`, `npm run test:unit -- --run`, and `npm run test:e2e` to match the Husky pre-commit checks.
- Run `npm run security:scan` periodically on Windows to surface dependency vulnerabilities.

Refer to `README.md` for additional environment details, Docker workflows, and Supabase provisioning guidance.
