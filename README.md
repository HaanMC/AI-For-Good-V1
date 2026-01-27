# AI For Good V1 — AI Hoc Van 10

AI For Good V1 is a production-ready learning platform for Grade 10 Vietnamese Literature. The project ships a Vite/React web client on GitHub Pages and a Cloud Run-ready Node/Express API that stores learning data in Firestore and brokers AI requests to Vertex AI Gemini.

## Architecture

```
+---------------------------+
|  Frontend (GitHub Pages)  |
|  apps/web - Vite + React  |
|  aiforgood.nguyenhaan.id.vn
+------------+--------------+
             |
             | HTTPS (CORS)
             v
+---------------------------+
|  API (Cloud Run)          |
|  services/api - Node/TS   |
|  asia-southeast1          |
+------------+--------------+
             |
     +-------+-------+
     |               |
     v               v
+----------+  +-------------+
| Firestore|  | Vertex AI   |
| Database |  | Gemini LLM  |
+----------+  +-------------+
```

| Component | Technology | Hosting |
|-----------|------------|---------|
| Frontend | Vite + React SPA | GitHub Pages (`aiforgood.nguyenhaan.id.vn`) |
| Backend API | Node.js + TypeScript + Express | Cloud Run (`asia-southeast1`) |
| Database | Firestore | GCP (users, profiles, submissions, usage logs) |
| LLM | Vertex AI Gemini | GCP (server-side calls only) |
| Container Registry | Artifact Registry | GCP (`asia-southeast1`) |

## Folder Map

```
apps/web/           # Vite React app (GitHub Pages)
services/api/       # Cloud Run API (Node/TypeScript)
  ├── Dockerfile    # Multi-stage Docker build
  └── src/          # API source code
cloudbuild.yaml     # Cloud Build config for Artifact Registry + Cloud Run
docs/               # Architecture + deployment + security guides
```

## Local Development

### Web App (Frontend)

```bash
cd apps/web
npm ci
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

### API (Backend)

```bash
cd services/api
npm ci
npm run dev
```

The API runs at `http://localhost:8080` by default.

For local development with GCP services, set:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
export GOOGLE_CLOUD_PROJECT=your-project-id
export GCP_LOCATION=us-central1
export ALLOWED_ORIGINS=http://localhost:5173
export COOKIE_SECRET=dev-secret
```

## Deploy API to Cloud Run

The API is deployed to Cloud Run using Artifact Registry for container images.

**Full deployment guide:** [docs/gcp-cloudrun-deploy.md](docs/gcp-cloudrun-deploy.md)

### Artifact Registry + Cloud Build Setup

1. Create Artifact Registry repository (once):
   ```bash
   gcloud artifacts repositories create aiforgood \
     --repository-format=docker \
     --location=asia-southeast1 \
     --description="AI For Good API images"
   ```

2. Grant Cloud Build permissions (required for `281798566132@cloudbuild.gserviceaccount.com`):
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:281798566132@cloudbuild.gserviceaccount.com" \
     --role="roles/artifactregistry.writer"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:281798566132@cloudbuild.gserviceaccount.com" \
     --role="roles/run.admin"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:281798566132@cloudbuild.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   ```

3. Create/update a Cloud Build trigger to use `cloudbuild.yaml` (do not use Dockerfile mode):
   - Trigger config file: `cloudbuild.yaml` at repo root
   - Build context: repository root
   - Ensure substitutions match the defaults in the file (region `asia-southeast1`)

### Quick Deploy (CLI)

1. Build and push image:
   ```bash
   gcloud builds submit \
     --config=cloudbuild.yaml \
     --project=YOUR_PROJECT_ID \
     .
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy aiforgood \
     --image=asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/aiforgood/aiforgood-api:latest \
     --region=asia-southeast1 \
     --platform=managed \
     --allow-unauthenticated \
     --set-env-vars="ALLOWED_ORIGINS=https://aiforgood.nguyenhaan.id.vn,COOKIE_SECRET=your-secret,ADMIN_USERNAME=admin,ADMIN_PASSWORD=strong-password,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GCP_LOCATION=asia-southeast1"
   ```

3. Verify:
   ```bash
   curl https://YOUR_CLOUD_RUN_URL/api/health
   ```

Cloud Run environment variables to set (required):

- `ALLOWED_ORIGINS`
- `COOKIE_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `GOOGLE_CLOUD_PROJECT`
- `GCP_LOCATION`

### Image Location

Images are stored in Artifact Registry:
```
asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/aiforgood/aiforgood-api:TAG
```

## Deploy Frontend to GitHub Pages

The frontend is automatically deployed via GitHub Actions on push to `main`.

1. Set repository variable `VITE_API_BASE_URL` to the Cloud Run API URL
2. Configure custom domain `aiforgood.nguyenhaan.id.vn` in GitHub Pages settings
3. Set up DNS CNAME record pointing to GitHub Pages

## Environment Variables

### Frontend (GitHub Actions)

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Cloud Run API URL | `https://aiforgood-xyz.a.run.app` |

### Backend (Cloud Run)

| Variable | Purpose | Required | Default |
|----------|---------|----------|---------|
| `GOOGLE_CLOUD_PROJECT` | GCP project ID for Firestore + Vertex AI | Yes | - |
| `GCP_LOCATION` | Vertex AI region | Yes | `us-central1` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | Yes | `http://localhost:5173,https://aiforgood.nguyenhaan.id.vn` |
| `COOKIE_SECRET` | Cookie signing secret | Yes | - |
| `SESSION_SECRET` | Alternate cookie signing secret | No | - |
| `ALLOWED_ORIGIN` | Legacy single allowed origin | No | - |
| `ADMIN_USERNAME` | Admin login username | Yes | - |
| `ADMIN_PASSWORD` | Admin login password | Yes | - |
| `DAILY_QUOTA` | Per-user daily request quota | No | `500` |
| `COOKIE_SECURE` | Force secure cookies | No | `true` |
| `PORT` | Server listen port | No | `8080` |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/chat/*` | * | Chat with Gemini (authenticated) |
| `/api/exam/*` | * | Exam/quiz endpoints (authenticated) |
| `/api/writing/*` | * | Writing feedback (authenticated) |
| `/api/student/*` | * | Student profile (authenticated) |
| `/api/admin/*` | * | Admin endpoints (admin role required) |

## Security Notes

- Change `ADMIN_PASSWORD` in production and rotate regularly
- Passwords are hashed with `bcrypt`
- Session cookies are `HttpOnly`, `Secure`, and `SameSite=None` for cross-site auth
- LLM calls remain server-side; no frontend secrets exposed
- Rate limits are enforced for auth and API usage

## Documentation

- [GCP Cloud Run Deployment](docs/gcp-cloudrun-deploy.md) - Full deployment guide with Artifact Registry
- [Architecture](docs/ARCHITECTURE.md) - System architecture and data model
- [Security](docs/SECURITY.md) - Security best practices
- [Admin Bootstrap](docs/BOOTSTRAP_ADMIN.md) - Initial admin setup
