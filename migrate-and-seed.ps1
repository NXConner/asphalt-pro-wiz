# Save as migrate-and-seed.ps1 (or run inline in PowerShell)

[CmdletBinding()]
param(
    [string]$DatabaseUrl = $env:DATABASE_URL
)

try {
    if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
        $DatabaseUrl = Read-Host -Prompt 'Enter DATABASE_URL (postgresql://user:pass@host:port/db)'
    }

    if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
        throw "DATABASE_URL is required."
    }

    Write-Host "`n==> Using DATABASE_URL: $DatabaseUrl`n"

    # Install dependencies once (skip if node_modules already exists)
    if (-not (Test-Path -Path 'node_modules' -PathType Container)) {
        Write-Host "==> Installing npm dependencies..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed."
        }
    }

    # Apply migrations
    Write-Host "==> Running migrations..."
    $env:DATABASE_URL = $DatabaseUrl
    npm run migrate:up
    if ($LASTEXITCODE -ne 0) {
        throw "npm run migrate:up failed."
    }

    # Seed data
    Write-Host "==> Seeding database..."
    npm run seed
    if ($LASTEXITCODE -ne 0) {
        throw "npm run seed failed."
    }

    # Targeted unit tests (optional but recommended)
    Write-Host "==> Running targeted unit tests..."
    npm run test:unit -- --run tests/modules/scheduler/ics.test.ts
    if ($LASTEXITCODE -ne 0) {
        throw "Scheduler ICS unit tests failed."
    }

    npm run test:unit -- --run tests/modules/estimate/persistence.test.ts
    if ($LASTEXITCODE -ne 0) {
        throw "Estimator persistence unit tests failed."
    }

    Write-Host "`n✅ All steps completed successfully." -ForegroundColor Green
}
finally {
    # Clean up the temporary DATABASE_URL override if you don’t want it persisted
    Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
}