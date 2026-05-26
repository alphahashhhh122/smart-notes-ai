#!/usr/bin/env bash
set -e

# ------------------------------------------------------------
# Deploy Smart‑Notes‑AI to Railway
# ------------------------------------------------------------
# Prerequisites (run once):
#   1. Install Railway CLI: npm i -g railway
#   2. Have a Railway project created (or know its ID).
#   3. Export the following env vars before running this script:
#        DATABASE_URL   – PostgreSQL connection string from Railway
#        OPENAI_API_KEY – Your OpenAI secret key
#        FRONTEND_URL   – URL of the frontend service (will be set after deployment)
# ------------------------------------------------------------

# Ensure we are in the project root (where this script lives)
cd "$(dirname "${BASH_SOURCE[0]}")"

# Helper to abort if a required env var is missing
require_var() {
  var_name="$1"
  if [[ -z "${!var_name}" ]]; then
    echo "Error: $var_name is not set. Export it before running this script." >&2
    exit 1
  fi
}

require_var DATABASE_URL
require_var OPENAI_API_KEY
# FRONTEND_URL will be set after the frontend is deployed, so we don't require it now.

# ----------------------------------------------------------------
# 1️⃣  Link (or create) the Railway project
# ----------------------------------------------------------------
# If the directory is already linked, this is a no‑op.
if ! railway status &>/dev/null; then
  echo "Linking to Railway project..."
  # The user should have RAILWAY_PROJECT_ID exported, or they will be prompted.
  railway link
fi

# ----------------------------------------------------------------
# 2️⃣  Deploy the backend service
# ----------------------------------------------------------------
echo "Deploying backend…"
railway service create backend --dockerfile backend/Dockerfile || true
# Set backend env vars (Railway will store them securely)
railway variables set DATABASE_URL "$DATABASE_URL"
railway variables set OPENAI_API_KEY "$OPENAI_API_KEY"
# OPTIONAL: you can also set FRONTEND_URL here after the frontend is up.

# Trigger a deployment of the backend service
railway up -s backend

# ----------------------------------------------------------------
# 3️⃣  Deploy the frontend service
# ----------------------------------------------------------------
echo "Deploying frontend…"
railway service create frontend --dockerfile frontend/Dockerfile || true
# No special env vars needed for the frontend, but you may want the API URL.
# Pass the API URL as a build‑time arg (VITE_API_URL).
# Railway automatically injects it if you set a variable with the same name.
railway variables set VITE_API_URL "$(railway service status backend --url)"

railway up -s frontend

# ----------------------------------------------------------------
# 4️⃣  Show the live URLs
# ----------------------------------------------------------------
BACKEND_URL=$(railway service status backend --url)
FRONTEND_URL=$(railway service status frontend --url)

echo "-------------------------------"
echo "Backend Swagger UI : $BACKEND_URL/docs"
echo "Frontend UI       : $FRONTEND_URL"
echo "-------------------------------"

# Done!
