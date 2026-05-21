# SmartChatbot

Simple full-stack chatbot starter with a React frontend and a FastAPI backend.

## Stack

- Frontend: React + Vite
- Backend: Python FastAPI
- Optional AI provider: OpenAI-compatible chat completions via `OPENAI_API_KEY`

## Project layout

- `frontend/` - React app
- `backend/` - FastAPI app

## Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8000` by default. You can override this with `VITE_API_URL`.

## Run both locally (one command)

To start both backend and frontend with a single command on Windows, run the PowerShell or batch script from the project root:

PowerShell:

```powershell
.\run-dev.ps1
```

Batch (cmd):

```cmd
run-dev.bat
```

Each script opens two new terminal windows: one for the backend and one for the frontend. The scripts prefer the project's `.venv` Python when available.

#### Single-terminal runner (combined logs)

If you'd prefer combined logs in a single terminal, you can use the Python runner added at the project root. Activate the venv then run:

```powershell
.venv\Scripts\Activate.ps1
python run-dev.py
```

Or on `cmd`:

```cmd
.venv\Scripts\activate.bat
python run-dev.py
```

This starts the backend and frontend and prefixes each log line with `[BACKEND]` or `[FRONTEND]`.

## Optional AI configuration

Set these environment variables in `backend/.env` or your shell:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

If no API key is set, the backend falls back to a lightweight rule-based responder so the app still works.
