# PowerShell script to resolve merge conflicts
# Handles uncommitted changes and completes the merge

Write-Host "=== Resolving Merge Conflicts ===" -ForegroundColor Cyan
Write-Host ""

# Check what files have uncommitted changes
Write-Host "1. Checking uncommitted changes..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Show the diff for the problematic file
Write-Host "2. Changes in .github/PULL_REQUEST_TEMPLATE.md:" -ForegroundColor Yellow
git diff .github/PULL_REQUEST_TEMPLATE.md | Select-Object -First 20
Write-Host ""

# Ask user what to do
Write-Host "Options:" -ForegroundColor Yellow
Write-Host "  1. Stash changes (save for later, then merge)" -ForegroundColor Gray
Write-Host "  2. Commit changes (commit before merging)" -ForegroundColor Gray
Write-Host "  3. Discard changes (lose local changes, use remote version)" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Choose option (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host "`nStashing changes..." -ForegroundColor Yellow
        git stash push -m "Stashed before merge $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Changes stashed" -ForegroundColor Green
            Write-Host "`nPulling and merging..." -ForegroundColor Yellow
            git pull origin main --no-rebase
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✓ Successfully merged!" -ForegroundColor Green
                Write-Host "`nRestoring stashed changes..." -ForegroundColor Yellow
                git stash pop
                Write-Host "   ✓ Changes restored" -ForegroundColor Green
            }
        }
    }
    "2" {
        Write-Host "`nCommitting changes..." -ForegroundColor Yellow
        git add .github/PULL_REQUEST_TEMPLATE.md
        git commit -m "chore: update PULL_REQUEST_TEMPLATE.md before merge"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Changes committed" -ForegroundColor Green
            Write-Host "`nPulling and merging..." -ForegroundColor Yellow
            git pull origin main --no-rebase
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✓ Successfully merged!" -ForegroundColor Green
            }
        }
    }
    "3" {
        Write-Host "`n⚠ WARNING: This will discard your local changes!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (yes/no)"
        
        if ($confirm -eq "yes") {
            Write-Host "Discarding changes..." -ForegroundColor Yellow
            git checkout -- .github/PULL_REQUEST_TEMPLATE.md
            
            Write-Host "   ✓ Changes discarded" -ForegroundColor Green
            Write-Host "`nPulling and merging..." -ForegroundColor Yellow
            git pull origin main --no-rebase
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✓ Successfully merged!" -ForegroundColor Green
            }
        } else {
            Write-Host "   Cancelled." -ForegroundColor Yellow
            exit 0
        }
    }
    default {
        Write-Host "   Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "3. Final status:" -ForegroundColor Yellow
git status --short
Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Host "=== Merge Complete ===" -ForegroundColor Cyan
    Write-Host "You can now push with: git push origin main" -ForegroundColor Gray
} else {
    Write-Host "=== Merge Issues ===" -ForegroundColor Red
    Write-Host "Check the output above for details." -ForegroundColor Gray
}

