## Windows setup (PowerShell)

Use PowerShell `$env:` to set environment variables for one session. Replace placeholders with your values.

### 1) Install dependencies

```powershell
pwsh ./scripts/install_dependencies.ps1
```

Flags:

- `-SkipPlaywright` to skip browser downloads
- `-SkipHusky` to skip preparing git hooks

### 2) Environment variables

Create a `.env` from `.env.example` if you haven't already (Vite will read it for the app), and export DB-related vars in the shell for tooling:

```powershell
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/pavement"  # or your Supabase direct connection string
$env:ADMIN_EMAIL  = "you@example.com"                                       # auth user to elevate during seed

# Frontend variables loaded by Vite (optional for tests that import client code)
$env:VITE_SUPABASE_URL      = "https://YOUR-PROJECT.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "YOUR-ANON-KEY"
```

Note: `$env:VAR = "value"` only persists for the current PowerShell session.

### 3) Migrations

```powershell
npm run migrate:up
```

This applies all scripts in `supabase/migrations/` using `$env:DATABASE_URL`.

### 4) Seed data

```powershell
npm run seed
```

The seed expects `ADMIN_EMAIL` to already exist in Supabase Auth. It will upsert org membership and demo data.

### 5) Quality checks

```powershell
npm run lint
npm run test:unit -- --run
```

If you see module import errors specific to Windows paths, ensure you are running in a PowerShell session from the project root and that Node.js v18+ is on PATH.
