# Cloudflare Worker Deploy

## Build & deploy commands

Build the web app first so the Worker can serve static assets:

```bash
cd apps/web
npm ci
npm run build
```

Deploy the Worker (from repo root):

```bash
cd infra/worker
wrangler deploy
```

## Notes

- `infra/worker/wrangler.jsonc` serves `apps/web/dist` with SPA fallback.
- `/generate` and `/debug` are handled by the Worker (not the SPA fallback).
