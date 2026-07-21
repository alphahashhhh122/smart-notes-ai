# Frontend

The frontend is a React and TypeScript application built with Vite.

## Local development

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` in `frontend/.env` only when connecting to a remote backend. The local development default is the API served through the Docker Compose setup.

## Quality checks

```bash
npm run lint
npm run build
```

## Generated API client

`src/client/` is generated from the backend OpenAPI schema. Update it after changing API models or routes:

```bash
cd ..
./scripts/generate-client.sh
```
