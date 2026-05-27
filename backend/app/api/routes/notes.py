import uuid
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException
from sqlmodel import func, or_, select

from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.models import (
    Message, Note, NoteCreate, NotePublic, NotesPublic, NoteUpdate,
    NoteVersion, NoteVersionPublic, NoteVersionsPublic,
)

router = APIRouter(prefix="/notes", tags=["notes"])


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_embedding(text: str) -> list[float] | None:
    """Get embedding from Cohere API. Returns None on failure."""
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
                    "texts": [text[:2000]],
                    "input_type": "search_document",
                    "embedding_types": ["float"],
                },
            )
            if response.status_code == 200:
                return response.json()["embeddings"]["float"][0]
    except Exception:
        pass
    return None


def get_summary(title: str, content: str) -> str | None:
    """Generate a 1-2 sentence summary using Groq. Returns None on failure."""
    if not getattr(settings, "OPENAI_API_KEY", None):
        return None
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [{
                        "role": "user",
                        "content": f"Summarize this note in 1-2 sentences. Be concise.\n\nTitle: {title}\nContent: {content[:600]}"
                    }],
                    "max_tokens": 80,
                    "temperature": 0.3,
                },
            )
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        pass
    return None


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/", response_model=NotesPublic)
def read_notes(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
) -> Any:
    if current_user.is_superuser:
        base_statement = select(Note)
        count_statement = select(func.count()).select_from(Note)
    else:
        base_statement = select(Note).where(Note.owner_id == current_user.id)
        count_statement = select(func.count()).select_from(Note).where(
            Note.owner_id == current_user.id
        )

    if search:
        search_filter = or_(
            Note.title.contains(search),
            Note.content.contains(search),
            Note.tags.contains(search),
        )
        base_statement = base_statement.where(search_filter)
        count_statement = count_statement.where(search_filter)

    count = session.exec(count_statement).one()
    notes = session.exec(base_statement.offset(skip).limit(limit)).all()
    return NotesPublic(data=notes, count=count)


@router.get("/{id}", response_model=NotePublic)
def read_note(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    note = session.get(Note, id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if not current_user.is_superuser and (note.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return note


@router.post("/", response_model=NotePublic)
def create_note(
    *, session: SessionDep, current_user: CurrentUser, note_in: NoteCreate
) -> Any:
    note = Note.model_validate(note_in, update={"owner_id": current_user.id})

    # Generate embedding and summary (non-blocking — skip on failure)
    embed_text = f"{note_in.title} {note_in.content}"
    note.embedding = get_embedding(embed_text)
    note.summary = get_summary(note_in.title, note_in.content)

    session.add(note)
    session.commit()
    session.refresh(note)
    return note


@router.put("/{id}", response_model=NotePublic)
def update_note(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    note_in: NoteUpdate,
) -> Any:
    note = session.get(Note, id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if not current_user.is_superuser and (note.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # Save current version before updating
    version = NoteVersion(
        note_id=note.id,
        title=note.title,
        content=note.content,
        tags=note.tags,
    )
    session.add(version)

    # Apply updates
    update_dict = note_in.model_dump(exclude_unset=True)
    note.sqlmodel_update(update_dict)

    # Regenerate embedding and summary
    embed_text = f"{note.title} {note.content}"
    new_embedding = get_embedding(embed_text)
    if new_embedding:
        note.embedding = new_embedding
    note.summary = get_summary(note.title, note.content)

    session.add(note)
    session.commit()
    session.refresh(note)
    return note


@router.delete("/{id}")
def delete_note(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    note = session.get(Note, id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if not current_user.is_superuser and (note.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(note)
    session.commit()
    return Message(message="Note deleted successfully")


# ─── Version History ──────────────────────────────────────────────────────────

@router.get("/{id}/versions", response_model=NoteVersionsPublic)
def get_note_versions(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    note = session.get(Note, id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if not current_user.is_superuser and note.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    versions = session.exec(
        select(NoteVersion)
        .where(NoteVersion.note_id == id)
        .order_by(NoteVersion.created_at.desc())  # type: ignore
        .limit(10)
    ).all()
    return NoteVersionsPublic(data=versions)


@router.post("/{id}/restore/{version_id}", response_model=NotePublic)
def restore_note_version(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    version_id: uuid.UUID,
) -> Any:
    note = session.get(Note, id)
    if not note or note.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")

    version = session.get(NoteVersion, version_id)
    if not version or version.note_id != id:
        raise HTTPException(status_code=404, detail="Version not found")

    # Save current as a version before restoring
    current_version = NoteVersion(
        note_id=note.id, title=note.title, content=note.content, tags=note.tags
    )
    session.add(current_version)

    # Restore
    note.title = version.title
    note.content = version.content
    note.tags = version.tags
    note.summary = get_summary(note.title, note.content)
    note.embedding = get_embedding(f"{note.title} {note.content}")

    session.add(note)
    session.commit()
    session.refresh(note)
    return note
