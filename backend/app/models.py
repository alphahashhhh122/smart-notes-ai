import uuid
from datetime import datetime

from pydantic import EmailStr
from sqlalchemy import Column, Text
from sqlmodel import Field, Relationship, SQLModel

try:
    from pgvector.sqlalchemy import Vector

    _embedding_col = Column(Vector(384), nullable=True)
except ImportError:
    _embedding_col = Column(Text, nullable=True)


# ─── User Models ────────────────────────────────────────────────────────────


class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    notes: list["Note"] = Relationship(back_populates="owner", cascade_delete=True)


class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# ─── Item Models ─────────────────────────────────────────────────────────────


class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# ─── Note Models ─────────────────────────────────────────────────────────────


class NoteBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    tags: str | None = Field(default=None, max_length=500)


class NoteCreate(NoteBase):
    pass


class NoteUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    tags: str | None = Field(default=None, max_length=500)


class Note(NoteBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="notes")
    summary: str | None = Field(default=None)
    embedding: list[float] | None = Field(default=None, sa_column=_embedding_col)


class NotePublic(NoteBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    summary: str | None = None


class NotesPublic(SQLModel):
    data: list[NotePublic]
    count: int


# ─── Note Version Models ──────────────────────────────────────────────────────


class NoteVersion(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    note_id: uuid.UUID = Field(foreign_key="note.id", nullable=False)
    title: str
    content: str
    tags: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NoteVersionPublic(SQLModel):
    id: uuid.UUID
    note_id: uuid.UUID
    title: str
    content: str
    tags: str | None
    created_at: datetime


class NoteVersionsPublic(SQLModel):
    data: list[NoteVersionPublic]


# ─── Shared Note Models ───────────────────────────────────────────────────────


class SharedNote(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    note_id: uuid.UUID = Field(foreign_key="note.id", nullable=False)
    token: str = Field(unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ShareResponse(SQLModel):
    token: str


class SharedNotePublic(SQLModel):
    title: str
    content: str
    tags: str | None
    summary: str | None


# ─── AI Models ───────────────────────────────────────────────────────────────


class AskNotesRequest(SQLModel):
    question: str = Field(min_length=1, max_length=1000)


class AskNotesSource(SQLModel):
    id: uuid.UUID
    title: str
    snippet: str | None = None


class AskNotesResponse(SQLModel):
    answer: str
    sources: list[AskNotesSource]
    search_type: str = "keyword"  # "semantic" or "keyword"


# ─── Generic ─────────────────────────────────────────────────────────────────


class Message(SQLModel):
    message: str


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)
