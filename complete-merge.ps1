# Complete merge script - handles the case sensitivity issue
Write-Host "Resolving merge..." -ForegroundColor Cyan

# Remove both case variations of the file
if (Test-Path ".github/PULL_REQUEST_TEMPLATE.md") {
    Remove-Item -Force ".github/PULL_REQUEST_TEMPLATE.md"
    Write-Host "Removed .github/PULL_REQUEST_TEMPLATE.md" -ForegroundColor Yellow
}

if (Test-Path ".github/pull_request_template.md") {
    Remove-Item -Force ".github/pull_request_template.md"
    Write-Host "Removed .github/pull_request_template.md" -ForegroundColor Yellow
}

# Reset any git tracking
git rm --cached .github/PULL_REQUEST_TEMPLATE.md 2>$null
git rm --cached .github/pull_request_template.md 2>$null

# Now pull
Write-Host "`nPulling from remote..." -ForegroundColor Yellow
git pull origin main --no-rebase

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Merge successful!" -ForegroundColor Green
    Write-Host "`nCurrent status:" -ForegroundColor Cyan
    git status --short
    Write-Host "`nYou can now push with: git push origin main" -ForegroundColor Gray
} else {
    Write-Host "`nWarning: Merge had issues. Check output above." -ForegroundColor Red
}

