# AI For Good V1 — AI Học Văn 10

AI For Good V1 is a production-ready learning platform for Grade 10 Vietnamese Literature. The project ships a Vite/React web client on GitHub Pages and a Cloud Run-ready Node/Express API that stores learning data in Firestore and brokers AI requests to Vertex AI Gemini.

## Architecture

```
Browser (GitHub Pages: apps/web)
  -> Cloud Run API (services/api)
      -> Firestore (users, profiles, submissions, usage logs)
      -> Vertex AI Gemini
```

- **Frontend**: Vite + React SPA hosted on GitHub Pages with custom domain `aiforgood.nguyenhaan.id.vn`.
- **Backend**: Node/TypeScript Cloud Run API with cookie-based auth and admin RBAC.
- **Data**: Firestore collections for users, profiles, submissions, usage logs, and proctoring events.
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
   - Build output: `apps/web/dist`.
2. **Cloud Run API**
   - Deploy `services/api` with service account access to Firestore + Vertex AI.
3. **Firestore**
   - Collections: `users`, `profiles`, `submissions`, `usageLogs`, `proctoringEvents`.

## Environment variables

### Frontend (GitHub Actions variables)

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Cloud Run API URL (e.g. `https://api-xyz.a.run.app`) |

### Backend (Cloud Run)

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID for Firestore + Vertex AI (preferred) |
| `GCP_PROJECT_ID` | GCP project ID fallback |
| `GCP_LOCATION` | Vertex AI region (e.g. `us-central1`) |
| `ALLOWED_ORIGIN` | CORS origin (default: `https://aiforgood.nguyenhaan.id.vn`) |
| `ADMIN_USERNAME` | Admin username (default: `haanadmin`) |
| `ADMIN_PASSWORD` | Admin password (default: `Haan@2026!123`) |
| `SESSION_SECRET` | Cookie signing secret |
| `COOKIE_SECURE` | Set to `true` to force secure cookies (default: `true`) |
| `DAILY_QUOTA` | Per-user daily request quota |

## Security notes

- Change `ADMIN_PASSWORD` in production and rotate regularly.
- Passwords are hashed with `bcrypt`.
- Session cookies are `HttpOnly`, `Secure`, and `SameSite=Lax`.
- LLM calls remain server-side; no frontend secrets.
- Rate limits are enforced for auth and API usage.

