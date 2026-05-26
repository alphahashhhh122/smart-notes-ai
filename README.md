# Smart Notes AI - Knowledge Base & Context-Aware RAG Assistant

Smart Notes AI is a polished, full-stack knowledge base application designed for mentor Week 1 evaluations. It extends the FastAPI + React + PostgreSQL template into a robust note-taking platform featuring full CRUD, tags, real-time keyword-based search, and a context-aware AI "Ask my notes" assistant (RAG-style MVP).

## 🚀 Key Features

*   🔒 **Secure Authentication**: JWT-based login, register, and robust user-specific isolation (users can only access and query their own notes).
*   📝 **Smart Notes CRUD**: Full CRUD support for notes (Create, Read, Update, Delete) designed with modern card views.
*   🏷️ **Flexible Tagging**: Add comma-separated tags to notes to categorize thoughts and increase discovery.
*   🔍 **Unified Search**: Search across note titles, contents, and tags instantly with SQL-based filter matching.
*   🧠 **Ask My Notes AI (RAG)**: Ask any natural language question about your notes. The backend retrieves the most relevant entries using keyword-overlap matching (weighting titles and tags higher) and prompts an LLM (GPT-4o-mini) to compile a precise answer based **only** on your notes.
*   ⚠️ **Robust Fallback Mode**: If no `OPENAI_API_KEY` is configured, the system gracefully shifts into text-matching mode to summarize relevant notes rather than crashing.

---

## 🛠️ Technology Stack

### Backend
*   ⚡ **FastAPI**: Asynchronous Python web framework.
*   🗃️ **SQLModel**: Combined ORM wrapping SQLAlchemy & Pydantic.
*   🔄 **Alembic**: Database migrations (pruned down to a single clean `add_notes_table` head).
*   🐘 **PostgreSQL**: Production-grade relational database persistence.

### Frontend
*   ⚛️ **React + Vite**: Fast, typed modern frontend stack.
*   🎨 **Chakra UI v3**: Vibrant, accessible components and dark mode support.
*   🛣️ **TanStack Router**: Type-safe, declarative client-side routing.
*   🤖 **OpenAPI TS**: Automatically generated TypeScript SDK clients.

---

## ⚙️ Environment Variables

Before running or deploying the app, make sure to configure these in your `.env` file:

```env
# Stack Config
DOMAIN=localhost
FRONTEND_HOST=http://localhost:5173
ENVIRONMENT=local
PROJECT_NAME="Smart Notes AI"

# Backend Authentication Security
SECRET_KEY=generate-a-secure-secret-key-here
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=choose-a-strong-password

# PostgreSQL DB Config
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=choose-a-db-password

# AI Integration
OPENAI_API_KEY=your-openai-api-key-here
```

---

## 🏃 Local Setup & Development

### 1. Prerequisites
Ensure you have **Docker** and **Docker Compose** installed on your system.

### 2. Startup
Run the following command in the project root folder to start all database, backend, and frontend containers:

```bash
docker compose up -d --build
```

This starts:
*   **FastAPI Backend**: `http://localhost:8000` (FastAPI docs at `http://localhost:8000/docs`)
*   **React Frontend**: `http://localhost:5173/items` (Active notes interface)
*   **Adminer DB GUI**: `http://localhost:8080`
*   **Mailcatcher**: `http://localhost:1080`

### 3. Apply DB Migrations
The prestart container automatically handles migrations. To manually run or inspect:

```bash
docker compose exec backend alembic current
docker compose exec backend alembic heads
```

---

## 🔌 API Overview

### Notes CRUD
*   `GET /api/v1/notes/` - List user's notes (supports limit, offset, and search queries)
*   `POST /api/v1/notes/` - Create a new note
*   `GET /api/v1/notes/{id}` - Retrieve a specific note
*   `PUT /api/v1/notes/{id}` - Update an existing note
*   `DELETE /api/v1/notes/{id}` - Delete a note

### Ask My Notes AI
*   `POST /api/v1/ai/ask`
    *   **Request Body**: `{"question": "What did I write about FastAPI?"}`
    *   **Response Body**:
        ```json
        {
          "answer": "You wrote that FastAPI is a fast Python framework...",
          "sources": [
            {
              "id": "uuid-here",
              "title": "FastAPI notes",
              "snippet": "FastAPI is a modern, fast (high-performance) web framework..."
            }
          ]
        }
        ```

---

## 🚢 Railway Deployment

This application is ready to deploy on **Railway**!

### Deployment Instructions:
1. Connect your GitHub repository to Railway.
2. In Railway, provision a **PostgreSQL Database** service.
3. Configure the environment variables in your Backend service settings matching the variables specified in the [Environment Variables](#-environment-variables) section.
4. Railway will automatically build and deploy both the backend and frontend services based on their respective Dockerfiles!

**Live Demo URL**: *(Insert Deployed URL Here)*

---

## 📄 License
Licensed under the [MIT License](./LICENSE).
