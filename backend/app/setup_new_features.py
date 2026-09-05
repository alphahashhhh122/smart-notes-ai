"""
Run once at startup to add pgvector extension, new columns and tables.
Fully idempotent - safe to run multiple times.
"""

import logging
import os

from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)

DATABASE_URL = (
    f"postgresql+psycopg://{os.environ['POSTGRES_USER']}:{os.environ['POSTGRES_PASSWORD']}"
    f"@{os.environ['POSTGRES_SERVER']}:{os.environ.get('POSTGRES_PORT', '5432')}/{os.environ['POSTGRES_DB']}"
)

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    logger.info("Setting up pgvector and note features")

    # Enable pgvector extension
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

    # Add summary column to note
    conn.execute(
        text("""
        DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='note' AND column_name='summary'
            ) THEN
                ALTER TABLE note ADD COLUMN summary TEXT;
            END IF;
        END $$
    """)
    )

    # Add embedding column to note (384-dim for Cohere embed-english-light-v3.0)
    conn.execute(
        text("""
        DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='note' AND column_name='embedding'
            ) THEN
                ALTER TABLE note ADD COLUMN embedding vector(384);
            END IF;
        END $$
    """)
    )

    # Create ivfflat index for fast cosine similarity search
    conn.execute(
        text("""
        CREATE INDEX IF NOT EXISTS note_embedding_idx
        ON note USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 10)
    """)
    )

    # Create noteversion table
    conn.execute(
        text("""
        CREATE TABLE IF NOT EXISTS noteversion (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            note_id UUID NOT NULL REFERENCES note(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tags TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    )

    # Create sharednote table
    conn.execute(
        text("""
        CREATE TABLE IF NOT EXISTS sharednote (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            note_id UUID NOT NULL REFERENCES note(id) ON DELETE CASCADE,
            token TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    )

    conn.commit()
    logger.info("pgvector and note features are ready")
