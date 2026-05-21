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

## Optional AI configuration

Set these environment variables in `backend/.env` or your shell:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

If no API key is set, the backend falls back to a lightweight rule-based responder so the app still works.