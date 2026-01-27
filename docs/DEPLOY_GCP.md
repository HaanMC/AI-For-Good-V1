# Deploying to Google Cloud Run

## Prerequisites

- GCP project with Firestore and Vertex AI enabled.
- Service account with:
  - Firestore access
  - Vertex AI User role
  - Firebase Admin permissions

## Deploy steps

1. **Build & deploy Cloud Run**

```bash
cd services/api
npm ci
npm run build

gcloud run deploy ai-for-good-api \
  --source . \
  --region us-central1 \
  --set-env-vars \
GOOGLE_CLOUD_PROJECT=your-project,\
GCP_LOCATION=us-central1,\
ALLOWED_ORIGINS=https://aiforgood.nguyenhaan.id.vn,\
COOKIE_SECRET=your-secret,\
ADMIN_USERNAME=admin,\
ADMIN_PASSWORD=strong-password,\
DAILY_QUOTA=500
```

2. **Firestore**

- Create the collections described in `docs/ARCHITECTURE.md`.
- Apply security rules to restrict access to server-side Admin SDK.

3. **Firebase Auth**

- Enable Google provider.
- Add `aiforgood.nguyenhaan.id.vn` to Authorized Domains.

4. **Vertex AI**

- Ensure the Cloud Run service account has the `Vertex AI User` role.
- Set `GCP_PROJECT_ID` and `GCP_LOCATION` on the service.

## Local dev with service account JSON

Set `FIREBASE_SERVICE_ACCOUNT_JSON` and `GOOGLE_APPLICATION_CREDENTIALS` if running locally:

```bash
export FIREBASE_SERVICE_ACCOUNT_JSON='{"project_id":"..."}'
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```
