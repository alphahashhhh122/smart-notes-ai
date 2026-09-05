# Smart Notes

Smart Notes is a full-stack knowledge base with private note storage,
version history, shareable read-only links, and retrieval-assisted question
answering. I built the note, retrieval, and sharing features on top of the
[Full Stack FastAPI Template](https://github.com/fastapi/full-stack-fastapi-template).

## What it does

- Keeps notes isolated by user with JWT authentication.
- Searches titles, content, and tags with a SQL fallback that works offline.
- Optionally creates Cohere embeddings for semantic retrieval with pgvector.
- Answers questions from the retrieved notes through Groq, and returns the
  source notes used for the answer.
- Stores the previous state of a note before each edit and supports restore.
- Creates revocable, read-only public links with random tokens.

The AI providers are optional. Without provider keys, note CRUD, keyword
retrieval, versioning, and sharing continue to work.

## Architecture

```text
React + TypeScript
        |
        v
FastAPI ---- PostgreSQL + pgvector
  |                 |
  +---- Cohere -----+  embeddings (optional)
  |
  +---- Groq ---------- grounded answer generation (optional)
```

The backend uses FastAPI, SQLModel, Alembic, and PostgreSQL. The frontend uses
React, Vite, Chakra UI, TanStack Router, and a generated OpenAPI client.

## Run locally

Requirements: Docker and Docker Compose.

```bash
cp .env.example .env
docker compose up -d --build
```

Then open:

- App: `http://localhost:5173`
- API documentation: `http://localhost:8000/docs`
- Mailcatcher: `http://localhost:1080`

The compose startup runs database migrations before the API starts.

## Optional provider configuration

Set either or both of these values in `.env`:

```env
COHERE_API_KEY=   # embed-english-light-v3.0 for semantic retrieval
GROQ_API_KEY=     # llama-3.1-8b-instant for grounded answers and summaries
```

Provider failures fall back to keyword retrieval and matched-note excerpts;
they do not block access to stored notes.

## Tests and checks

```bash
cd backend
uv sync
uv run ruff check app
uv run mypy app
uv run pytest

cd ../frontend
npm ci
npm run build
```

End-to-end tests run through Docker Compose and Playwright; see the workflows
under `.github/workflows/`.

## API surface

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/notes/` | List and search the current user's notes |
| `POST` | `/api/v1/notes/` | Create a note |
| `PUT` | `/api/v1/notes/{id}` | Update a note and retain its prior version |
| `GET` | `/api/v1/notes/{id}/versions` | List retained versions |
| `POST` | `/api/v1/notes/{id}/restore/{version_id}` | Restore a version |
| `POST` | `/api/v1/ai/ask` | Ask a question over the current user's notes |
| `POST` | `/api/v1/sharing/{note_id}` | Create a read-only share token |
| `DELETE` | `/api/v1/sharing/{note_id}` | Revoke a share token |

## Scope

This is a portfolio project, not a hosted multi-tenant service. Production use
would require provider rate limits, background jobs for embeddings and
summaries, operational monitoring, and a deployment-specific secret policy.

The upstream template remains available under its MIT license; see `LICENSE`.
