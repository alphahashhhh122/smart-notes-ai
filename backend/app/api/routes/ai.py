from typing import Any
import httpx
from fastapi import APIRouter
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.models import Note, AskNotesRequest, AskNotesResponse, AskNotesSource

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/ask", response_model=AskNotesResponse)
async def ask_notes(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    request: AskNotesRequest,
) -> Any:
    """RAG-style query using Groq (free tier, no billing needed)."""

    # 1. Retrieve all notes
    statement = select(Note).where(Note.owner_id == current_user.id)
    notes = session.exec(statement).all()

    if not notes:
        return AskNotesResponse(
            answer="You don't have any notes yet! Create some notes first.",
            sources=[],
        )

    # 2. Keyword scoring
    q_words = [w.lower() for w in request.question.split() if len(w) > 2]
    scored_notes = []
    for note in notes:
        score = 0
        for word in q_words:
            if word in note.title.lower(): score += 10
            if word in (note.tags or "").lower(): score += 5
            if word in note.content.lower(): score += 2
        scored_notes.append((score, note))

    scored_notes.sort(key=lambda x: x[0], reverse=True)
    top_notes = list(notes)[:5] if scored_notes[0][0] == 0 else [n for s, n in scored_notes[:5] if s > 0]

    sources = [
        AskNotesSource(
            id=note.id,
            title=note.title,
            snippet=note.content[:200] + ("..." if len(note.content) > 200 else ""),
        )
        for note in top_notes
    ]

    if not settings.OPENAI_API_KEY:
        answer = "API key not configured.\n\n" + "\n\n".join([f"**{n.title}**: {n.content}" for n in top_notes])
        return AskNotesResponse(answer=answer, sources=sources)

    # 3. Build context
    context_text = "\n\n---\n\n".join([
        f"Title: {note.title}{f' [Tags: {note.tags}]' if note.tags else ''}\nContent: {note.content}"
        for note in top_notes
    ])

    system_prompt = (
        "You are a helpful assistant that answers questions using only the user's notes. "
        "Be friendly, clear and concise. Only use the provided notes to answer. "
        "Answer directly and confidently based on the notes. Do not say you couldn't find something if the note exists and has content. Be concise."
    )

    user_content = f"Question: {request.question}\n\nNotes:\n===========\n{context_text}\n==========="

    # 4. Call Groq API (OpenAI-compatible, free tier)
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_content},
                    ],
                    "temperature": 0.2,
                    "max_tokens": 800,
                },
                timeout=30.0,
            )

            if response.status_code != 200:
                return AskNotesResponse(
                    answer=f"AI error ({response.status_code}): {response.text}. Matched notes:\n\n" +
                           "\n\n".join([f"**{n.title}**: {n.content}" for n in top_notes]),
                    sources=sources,
                )

            resp_data = response.json()
            answer = resp_data["choices"][0]["message"]["content"].strip()
            return AskNotesResponse(answer=answer, sources=sources)

    except Exception as e:
        return AskNotesResponse(
            answer=f"Connection error: {str(e)}\n\nMatched notes:\n\n" +
                   "\n\n".join([f"**{n.title}**: {n.content}" for n in top_notes]),
            sources=sources,
        )
