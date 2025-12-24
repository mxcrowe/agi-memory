# ============================================================================
# AGI Memory System Status Check (Windows PowerShell)
# Run this to verify all components are running properly
# ============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "AGI Memory System Status Check" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check current directory
Write-Host "📂 Current Directory:" -ForegroundColor Yellow
Get-Location
Write-Host ""

# Check Docker containers
Write-Host "🐳 Docker Container Status:" -ForegroundColor Yellow
Write-Host "--------------------------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String -Pattern "local-memory|NAMES"
Write-Host ""

# Check individual container health
Write-Host "✓ Container Health:" -ForegroundColor Yellow
Write-Host "--------------------------------------------------"

$pgStatus = docker ps --filter "name=local-memory-system-db" --format "{{.Status}}" 2>$null
$embedStatus = docker ps --filter "name=local-memory-system-embeddings" --format "{{.Status}}" 2>$null
$workerStatus = docker ps --filter "name=local-memory-system-heartbeat_worker" --format "{{.Status}}" 2>$null

if ($pgStatus) {
    Write-Host "  PostgreSQL:     ✅ $pgStatus" -ForegroundColor Green
} else {
    Write-Host "  PostgreSQL:     ❌ NOT RUNNING" -ForegroundColor Red
}

if ($embedStatus) {
    Write-Host "  Embeddings:     ✅ $embedStatus" -ForegroundColor Green
} else {
    Write-Host "  Embeddings:     ❌ NOT RUNNING" -ForegroundColor Red
}

if ($workerStatus) {
    Write-Host "  Heartbeat:      ✅ $workerStatus" -ForegroundColor Green
} else {
    Write-Host "  Heartbeat:      ❌ NOT RUNNING" -ForegroundColor Red
}
Write-Host ""

# Check database connectivity
Write-Host "🗄️  Database Connectivity:" -ForegroundColor Yellow
Write-Host "--------------------------------------------------"
$dbCheck = docker exec local-memory-system-db-1 pg_isready -U agi_user -d agi_db 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Database is accepting connections" -ForegroundColor Green
} else {
    Write-Host "  ❌ Database connection failed" -ForegroundColor Red
}
Write-Host ""

# Check recent heartbeat activity
Write-Host "💓 Recent Heartbeat Activity:" -ForegroundColor Yellow
Write-Host "--------------------------------------------------"
docker logs local-memory-system-heartbeat_worker-1 --tail 10 2>$null | Select-String -Pattern "Heartbeat|ERROR|WARNING" | Select-Object -Last 5
Write-Host ""

# Check environment configuration
Write-Host "🔧 Configuration:" -ForegroundColor Yellow
Write-Host "--------------------------------------------------"
if (Test-Path ".env") {
    Write-Host "  ✅ .env file exists" -ForegroundColor Green
    $apiKey = (Get-Content .env | Select-String "ANTHROPIC_API_KEY").ToString().Split('=')[1]
    if ($apiKey) {
        Write-Host "  ANTHROPIC_API_KEY: $($apiKey.Substring(0, [Math]::Min(20, $apiKey.Length)))..." -ForegroundColor Gray
    }
    $dbType = (Get-Content .env | Select-String "DATABASE_TYPE").ToString().Split('=')[1]
    if ($dbType) {
        Write-Host "  DATABASE_TYPE: $dbType" -ForegroundColor Gray
    }
} else {
    Write-Host "  ❌ .env file not found" -ForegroundColor Red
}
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Status check complete!" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. If all ✅ - proceed with diagnostics" -ForegroundColor White
Write-Host "  2. If any ❌ - fix those first before diagnostics" -ForegroundColor White
Write-Host ""
