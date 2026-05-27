import uuid
from typing import Any
import httpx
from fastapi import APIRouter, HTTPException
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
    """
    RAG-style query to Ask My Notes.
    Retrieves the user's notes, scores relevance based on keyword overlaps,
    sends context to Gemini 1.5 Flash, and returns the answer and source citations.
    """
    # 1. Retrieve all notes for the current user
    statement = select(Note).where(Note.owner_id == current_user.id)
    notes = session.exec(statement).all()

    if not notes:
        return AskNotesResponse(
            answer="You don't have any notes yet! Please create some notes first so I can help answer your questions.",
            sources=[],
        )

    # 2. RAG keyword matching / scoring
    q_words = [w.lower() for w in request.question.split() if len(w) > 2]

    scored_notes = []
    for note in notes:
        score = 0
        title_lower = note.title.lower()
        content_lower = note.content.lower()
        tags_lower = (note.tags or "").lower()

        for word in q_words:
            if word in title_lower:
                score += 10
            if word in tags_lower:
                score += 5
            if word in content_lower:
                score += 2

        scored_notes.append((score, note))

    scored_notes.sort(key=lambda x: x[0], reverse=True)

    if scored_notes[0][0] == 0:
        top_notes = list(notes)[:5]
    else:
        top_notes = [note for score, note in scored_notes[:5] if score > 0]

    sources = [
        AskNotesSource(
            id=note.id,
            title=note.title,
            snippet=note.content[:200] + ("..." if len(note.content) > 200 else ""),
        )
        for note in top_notes
    ]

    # 3. Check for API key
    if not settings.OPENAI_API_KEY:
        answer = "AI key not configured. Matched notes:\n\n"
        for note in top_notes:
            answer += f"**{note.title}**: {note.content}\n\n"
        return AskNotesResponse(answer=answer, sources=sources)

    # 4. Build prompt
    context_entries = []
    for note in top_notes:
        tags_str = f" [Tags: {note.tags}]" if note.tags else ""
        context_entries.append(f"Title: {note.title}{tags_str}\nContent: {note.content}")
    context_text = "\n\n---\n\n".join(context_entries)

    system_prompt = (
        "You are an assistant answering questions using only the user's notes. "
        "Your answers should be friendly, clear, and professional. "
        "Answer ONLY using the provided notes. "
        "If the notes do not contain enough information, say: "
        "'I could not find enough information in your notes to answer this question.' "
        "Do not invent facts or use external knowledge."
    )

    user_content = (
        f"Question: {request.question}\n\n"
        f"Context notes:\n"
        f"=======================\n"
        f"{context_text}\n"
        f"======================="
    )

    # 5. Call Gemini API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.OPENAI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={
                    "systemInstruction": {"parts": [{"text": system_prompt}]},
                    "contents": [{"role": "user", "parts": [{"text": user_content}]}],
                    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800},
                },
                timeout=30.0,
            )

            if response.status_code != 200:
                return AskNotesResponse(
                    answer=f"Gemini API error (Status {response.status_code}): {response.text}\n\nMatched notes:\n\n" +
                           "\n\n".join([f"**{n.title}**: {n.content}" for n in top_notes]),
                    sources=sources,
                )

            resp_data = response.json()
            answer = resp_data["candidates"][0]["content"]["parts"][0]["text"].strip()

            return AskNotesResponse(answer=answer, sources=sources)

    except Exception as e:
        return AskNotesResponse(
            answer=f"Connection error: {str(e)}\n\nMatched notes:\n\n" +
                   "\n\n".join([f"**{n.title}**: {n.content}" for n in top_notes]),
            sources=sources,
        )
