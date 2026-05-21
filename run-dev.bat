@echo off
REM run-dev.bat - Launch backend and frontend in separate PowerShell windows
REM Usage: run-dev.bat

set ROOT=%~dp0
set ROOT=%ROOT:~0,-1%

if exist "%ROOT%\.venv\Scripts\python.exe" (
  set PY="%ROOT%\.venv\Scripts\python.exe"
) else (
  set PY=python
)

start powershell -NoExit -Command "& %PY% -m uvicorn backend.main:app --reload --port 8000"
start powershell -NoExit -Command "cd '%ROOT%\frontend' ; npm run dev"

echo Launched backend and frontend in new windows.