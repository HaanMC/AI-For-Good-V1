# Deploying API to Cloud Run via Artifact Registry

This guide provides step-by-step instructions for deploying the AI For Good API to Google Cloud Run using Artifact Registry for container images.

## Overview

| Component | Value |
|-----------|-------|
| GCP Project ID | `gen-lang-client-0038785330` |
| Artifact Registry Region | `asia-southeast1` |
| Artifact Registry Repo | `aiforgood` |
| Cloud Run Service Name | `aiforgood` |
| API Source | `services/api/` |
| Frontend Domain | `https://aiforgood.nguyenhaan.id.vn` |

## Prerequisites

- GCP account with billing enabled
- `gcloud` CLI installed (optional, for CLI commands)
- Git repository access

---

## Step 1: Enable Required APIs

### Via Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project `gen-lang-client-0038785330`
3. Navigate to **APIs & Services** > **Library**
4. Search and enable each API:
   - **Artifact Registry API**
   - **Cloud Run Admin API**
   - **Cloud Build API**
   - **Firestore API** (if not already enabled)
   - **Vertex AI API** (if not already enabled)

### Via gcloud CLI

```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com \
  --project=gen-lang-client-0038785330
```

---

## Step 2: Create Artifact Registry Repository

### Via Console

1. Go to **Artifact Registry** in Cloud Console
2. Click **+ CREATE REPOSITORY**
3. Fill in:
   - **Name**: `aiforgood`
   - **Format**: `Docker`
   - **Mode**: `Standard`
   - **Location type**: `Region`
   - **Region**: `asia-southeast1`
4. Click **CREATE**

### Via gcloud CLI

```bash
gcloud artifacts repositories create aiforgood \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="AI For Good API container images" \
  --project=gen-lang-client-0038785330
```

---

## Step 3: Grant IAM Permissions to Cloud Build Service Account

Cloud Build needs permissions to push images to Artifact Registry and deploy to Cloud Run.

### Find Your Project Number

1. Go to **IAM & Admin** > **Settings**
2. Note the **Project number** (e.g., `123456789012`)

The Cloud Build service account is: `PROJECT_NUMBER@cloudbuild.gserviceaccount.com`

### Via Console

1. Go to **IAM & Admin** > **IAM**
2. Click **+ GRANT ACCESS**
3. In **New principals**, enter: `PROJECT_NUMBER@cloudbuild.gserviceaccount.com`
4. Add these roles one by one:
   - **Artifact Registry Writer** (`roles/artifactregistry.writer`)
   - **Cloud Run Admin** (`roles/run.admin`)
   - **Service Account User** (`roles/iam.serviceAccountUser`)
5. Click **SAVE**

### Via gcloud CLI

Replace `PROJECT_NUMBER` with your actual project number:

```bash
PROJECT_ID=gen-lang-client-0038785330
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# Grant Artifact Registry Writer
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Grant Cloud Run Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

# Grant Service Account User (needed to deploy to Cloud Run)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

---

## Step 4: Create Cloud Build Trigger

### Via Console

1. Go to **Cloud Build** > **Triggers**
2. Click **+ CREATE TRIGGER**
3. Fill in:
   - **Name**: `aiforgood-api-build`
   - **Description**: `Build and push API image to Artifact Registry`
   - **Event**: `Push to a branch`
   - **Source**:
     - **Repository**: Connect your GitHub repo if not already connected
     - **Branch**: `^main$` (or your preferred branch pattern)
   - **Configuration**:
     - **Type**: `Cloud Build configuration file (yaml or json)`
     - **Location**: `Repository`
     - **Cloud Build configuration file location**: `services/api/cloudbuild.yaml`
4. Click **CREATE**

### Via gcloud CLI

First connect your repository, then:

```bash
gcloud builds triggers create github \
  --name="aiforgood-api-build" \
  --repo-name="AI-For-Good-V1" \
  --repo-owner="HaanMC" \
  --branch-pattern="^main$" \
  --build-config="services/api/cloudbuild.yaml" \
  --project=gen-lang-client-0038785330
```

---

## Step 5: Run the Build (Manual or via Trigger)

### Manual Build via Console

1. Go to **Cloud Build** > **Triggers**
2. Find your trigger `aiforgood-api-build`
3. Click **RUN** > **Run trigger**

### Manual Build via CLI

From the repository root:

```bash
gcloud builds submit \
  --config=services/api/cloudbuild.yaml \
  --project=gen-lang-client-0038785330 \
  .
```

After the build completes, verify the image exists:

```bash
gcloud artifacts docker images list \
  asia-southeast1-docker.pkg.dev/gen-lang-client-0038785330/aiforgood \
  --project=gen-lang-client-0038785330
```

---

## Step 6: Deploy to Cloud Run

### Via Console

1. Go to **Cloud Run**
2. Click **+ CREATE SERVICE**
3. Select **Deploy one revision from an existing container image**
4. Click **SELECT** and browse to:
   ```
   asia-southeast1-docker.pkg.dev/gen-lang-client-0038785330/aiforgood/aiforgood-api:latest
   ```
5. Configure service:
   - **Service name**: `aiforgood`
   - **Region**: `asia-southeast1`
6. Under **Container, Networking, Security**:
   - **Container port**: `8080`
7. Under **Authentication**:
   - Select **Allow unauthenticated invocations**
8. Click **CREATE**

### Via gcloud CLI

```bash
gcloud run deploy aiforgood \
  --image=asia-southeast1-docker.pkg.dev/gen-lang-client-0038785330/aiforgood/aiforgood-api:latest \
  --region=asia-southeast1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --project=gen-lang-client-0038785330
