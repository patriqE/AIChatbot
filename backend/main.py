from __future__ import annotations

import os
from pathlib import Path
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field


load_dotenv(Path(__file__).with_name(".env"))


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    provider: str


app = FastAPI(title="SmartChatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_system_prompt() -> str:
    return (
        "You are SmartChatbot, a concise, helpful assistant for a small demo app. "
        "Keep answers short, direct, and friendly. When the user asks for code or setup advice, "
        "give practical steps and mention any assumptions briefly."
    )


def fallback_reply(message: str) -> str:
    normalized = message.strip().lower()

    if any(greeting in normalized for greeting in ["hello", "hi", "hey"]):
        return "Hi. I can answer questions, draft text, or help you plan tasks."

    if "name" in normalized:
        return "I’m SmartChatbot, a simple demo assistant."

    if "help" in normalized:
        return "Tell me what you want to do, and I’ll keep it short and actionable."

    return (
        "I can help with that. If you want a stronger answer, connect an LLM by setting OPENAI_API_KEY."
    )


def generate_reply(request: ChatRequest) -> tuple[str, str]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return fallback_reply(request.message), "fallback"

    try:
        from openai import OpenAI  # type: ignore[import-not-found]
    except ImportError:
        return (
            "OpenAI support is not installed in this Python environment. "
            "Activate the project virtual environment and install requirements.",
            "missing-openai",
        )

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    client = OpenAI(api_key=api_key)

    messages = [{"role": "system", "content": build_system_prompt()}]
    for item in request.history[-10:]:
        messages.append({"role": item.role, "content": item.content})
    messages.append({"role": "user", "content": request.message})

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
        )
    except Exception as exc:
        error_text = str(exc).lower()
        if "insufficient_quota" in error_text or "exceeded your current quota" in error_text or "429" in error_text:
            return (
                "Your OpenAI account has run out of quota. Check billing or add credits, then try again.",
                "openai-quota-exceeded",
            )

        return fallback_reply(request.message), "openai-fallback"

    reply = completion.choices[0].message.content or "I’m not sure how to answer that."
    return reply.strip(), f"openai:{model}"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    reply, provider = generate_reply(request)
    return ChatResponse(reply=reply, provider=provider)
