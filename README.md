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
   - Custom domain: `aiforgood.nguyenhaan.id.vn` (configure the Pages custom domain + DNS CNAME).
   - Build output: `apps/web/dist`.
2. **Cloud Run API**
   - Deploy the backend from Cloud Build using **Build Type: Dockerfile** and **Source location: `/services/api/Dockerfile`**.
   - Cloud Run listens on `0.0.0.0:$PORT` for container health.
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

## Cloud Run deployment steps (Cloud Build UI)

1. Open **Cloud Run → Deploy container** and select **Source**.
2. Set **Build Type** to **Dockerfile**.
3. Set **Source location** to `/services/api/Dockerfile`.
4. Set **Build context** to the repository root.
5. Set environment variables:
   - `ALLOWED_ORIGIN=https://aiforgood.nguyenhaan.id.vn`
   - `ADMIN_USERNAME` and `ADMIN_PASSWORD` (override defaults in production)
   - `SESSION_SECRET` (required for cookie signing)
6. Grant the Cloud Run service account **Cloud Datastore User** (Firestore) and Vertex AI access.
7. Deploy and confirm the service responds on the `$PORT` provided by Cloud Run.
8. Verify quickly with `GET /api/health` (returns JSON).

## Cloud Build CLI example

```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/aiforgood-api .
```

Then deploy the image to Cloud Run:

```bash
gcloud run deploy aiforgood-api \
  --image gcr.io/$PROJECT_ID/aiforgood-api \
  --region us-central1 \
  --platform managed \
  --set-env-vars ALLOWED_ORIGIN=https://aiforgood.nguyenhaan.id.vn \
  --set-env-vars SESSION_SECRET=YOUR_SECRET
```

## GitHub Pages setup notes

- The Pages build expects `apps/web/package-lock.json` for `npm ci`.
- Configure the GitHub Actions repository variable `VITE_API_BASE_URL` to point at the Cloud Run URL.
- Ensure the custom domain `aiforgood.nguyenhaan.id.vn` is configured in GitHub Pages and DNS.

## Security notes

- Change `ADMIN_PASSWORD` in production and rotate regularly.
- Passwords are hashed with `bcrypt`.
- Session cookies are `HttpOnly`, `Secure`, and `SameSite=None` to allow cross-site auth from GitHub Pages.
- LLM calls remain server-side; no frontend secrets.
- Rate limits are enforced for auth and API usage.
