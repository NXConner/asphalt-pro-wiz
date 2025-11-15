# PowerShell script to safely sync with remote main branch
# This script will pull remote changes and merge with your local commits

Write-Host "=== Git Sync Script ===" -ForegroundColor Cyan
Write-Host ""

# Check current status
Write-Host "1. Checking current git status..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Show local commits ahead
Write-Host "2. Your local commits (not on remote):" -ForegroundColor Yellow
git log --oneline origin/main..HEAD 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   (Could not compare with remote - may need to fetch first)" -ForegroundColor Gray
}
Write-Host ""

# Fetch latest from remote
Write-Host "3. Fetching latest changes from remote..." -ForegroundColor Yellow
git fetch origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Error: Could not fetch from remote. Check your connection and credentials." -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Fetched successfully" -ForegroundColor Green
Write-Host ""

# Show remote commits ahead
Write-Host "4. Remote commits (not in your local branch):" -ForegroundColor Yellow
$remoteCommits = git log --oneline HEAD..origin/main 2>$null | Select-Object -First 5
if ($remoteCommits) {
    $remoteCommits | ForEach-Object { Write-Host "   $_" }
    $totalRemote = (git rev-list --count HEAD..origin/main 2>$null)
    if ($totalRemote -gt 5) {
        Write-Host "   ... and $($totalRemote - 5) more commits" -ForegroundColor Gray
    }
} else {
    Write-Host "   (No remote commits ahead)" -ForegroundColor Gray
}
Write-Host ""

# Ask for confirmation
Write-Host "5. Ready to merge remote changes with your local commits." -ForegroundColor Yellow
Write-Host "   This will create a merge commit combining both branches." -ForegroundColor Gray
$response = Read-Host "   Continue? (Y/N)"
if ($response -ne 'Y' -and $response -ne 'y') {
    Write-Host "   Cancelled by user." -ForegroundColor Yellow
    exit 0
}
Write-Host ""

# Pull and merge
Write-Host "6. Pulling and merging remote changes..." -ForegroundColor Yellow
git pull origin main --no-rebase

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "   ✓ Successfully merged!" -ForegroundColor Green
    Write-Host ""
    
    # Show final status
    Write-Host "7. Final status:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    
    Write-Host "=== Sync Complete ===" -ForegroundColor Cyan
    Write-Host "You can now push with: git push origin main" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "   ⚠ Merge conflicts detected!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   To resolve conflicts:" -ForegroundColor Yellow
    Write-Host "   1. Check conflicted files: git status" -ForegroundColor Gray
    Write-Host "   2. Edit files to resolve conflicts" -ForegroundColor Gray
    Write-Host "   3. Stage resolved files: git add <file>" -ForegroundColor Gray
    Write-Host "   4. Complete merge: git commit" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

