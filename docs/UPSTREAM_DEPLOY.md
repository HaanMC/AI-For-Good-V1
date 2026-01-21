# Render Upstream Deploy

The Render upstream service is the only component that talks to Gemini directly. It keeps
`GEMINI_API_KEY` server-side and validates a shared `PROXY_TOKEN` from the Worker.

## Deploy on Render

1. Create a new **Web Service** in Render from this repo.
2. Set **Root Directory** to `infra/upstream-render`.
3. **Build Command**: `npm ci`
4. **Start Command**: `node src/server.js`
5. **Environment Variables**:
   - `GEMINI_API_KEY` (secret)
   - `PROXY_TOKEN` (secret)

## Configure the Worker

Set these variables in the Cloudflare Worker:

- `UPSTREAM_URL` = `https://<service>.onrender.com/generate`
- `UPSTREAM_TOKEN` = same value as Render `PROXY_TOKEN`
- `ALLOWED_ORIGINS` = comma-separated list of frontend origins

## Test

```bash
curl -X POST "https://<your-worker-domain>/generate" \
  -H "Content-Type: application/json" \
  -H "Origin: https://aiforgood.nguyenhaan.id.vn" \
  -d '{
    "model": "models/gemini-2.0-flash",
    "contents": [{"role": "user", "parts": [{"text": "hello"}]}]
  }'
```

Check worker status:

```bash
curl "https://<your-worker-domain>/debug"
```
