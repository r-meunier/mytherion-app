# PostgreSQL Docker Setup Script
# This script updates the secrets files with the correct credentials

Write-Host "Setting up PostgreSQL secrets..." -ForegroundColor Green

# Create secrets directory if it doesn't exist
if (-not (Test-Path "secrets")) {
    New-Item -ItemType Directory -Path "secrets" | Out-Null
    Write-Host "Created secrets directory" -ForegroundColor Yellow
}

# Update pg_user.txt
Set-Content -Path "secrets/pg_user.txt" -Value "mytherion" -NoNewline
Write-Host "Updated secrets/pg_user.txt" -ForegroundColor Green

# Update pg_pw.txt
Set-Content -Path "secrets/pg_pw.txt" -Value "mytherion" -NoNewline
Write-Host "Updated secrets/pg_pw.txt" -ForegroundColor Green

# Create .env file from .env.example if it doesn't exist
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env file from .env.example" -ForegroundColor Green
} else {
    Write-Host ".env file already exists, skipping..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup complete! You can now run:" -ForegroundColor Green
Write-Host "  docker-compose up -d" -ForegroundColor Cyan
Write-Host ""
Write-Host "To verify the database:" -ForegroundColor Green
Write-Host "  docker exec -it postgres psql -U mytherion -d mytherion" -ForegroundColor Cyan