```

---

## Step 7: Set Cloud Run Environment Variables

### Via Console

1. Go to **Cloud Run** > select `aiforgood` service
2. Click **EDIT & DEPLOY NEW REVISION**
3. Go to **Container** > **Variables & Secrets**
4. Add environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `ALLOWED_ORIGIN` | `https://aiforgood.nguyenhaan.id.vn` | Yes |
| `SESSION_SECRET` | `<your-secure-secret>` | Yes |
| `GOOGLE_CLOUD_PROJECT` | `gen-lang-client-0038785330` | Yes |
| `GCP_LOCATION` | `us-central1` | Yes (for Vertex AI) |
| `ADMIN_USERNAME` | `haanadmin` | Optional (has default) |
| `ADMIN_PASSWORD` | `<secure-password>` | Yes (change default!) |
| `DAILY_QUOTA` | `500` | Optional |
| `COOKIE_SECURE` | `true` | Optional (default: true) |

5. Click **DEPLOY**

### Via gcloud CLI

```bash
gcloud run services update aiforgood \
  --region=asia-southeast1 \
  --set-env-vars="ALLOWED_ORIGIN=https://aiforgood.nguyenhaan.id.vn" \
  --set-env-vars="SESSION_SECRET=your-secure-secret-here" \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=gen-lang-client-0038785330" \
  --set-env-vars="GCP_LOCATION=us-central1" \
  --set-env-vars="ADMIN_USERNAME=haanadmin" \
  --set-env-vars="ADMIN_PASSWORD=your-secure-password" \
  --set-env-vars="DAILY_QUOTA=500" \
  --project=gen-lang-client-0038785330
```

---

## Step 8: Grant Cloud Run Service Account Permissions

The Cloud Run service needs permissions to access Firestore and Vertex AI.

### Find Cloud Run Service Account

By default, Cloud Run uses the Compute Engine default service account:
`PROJECT_NUMBER-compute@developer.gserviceaccount.com`

### Via Console

1. Go to **IAM & Admin** > **IAM**
2. Find `PROJECT_NUMBER-compute@developer.gserviceaccount.com`
3. Click **Edit** (pencil icon)
4. Add roles:
   - **Cloud Datastore User** (`roles/datastore.user`) - for Firestore
   - **Vertex AI User** (`roles/aiplatform.user`) - for Gemini

### Via gcloud CLI

```bash
PROJECT_ID=gen-lang-client-0038785330
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# Firestore access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"

# Vertex AI access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

---

## Step 9: Verify Deployment

### Get Cloud Run URL

```bash
gcloud run services describe aiforgood \
  --region=asia-southeast1 \
  --format='value(status.url)' \
  --project=gen-lang-client-0038785330
```

### Test Endpoints

Replace `CLOUD_RUN_URL` with your actual Cloud Run service URL.

#### Health Check

```bash
curl https://CLOUD_RUN_URL/api/health
```

Expected response:
```json
{"status":"ok"}
```

#### CORS Preflight Test

```bash
curl -X OPTIONS https://CLOUD_RUN_URL/api/auth/login \
  -H "Origin: https://aiforgood.nguyenhaan.id.vn" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i
```

Expected headers in response:
```
Access-Control-Allow-Origin: https://aiforgood.nguyenhaan.id.vn
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Credentials: true
```

#### Login Endpoint Test

```bash
curl -X POST https://CLOUD_RUN_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://aiforgood.nguyenhaan.id.vn" \
  -d '{"username":"test","password":"test"}' \
  -i
```

---

## Automated Deployment (Optional)

To automatically deploy to Cloud Run after each build, add a deploy step to `cloudbuild.yaml`:

```yaml
# Add after the push steps in services/api/cloudbuild.yaml
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'aiforgood'
      - '--image'
      - 'asia-southeast1-docker.pkg.dev/${PROJECT_ID}/aiforgood/aiforgood-api:${SHORT_SHA}'
      - '--region'
      - 'asia-southeast1'
      - '--platform'
      - 'managed'
```

---

## Troubleshooting

### Build Fails: Permission Denied to Artifact Registry

Ensure Cloud Build service account has `roles/artifactregistry.writer`:

```bash
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:cloudbuild.gserviceaccount.com"
```

### Cloud Run: CORS Errors

1. Verify `ALLOWED_ORIGIN` is set correctly
2. Check the API is returning proper CORS headers
3. Ensure the frontend URL matches exactly (including `https://`)

### Cloud Run: Firestore Access Denied

Ensure the Cloud Run service account has `roles/datastore.user`.

### Build Context Error

The cloudbuild.yaml expects to be run from the repository root. The build context is `services/api`, and the Dockerfile path is `services/api/Dockerfile`.

---

## Image URL Format

The final image URL format is:
```
asia-southeast1-docker.pkg.dev/gen-lang-client-0038785330/aiforgood/aiforgood-api:TAG
```

Where `TAG` is either:
- `SHORT_SHA` - Git commit short hash (e.g., `a1b2c3d`)
- `latest` - Always points to the most recent build
