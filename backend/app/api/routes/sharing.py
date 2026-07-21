import secrets
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models import Message, Note, SharedNote, SharedNotePublic, ShareResponse

router = APIRouter(prefix="/sharing", tags=["sharing"])


@router.post("/{note_id}", response_model=ShareResponse)
def create_share_link(
    note_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """Create a shareable public link for a note."""
    note = session.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # Return existing token if already shared
    existing = session.exec(
        select(SharedNote).where(SharedNote.note_id == note_id)
    ).first()
    if existing:
        return ShareResponse(token=existing.token)

    token = secrets.token_urlsafe(20)
    shared = SharedNote(note_id=note_id, token=token)
    session.add(shared)
    session.commit()
    return ShareResponse(token=token)


@router.delete("/{note_id}", response_model=Message)
def remove_share_link(
    note_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """Remove sharing for a note."""
    note = session.get(Note, note_id)
    if not note or note.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")

    shared = session.exec(
        select(SharedNote).where(SharedNote.note_id == note_id)
    ).first()
    if shared:
        session.delete(shared)
        session.commit()
    return Message(message="Share link removed")


@router.get("/view/{token}", response_model=SharedNotePublic)
def view_shared_note(token: str, session: SessionDep) -> Any:
    """Public endpoint — view a shared note without authentication."""
    shared = session.exec(select(SharedNote).where(SharedNote.token == token)).first()
    if not shared:
        raise HTTPException(status_code=404, detail="Shared note not found")

    note = session.get(Note, shared.note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    return SharedNotePublic(
        title=note.title,
        content=note.content,
        tags=note.tags,
        summary=note.summary,
    )
