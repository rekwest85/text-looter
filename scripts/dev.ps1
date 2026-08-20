#!/usr/bin/env pwsh
# Launch the Vite dev server and open the game in your default browser.
# Includes all the diagnostic info you need.
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSCommandPath
$ProjectRoot = Split-Path -Parent $ProjectRoot
Set-Location $ProjectRoot

Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
Write-Host "Open http://localhost:5173 in Chrome after server starts" -ForegroundColor Yellow
Write-Host "Press Ctrl+C in this window to stop the server" -ForegroundColor Gray
Write-Host ""

# Open browser after a short delay
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 4
    Start-Process "http://localhost:5173"
} | Out-Null

npm run dev
