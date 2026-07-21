# Backend

The backend is a FastAPI application backed by PostgreSQL and SQLModel.

## Local development

From the repository root, copy `.env.example` to `.env`, update the placeholder secrets, then start the stack with Docker Compose:

```bash
docker compose up --build
```

For a Python-only workflow:

```bash
cd backend
uv sync
uv run fastapi dev app/main.py
```

The API documentation is available at `http://localhost:8000/docs` when the service is running.

## Quality checks

```bash
cd backend
uv run ruff check .
uv run pytest
```

## Database migrations

Create a migration after changing a SQLModel table definition:

```bash
cd backend
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```
