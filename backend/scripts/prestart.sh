#! /usr/bin/env bash
set -e
set -x
# Let the DB start
python app/backend_pre_start.py
# Setup new features (pgvector, embeddings, versioning, sharing tables)
python app/setup_new_features.py
# Run migrations
alembic upgrade head
# Create initial data in DB
python app/initial_data.py
