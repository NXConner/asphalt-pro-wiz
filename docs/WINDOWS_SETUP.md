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

**For the frontend app:** Create a `.env` from `.env.example` if you haven't already. Vite will read it automatically.

**For migrations and seeds:** You must set environment variables in PowerShell using `$env:` syntax. These are required for database operations:

```powershell
# Required for migrations and seeds
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/pavement"  # or your Supabase direct connection string
$env:ADMIN_EMAIL  = "n8ter8@gmail.com"                                     # auth user to elevate during seed (default shown)

# Optional: Frontend variables (can also go in .env file)
$env:VITE_SUPABASE_URL      = "https://YOUR-PROJECT.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "YOUR-ANON-KEY"
```

**Important:** `$env:VAR = "value"` only persists for the current PowerShell session. You must set these variables each time you open a new PowerShell window, or add them to your PowerShell profile to persist across sessions.

### 3) Migrations

**Important:** Set `DATABASE_URL` in your PowerShell session before running migrations:

```powershell
# Set the database connection string (required)
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/pavement"  # or your Supabase direct connection string

# Then run migrations
npm run migrate:up
```

This applies all scripts in `supabase/migrations/` using the `DATABASE_URL` environment variable. The migration script will read it from `process.env.DATABASE_URL`.

**Note:** If you get connection errors, ensure:

- Your database server is running (local Postgres) or your Supabase project is accessible
- The connection string is correct and includes credentials
- The database exists (for local Postgres, create it first: `createdb pavement`)

### 4) Seed data

**Important:** Set both `DATABASE_URL` and `ADMIN_EMAIL` before running seeds:

```powershell
# Set required environment variables
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/pavement"  # or your Supabase connection
$env:ADMIN_EMAIL = "n8ter8@gmail.com"  # or your admin email

# Then run seed
npm run seed
```

The seed expects `ADMIN_EMAIL` to already exist in Supabase Auth. It will upsert org membership and demo data. Ensure the user exists in Supabase Auth dashboard before running the seed.

### 5) Quality checks

```powershell
npm run lint
npm run test:unit -- --run
```

If you see module import errors specific to Windows paths, ensure you are running in a PowerShell session from the project root and that Node.js v18+ is on PATH.
