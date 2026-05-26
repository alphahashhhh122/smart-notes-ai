import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, or_, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Message, Note, NoteCreate, NotePublic, NotesPublic, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


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

    update_dict = note_in.model_dump(exclude_unset=True)
    note.sqlmodel_update(update_dict)
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