# Upstream Proxy Deploy (Cloud Run)

## 1) Deploy Cloud Run (Singapore or US)
- Recommended regions:
  - `asia-southeast1` (Singapore)
  - `us-central1`

### Example build + deploy
```bash
cd upstream-proxy

gcloud run deploy aiforgood-gemini-proxy \
  --region asia-southeast1 \
  --source . \
  --allow-unauthenticated
```

## 2) Set the GEMINI_API_KEY secret
```bash
gcloud secrets create GEMINI_API_KEY --data-file=-
# paste your Gemini API key then CTRL+D

gcloud run services update aiforgood-gemini-proxy \
  --region asia-southeast1 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

(Optional) Add a shared token so only the Worker can call the proxy:
```bash
gcloud secrets create PROXY_TOKEN --data-file=-
# paste your proxy token then CTRL+D

gcloud run services update aiforgood-gemini-proxy \
  --region asia-southeast1 \
  --set-secrets PROXY_TOKEN=PROXY_TOKEN:latest
```

## 3) Get the Cloud Run URL
```bash
gcloud run services describe aiforgood-gemini-proxy \
  --region asia-southeast1 \
  --format 'value(status.url)'
```

## 4) Configure the Worker
Set Worker vars:
- `PROXY_UPSTREAM_URL=<cloudrun-url>/generate`
- `USE_UPSTREAM_PROXY=true`
- `PROXY_TOKEN=<same-token>` (only if you configured the proxy token)

## 5) Test
```bash
curl -X POST "https://<your-worker-domain>/generate" \
  -H "Content-Type: application/json" \
  -H "Origin: https://aiforgood.nguyenhaan.id.vn" \
  -d '{
    "model": "models/gemini-1.5-flash",
    "contents": [{"role": "user", "parts": [{"text": "hello"}]}]
  }'
```

You can also check worker location:
```bash
curl "https://<your-worker-domain>/debug"
```
