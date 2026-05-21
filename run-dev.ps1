<#
run-dev.ps1

Starts the backend (FastAPI/uvicorn) and frontend (Vite) in separate PowerShell windows.
It prefers the project's `.venv` Python if present, otherwise falls back to `python` in PATH.

Usage: Right-click and Run with PowerShell, or in a PowerShell session run:
  .\run-dev.ps1
#>

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$venvPython = Join-Path $scriptDir '.venv\Scripts\python.exe'
if (-not (Test-Path $venvPython)) {
    Write-Host "Warning: .venv not found at $venvPython. Falling back to 'python' in PATH." -ForegroundColor Yellow
    $venvPython = 'python'
}

# backend: run uvicorn using venv python (module form so venv packages are used)
$backendCmd = "& '$venvPython' -m uvicorn backend.main:app --reload --port 8000"
Start-Process powershell -ArgumentList '-NoExit','-Command',$backendCmd -WindowStyle Normal

# frontend: run npm dev in the frontend folder
$frontendCmd = "cd '$scriptDir\\frontend'; npm run dev"
Start-Process powershell -ArgumentList '-NoExit','-Command',$frontendCmd -WindowStyle Normal

Write-Host "Started backend and frontend in new PowerShell windows."