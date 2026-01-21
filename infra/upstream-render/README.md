# Render Upstream Proxy (Gemini)

This service runs on Render and forwards `/generate` requests to the Gemini REST API while keeping the API key server-side.

## Endpoints

- `GET /health` → `{ ok: true }`
- `POST /generate` → forwards Gemini `generateContent`

## Render Deploy Steps

1. **Create a new Web Service** in Render from this GitHub repo.
2. **Root Directory**: `infra/upstream-render`
3. **Build Command**: `npm ci`
4. **Start Command**: `node src/server.js`
5. **Environment Variables** (Render dashboard → Environment):
   - `GEMINI_API_KEY` (secret)
   - `PROXY_TOKEN` (secret)

After deploy, copy the Render URL, e.g.:

```
https://<service>.onrender.com
```

## Cloudflare Worker Variables

Set these in the Cloudflare Worker dashboard:

- `UPSTREAM_URL` = `https://<service>.onrender.com/generate`
- `UPSTREAM_TOKEN` = same value as Render `PROXY_TOKEN`
- `ALLOWED_ORIGINS` = `https://aiforgood.nguyenhaan.id.vn,http://localhost:5173`
