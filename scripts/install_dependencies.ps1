param(
  [switch]$SkipPlaywright,
  [switch]$SkipHusky
)

function Require-Command {
  param(
    [Parameter(Mandatory = $true)][string]$Command
  )
  if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
    Write-Error "Required command '$Command' is not available on PATH."
    exit 2
  }
}

Require-Command -Command "node"
Require-Command -Command "npm"

$nodeVersion = (node --version).TrimStart('v')
$nodeMajor = [int]($nodeVersion.Split('.')[0])
if ($nodeMajor -lt 18) {
  Write-Error "Node.js >= 18 is required. Current: v$nodeVersion"
  exit 3
}

Write-Host "Installing npm dependencies (including dev) ..." -ForegroundColor Cyan
if (Test-Path package-lock.json) {
  npm ci --include=dev
} else {
  npm install --include=dev
}

if (-not $SkipHusky) {
  Write-Host "Preparing Husky git hooks..." -ForegroundColor Cyan
  npm run prepare | Out-Null
}

Write-Host "Priming lint-staged cache..." -ForegroundColor Cyan
try {
  npx --yes lint-staged --version | Out-Null
} catch {
  Write-Warning "lint-staged not yet installed; continuing."
}

if (-not $SkipPlaywright) {
  try {
    if (npx --yes playwright --version *> $null) {
      Write-Host "Installing Playwright browsers..." -ForegroundColor Cyan
      npx --yes playwright install --with-deps *> $null
    }
  } catch {
    Write-Warning "Playwright not configured; skipping browser installation."
  }
} else {
  Write-Host "Skipping Playwright browser installation." -ForegroundColor Yellow
}

Write-Host "Dependency installation complete." -ForegroundColor Green
