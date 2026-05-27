from typing import Any

import httpx
from fastapi import APIRouter
from sqlmodel import select
from sqlalchemy import text as sql_text

from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.models import Note, AskNotesRequest, AskNotesResponse, AskNotesSource

router = APIRouter(prefix="/ai", tags=["ai"])


def get_query_embedding(question: str) -> list[float] | None:
    """Get query embedding from Cohere for semantic search."""
    if not getattr(settings, "COHERE_API_KEY", None):
        return None
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                "https://api.cohere.com/v2/embed",
                headers={
                    "Authorization": f"Bearer {settings.COHERE_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "embed-english-light-v3.0",
                    "texts": [question],
                    "input_type": "search_query",
                    "embedding_types": ["float"],
                },
            )
            if response.status_code == 200:
                return response.json()["embeddings"]["float"][0]
    except Exception:
        pass
    return None


@router.post("/ask", response_model=AskNotesResponse)
async def ask_notes(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    request: AskNotesRequest,
) -> Any:
    """
    RAG query with semantic search (pgvector) + keyword fallback.
    """
    # 1. Retrieve all user notes
    statement = select(Note).where(Note.owner_id == current_user.id)
    notes = session.exec(statement).all()

    if not notes:
        return AskNotesResponse(
            answer="You don't have any notes yet! Create some notes first.",
            sources=[],
            search_type="none",
        )

    # 2. Try semantic search first
    search_type = "keyword"
    top_notes = []

    query_embedding = get_query_embedding(request.question)

    if query_embedding:
        try:
            # Use pgvector cosine similarity
            result = session.execute(
                sql_text("""
                    SELECT id FROM note
                    WHERE owner_id = :owner_id
                    AND embedding IS NOT NULL
                    ORDER BY embedding <=> CAST(:emb AS vector)
                    LIMIT 5
                """),
                {
                    "owner_id": str(current_user.id),
                    "emb": str(query_embedding),
                },
            )
            note_ids = [row[0] for row in result]
            if note_ids:
                top_notes = [n for n in notes if str(n.id) in [str(nid) for nid in note_ids]]
                search_type = "semantic"
        except Exception:
            pass  # Fall through to keyword search

    # 3. Keyword fallback
    if not top_notes:
        q_words = [w.lower() for w in request.question.split() if len(w) > 2]
        scored = []
        for note in notes:
            score = 0
            for word in q_words:
                if word in note.title.lower(): score += 10
                if word in (note.tags or "").lower(): score += 5
                if word in note.content.lower(): score += 2
            scored.append((score, note))
        scored.sort(key=lambda x: x[0], reverse=True)
        top_notes = list(notes)[:5] if scored[0][0] == 0 else [n for s, n in scored[:5] if s > 0]
        search_type = "keyword"

    sources = [
        AskNotesSource(
            id=note.id,
            title=note.title,
            snippet=note.content[:200] + ("..." if len(note.content) > 200 else ""),
        )
        for note in top_notes
    ]

    # 4. Check API key
    if not settings.OPENAI_API_KEY:
        answer = "AI key not configured. Matched notes:\n\n" + "\n\n".join(
            [f"**{n.title}**: {n.content}" for n in top_notes]
        )
        return AskNotesResponse(answer=answer, sources=sources, search_type=search_type)

    # 5. Build context and call Groq
    context_text = "\n\n---\n\n".join([
        f"Title: {note.title}{f' [Tags: {note.tags}]' if note.tags else ''}\n"
        f"Summary: {note.summary or 'N/A'}\n"
        f"Content: {note.content}"
        for note in top_notes
    ])

    search_hint = "using semantic similarity search" if search_type == "semantic" else "using keyword search"
    system_prompt = (
        f"You are a helpful assistant answering questions about the user's notes ({search_hint}). "
        "Be friendly, clear and concise. Only use the provided notes. "
        "If the notes don't have enough info, say so clearly."
    )

    user_content = f"Question: {request.question}\n\nRelevant notes:\n===========\n{context_text}\n==========="

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
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
                    answer=f"AI error ({response.status_code}): {response.text}\n\nMatched notes:\n\n" +
                           "\n\n".join([f"**{n.title}**: {n.content}" for n in top_notes]),
                    sources=sources,
                    search_type=search_type,
                )

            answer = response.json()["choices"][0]["message"]["content"].strip()
            return AskNotesResponse(answer=answer, sources=sources, search_type=search_type)

    except Exception as e:
        return AskNotesResponse(
            answer=f"Connection error: {str(e)}\n\nMatched notes:\n\n" +
                   "\n\n".join([f"**{n.title}**: {n.content}" for n in top_notes]),
            sources=sources,
            search_type=search_type,
        )
