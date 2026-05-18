# AI Document Analyst - Start Script
# This script starts both the Flask backend and React frontend

Write-Host "Starting AI Document Analyst..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Yellow

# Check if Python is available
try {
    $pythonVersion = python --version 2>$null
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Python not found. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>$null
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not found. Please install Node.js 14+ first." -ForegroundColor Red
    exit 1
}

# Install Python dependencies if requirements.txt exists
if (Test-Path "requirements.txt") {
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error installing Python dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Warning: requirements.txt not found" -ForegroundColor Yellow
}

# Install Node.js dependencies if frontend directory exists
if (Test-Path "frontend") {
    Write-Host "Installing React dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error installing React dependencies" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
} else {
    Write-Host "Warning: frontend directory not found" -ForegroundColor Yellow
}

Write-Host "Starting Flask backend on http://localhost:5000..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    python app.py
}

Start-Sleep -Seconds 2

Write-Host "Starting React frontend on http://localhost:3000..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\frontend"
    npm start
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "AI Document Analyst is starting up!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Gray

# Wait for user to stop
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "Servers stopped." -ForegroundColor Green
}