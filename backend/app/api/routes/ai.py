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
    Retrieves the user's notes, scores relevance based on keyword overlaps (with extra weights for titles and tags),
    sends context to OpenAI GPT-4o-mini, and returns the formulated answer and source citations.
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
    # Normalize question words
    q_words = [w.lower() for w in request.question.split() if len(w) > 2]
    
    scored_notes = []
    for note in notes:
        score = 0
        # Check title
        title_lower = note.title.lower()
        # Check content
        content_lower = note.content.lower()
        # Check tags
        tags_lower = (note.tags or "").lower()

        for word in q_words:
            if word in title_lower:
                score += 10  # High weight for title match
            if word in tags_lower:
                score += 5   # Medium weight for tag match
            if word in content_lower:
                score += 2   # Low weight for content match
        
        scored_notes.append((score, note))

    # Sort descending by score
    scored_notes.sort(key=lambda x: x[0], reverse=True)

    # Select top 5 notes. If all scores are 0, fall back to the most recent notes
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

    # 3. Check for API key and perform chat completion
    if not settings.OPENAI_API_KEY:
        # Graceful fallback: return deterministic text matching summary
        answer = (
            "⚠️ **OpenAI API Key is not configured on the backend.**\n\n"
            "To unlock full AI synthesis, set `OPENAI_API_KEY` in the environment variables.\n"
            "In the meantime, I scanned your notes and found these relevant matched documents:\n\n"
        )
        for note in top_notes:
            answer += f"### {note.title}\n{note.content}\n\n"
        return AskNotesResponse(answer=answer, sources=sources)

    # Format prompt context
    context_entries = []
    for note in top_notes:
        tags_str = f" [Tags: {note.tags}]" if note.tags else ""
        context_entries.append(f"Title: {note.title}{tags_str}\nContent: {note.content}")
    context_text = "\n\n---\n\n".join(context_entries)

    system_prompt = (
        "You are an assistant answering questions using only the user's notes. "
        "Your answers should be friendly, clear, and professional. "
        "You must answer ONLY using the provided notes. "
        "If the notes do not contain enough information to answer the question, state clearly: "
        "'I could not find enough information in your notes to answer this question.' "
        "Do not invent facts or look up external knowledge."
    )

    user_content = (
        f"Question: {request.question}\n\n"
        f"Context notes:\n"
        f"=======================\n"
        f"{context_text}\n"
        f"======================="
    )

    # 4. Call OpenAI API using httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o-mini",
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
                error_detail = response.text
                return AskNotesResponse(
                    answer=f"OpenAI API error (Status {response.status_code}). Below are the matched source notes:\n\n" + 
                           "\n\n".join([f"**{n.title}**: {n.content}" for n in top_notes]),
                    sources=sources,
                )
            
            resp_data = response.json()
            answer = resp_data["choices"][0]["message"]["content"].strip()
            
            return AskNotesResponse(answer=answer, sources=sources)

    except Exception as e:
        return AskNotesResponse(
            answer=f"Could not connect to OpenAI API due to a connection error ({str(e)}). Matched source notes:\n\n" + 
                   "\n\n".join([f"**{n.title}**: {n.content}" for n in top_notes]),
            sources=sources,
        )
