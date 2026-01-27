# Deploying to Google Cloud Run

## Prerequisites

- GCP project with Firestore and Vertex AI enabled.
- Artifact Registry repository **aiforgood** in **asia-southeast1**.
- Cloud Build service account permissions (project number: **281798566132**):
  - Grant `roles/artifactregistry.writer` on the **aiforgood** Artifact Registry repo to
    `281798566132@cloudbuild.gserviceaccount.com`.
  - Grant `roles/run.admin` and `roles/iam.serviceAccountUser` so Cloud Build can deploy
    to Cloud Run.

## Deploy steps (Cloud Build)

1. **Create a Cloud Build trigger**

Use **"Use cloudbuild.yaml from repo"** so Cloud Build runs the root `cloudbuild.yaml`.

2. **Build & deploy**

Run the trigger. It will:

- Build `services/api` using the Dockerfile in that directory.
- Push the image to `asia-southeast1-docker.pkg.dev/$PROJECT_ID/aiforgood/api:$SHORT_SHA`.
- Deploy the Cloud Run service `aiforgood` in `asia-southeast1`.

3. **Configure secrets / sensitive env vars**

The Cloud Build deploy step sets only:

- `NODE_ENV=production`
- `ALLOWED_ORIGIN=https://aiforgood.nguyenhaan.id.vn`

Set any admin credentials, API keys, or cookies separately in Cloud Run or via Secret
Manager (do **not** hardcode them in the repo).

4. **Firestore**

- Create the collections described in `docs/ARCHITECTURE.md`.
- Apply security rules to restrict access to server-side Admin SDK.

5. **Firebase Auth**

- Enable Google provider.
- Add `aiforgood.nguyenhaan.id.vn` to Authorized Domains.

6. **Vertex AI**

- Ensure the Cloud Run service account has the `Vertex AI User` role.
- Set `GCP_PROJECT_ID` and `GCP_LOCATION` on the service.

7. **Verify deployment**

- In Cloud Run, check the latest revision and ensure traffic is **100%** on the newest
  revision (remove any placeholder deployments).

## Local dev with service account JSON

Set `FIREBASE_SERVICE_ACCOUNT_JSON` and `GOOGLE_APPLICATION_CREDENTIALS` if running locally:

```bash
export FIREBASE_SERVICE_ACCOUNT_JSON='{"project_id":"..."}'
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```
