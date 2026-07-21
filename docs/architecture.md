# Architecture

Smart Notes AI is a three-service web application.

```text
React + Vite frontend
        |
        v
FastAPI REST API ---- PostgreSQL + pgvector
        |
        +---- optional Groq text generation
        +---- optional Cohere embeddings
```

## Main components

- `frontend/` contains the React user interface, routes, and generated API client.
- `backend/app/api/routes/notes.py` provides note CRUD, search, and version history.
- `backend/app/api/routes/ai.py` retrieves relevant notes and produces a grounded answer when an AI provider is configured.
- `backend/app/api/routes/sharing.py` manages public links for individual notes.
- `backend/app/models.py` defines application, note, version, and sharing data models.

## Retrieval flow

1. A user asks a question from the Ask AI screen.
2. The API fetches only that user's notes.
3. If Cohere embeddings are available, pgvector selects the closest notes; otherwise, keyword scoring is used.
4. The selected notes are returned as sources. If a Groq API key is configured, they are also used as the sole context for the generated answer.

This fallback keeps core note retrieval available without external AI credentials.
