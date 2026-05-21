#!/usr/bin/env python3
"""
run-dev.py

Run backend (uvicorn) and frontend (npm run dev) in a single terminal with
prefixed logs so you don't need two windows.

Usage (Windows PowerShell/cmd):
  .venv\Scripts\Activate.ps1   # or activate.bat for cmd
  python run-dev.py

The script prefers the project's `.venv` Python when available.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import threading
from pathlib import Path


def prefer_venv_python() -> str:
    root = Path(__file__).resolve().parent
    venv_py = root / '.venv' / 'Scripts' / 'python.exe'
    if venv_py.exists():
        return str(venv_py)
    return sys.executable


def stream_proc(proc: subprocess.Popen, prefix: str) -> None:
    try:
        for line in proc.stdout:
            print(f"[{prefix}] {line.rstrip()}")
    except Exception:
        pass


def start_backend(python_exe: str) -> subprocess.Popen:
    cmd = [python_exe, '-m', 'uvicorn', 'backend.main:app', '--reload', '--port', '8000']
    return subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )


def start_frontend() -> subprocess.Popen:
    npm = shutil.which('npm')
    if not npm:
        raise RuntimeError('npm not found on PATH')
    return subprocess.Popen(
        [npm, 'run', 'dev'],
        cwd=str(Path(__file__).resolve().parent / 'frontend'),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )


def main() -> int:
    python_exe = prefer_venv_python()
    print(f'Using Python: {python_exe}')

    try:
        backend = start_backend(python_exe)
    except FileNotFoundError as e:
        print('Failed to start backend:', e)
        return 1

    try:
        frontend = start_frontend()
    except Exception as e:
        print('Failed to start frontend:', e)
        backend.terminate()
        return 1

    threads = [
        threading.Thread(target=stream_proc, args=(backend, 'BACKEND'), daemon=True),
        threading.Thread(target=stream_proc, args=(frontend, 'FRONTEND'), daemon=True),
    ]

    for t in threads:
        t.start()

    try:
        # Wait for either process to exit
        while True:
            if backend.poll() is not None:
                print('Backend process exited; terminating frontend...')
                frontend.terminate()
                break
            if frontend.poll() is not None:
                print('Frontend process exited; terminating backend...')
                backend.terminate()
                break
            # small sleep
            threading.Event().wait(0.2)
    except KeyboardInterrupt:
        print('Interrupted; terminating child processes...')
        backend.terminate()
        frontend.terminate()

    # give processes a moment to exit
    try:
        backend.wait(timeout=3)
    except Exception:
        backend.kill()
    try:
        frontend.wait(timeout=3)
    except Exception:
        frontend.kill()

    print('Run finished.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
