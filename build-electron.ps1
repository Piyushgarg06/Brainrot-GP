#!/usr/bin/env pwsh
# BrainrotGP — Build Script for Windows Desktop App
# Run from inside the brainrot-gp/ directory:
#   .\build-electron.ps1

Set-Location $PSScriptRoot

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "  BRAINROTGP — Windows Desktop App Builder" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host ""

# 1. Install deps if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "[1/3] Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "[1/3] Dependencies already installed." -ForegroundColor Green
}

# 2. Build Next.js
Write-Host ""
Write-Host "[2/3] Building Next.js production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Next.js build failed." -ForegroundColor Red
    exit 1
}
Write-Host "Next.js build complete." -ForegroundColor Green

# 3. Package with electron-builder
Write-Host ""
Write-Host "[3/3] Packaging Windows installer with electron-builder..." -ForegroundColor Yellow
npx electron-builder --win --config electron-builder.json
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: electron-builder packaging failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  BUILD COMPLETE! Installer is in dist/" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Get-ChildItem "dist\*.exe" | ForEach-Object { Write-Host "  → $_" -ForegroundColor Cyan }

