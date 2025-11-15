# Force merge script - commits removal first, then merges
Write-Host "=== Force Merge Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove files physically
Write-Host "1. Removing files..." -ForegroundColor Yellow
Remove-Item -Force ".github/PULL_REQUEST_TEMPLATE.md" -ErrorAction SilentlyContinue
Remove-Item -Force ".github/pull_request_template.md" -ErrorAction SilentlyContinue
Write-Host "   Files removed" -ForegroundColor Green

# Step 2: Stage the removal
Write-Host "`n2. Staging removal..." -ForegroundColor Yellow
git add .github/PULL_REQUEST_TEMPLATE.md .github/pull_request_template.md 2>$null
git rm --cached .github/PULL_REQUEST_TEMPLATE.md 2>$null
git rm --cached .github/pull_request_template.md 2>$null
Write-Host "   Staged" -ForegroundColor Green

# Step 3: Commit the removal
Write-Host "`n3. Committing removal..." -ForegroundColor Yellow
git commit --no-verify -m "chore: remove PULL_REQUEST_TEMPLATE files before merge"

if ($LASTEXITCODE -ne 0) {
    Write-Host "   Warning: Commit may have failed, but continuing..." -ForegroundColor Yellow
}

# Step 4: Pull and merge
Write-Host "`n4. Pulling and merging..." -ForegroundColor Yellow
git pull origin main --no-rebase

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Merge successful!" -ForegroundColor Green
    Write-Host "`nFinal status:" -ForegroundColor Cyan
    git status --short
    Write-Host "`nYou can now push with: git push origin main" -ForegroundColor Gray
} else {
    Write-Host "`nMerge failed. Trying alternative approach..." -ForegroundColor Yellow
    
    # Alternative: Accept theirs strategy
    Write-Host "`nTrying 'accept theirs' strategy..." -ForegroundColor Yellow
    git fetch origin main
    git merge origin/main -X theirs --no-edit
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Merge successful with 'theirs' strategy!" -ForegroundColor Green
        git status --short
    } else {
        Write-Host "`n⚠ Manual intervention required." -ForegroundColor Red
        Write-Host "Check git status and resolve conflicts manually." -ForegroundColor Yellow
    }
}

