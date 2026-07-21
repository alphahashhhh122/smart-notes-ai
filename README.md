# Smart Notes AI

Smart Notes AI is a full-stack personal knowledge-base application. It lets users create, organize, search, version, share, and query their notes from one workspace.

> **Academic note:** This project extends the FastAPI Full Stack FastAPI Template. See [ATTRIBUTION.md](ATTRIBUTION.md) for the template credit and the scope of the project-specific work.

## Features

- Account-based note storage with authenticated access
- Note creation, editing, deletion, tags, and keyword search
- Version history with restore support
- Public share links for individual notes
- Optional semantic retrieval with Cohere embeddings and pgvector
- A grounded Ask AI experience that answers from the user's notes, with keyword-search fallback when providers are not configured

## Technology

- Frontend: React, TypeScript, Vite, TanStack Router, React Query, Chakra UI
- Backend: FastAPI, SQLModel, Alembic, PostgreSQL, pgvector
- Optional providers: Cohere for embeddings and Groq for text generation
- Tooling: Docker Compose, pytest, Playwright, Ruff, Biome

## Project layout

```text
backend/                     FastAPI application and database migrations
frontend/                    React application and generated API client
docs/                        Architecture and project documentation
scripts/                     Build, test, deploy, and client-generation helpers
docker-compose.yml           Production-style service definition
docker-compose.override.yml  Local development overrides
```

## Run locally

1. Install Docker Desktop.
2. Copy the environment template and replace every `changethis` value:

   ```bash
   cp .env.example .env
   ```

3. Start the application:

   ```bash
   docker compose up --build
   ```

4. Open the frontend at `http://localhost:5173` and API documentation at `http://localhost:8000/docs`.

`GROQ_API_KEY` and `COHERE_API_KEY` are optional. Without them, the application still supports notes and keyword-based retrieval.

## Development checks

```bash
# Backend tests
docker compose exec backend bash scripts/test.sh

# Frontend formatting and static checks
cd frontend && npm run lint

# Build the frontend
cd frontend && npm run build
```

## API overview

- `GET/POST /api/v1/notes/` lists or creates notes
- `GET/PUT/DELETE /api/v1/notes/{id}` reads, updates, or deletes a note
- `GET /api/v1/notes/{id}/versions` lists saved versions
- `POST /api/v1/notes/{id}/restore/{version_id}` restores a version
- `POST /api/v1/ai/ask` retrieves relevant notes and answers a question
- `POST /api/v1/sharing/{note_id}` creates a public share link

See [docs/architecture.md](docs/architecture.md) for the component and retrieval design.

## Security

Do not commit `.env`, API keys, database passwords, or deployment credentials. The repository includes `.env.example` as a safe configuration reference. If a secret was previously committed, rotate it through its provider dashboard before deploying again.

## License

This project is licensed under the MIT License. The original template copyright notice is retained in [LICENSE](LICENSE).
