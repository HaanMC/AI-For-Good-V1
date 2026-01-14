# Upstream Gemini Proxy (Cloud Run)

Simple Express proxy for Gemini `generateContent`.

## Endpoints

- `POST /generate`
  - Requires header `X-Proxy-Token` matching `PROXY_TOKEN`.
  - Expects JSON body with:
    - `model` (e.g. `models/gemini-1.5-flash`)
    - `contents` (Gemini REST format)
    - Optional: `generationConfig`, `safetySettings`, `systemInstruction`.
  - Success response: `{ ok: true, text, raw }`
  - Error response: `{ ok: false, status, upstream }`
- `GET /health` → `{ ok: true }`

## Deploy to Cloud Run (asia-southeast1)

```bash
# From repository root
cd upstream-proxy

# Build & deploy
PROJECT_ID="your-gcp-project-id"
SERVICE_NAME="gemini-upstream-proxy"
REGION="asia-southeast1"

# Set secrets (recommended with Secret Manager in production)
PROXY_TOKEN="your-proxy-token"
GEMINI_API_KEY="your-gemini-api-key"

gcloud run deploy "$SERVICE_NAME" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --source . \
  --set-env-vars "PROXY_TOKEN=$PROXY_TOKEN,GEMINI_API_KEY=$GEMINI_API_KEY" \
  --allow-unauthenticated
```

After deploy, verify:

```bash
SERVICE_URL="https://<your-service-url>"

curl -s "$SERVICE_URL/health"

curl -s -X POST "$SERVICE_URL/generate" \
  -H "Content-Type: application/json" \
  -H "X-Proxy-Token: $PROXY_TOKEN" \
  -d '{
    "model": "models/gemini-1.5-flash",
    "contents": [
      {
        "role": "user",
        "parts": [{ "text": "Xin chào" }]
      }
    ]
  }'
```
