param(
  [switch]$WithHusky
)

Write-Host "Installing Node dependencies..." -ForegroundColor Cyan
if (Test-Path package-lock.json) {
  npm ci
} else {
  npm install
}

if ($WithHusky) {
  Write-Host "Installing Husky git hooks..." -ForegroundColor Cyan
  npm run prepare
}

Write-Host "Installing recommended global tools (optional)..." -ForegroundColor Cyan
# npm install -g @biomejs/biome  # example optional tool

Write-Host "Done." -ForegroundColor Green
