# AI For Good V1 — AI Học Văn 10

AI For Good V1 is a production-ready learning platform for Grade 10 Vietnamese Literature. It delivers a modern web client on GitHub Pages and a secure Cloud Run API backed by Firestore and Firebase Auth.

## Architecture

```
Browser (GitHub Pages: apps/web)
  -> Cloud Run API (services/api)
      -> Firestore
      -> Firebase Auth (ID tokens + custom claims)
      -> Vertex AI Gemini (service account)
```

- **Frontend**: Vite + React SPA hosted on GitHub Pages with custom domain `aiforgood.nguyenhaan.id.vn`.
- **Backend**: Node/TypeScript Cloud Run API with Firebase Auth verification and RBAC.
- **Data**: Firestore collections for users, classes, assignments, submissions, usage logs, and proctoring events.
- **LLM**: Server-side calls to Vertex AI Gemini (no API keys in frontend).

## Folder map

```
apps/web/       # Vite React app (GitHub Pages)
services/api/   # Cloud Run API (Node/TypeScript)
docs/           # Architecture + deployment + security
```

## Local development

### Web app

```bash
cd apps/web
npm ci
npm run dev
```

### API (Cloud Run)

```bash
cd services/api
npm ci
npm run dev
```

## Deploy overview

1. **GitHub Pages**
   - Custom domain: `aiforgood.nguyenhaan.id.vn`
   - Ensure GitHub Pages builds `apps/web/dist`.
2. **Cloud Run API**
   - Deploy `services/api` with service account access to Firestore + Vertex AI.
3. **Firebase Auth**
   - Enable Google provider and add authorized domains.
4. **Firestore**
   - Create collections documented in `docs/ARCHITECTURE.md`.

Detailed steps:
- `docs/DEPLOY_GCP.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/BOOTSTRAP_ADMIN.md`

## Environment variables

### Frontend (GitHub Actions variables)

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Cloud Run API URL (e.g. `https://api-xyz.a.run.app`) |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

### Backend (Cloud Run)

| Variable | Purpose |
| --- | --- |
| `GCP_PROJECT_ID` | GCP project ID |
| `GCP_LOCATION` | Vertex AI region (e.g. `us-central1`) |
| `ALLOWED_ORIGIN` | CORS origin (default: `https://aiforgood.nguyenhaan.id.vn`) |
| `DAILY_QUOTA` | Per-user daily request quota |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Service account JSON (optional, otherwise ADC) |

## Security highlights

- Firebase ID tokens required for all `/api/*` routes.
- Admin-only routes enforce `role=admin` custom claims.
- LLM calls are strictly server-side (no frontend secrets).
- Rate limits and daily quota enforced on the API.

