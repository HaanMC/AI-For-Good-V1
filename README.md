# Grade 10 Literature AI Assistant (AI For Good)

An AI-powered learning assistant for Grade 10 Vietnamese Literature. The app helps students
practice reading comprehension, writing, dictionary lookups, roleplay, and exam preparation with
SGK-aligned knowledge.

## Architecture

```
Browser (apps/web)
   -> Cloudflare Worker (infra/worker)
       -> Render Upstream (infra/upstream-render)
           -> Gemini API
```

- **Frontend**: Vite + React web app.
- **Worker**: Cloudflare Worker that serves static assets and proxies `/generate` + `/debug`.
- **Upstream**: Render service that calls Gemini with server-side secrets.

## Folder map

```
apps/web/                # Vite React application
infra/worker/            # Cloudflare Worker proxy
infra/upstream-render/   # Render upstream proxy
docs/                    # Deployment + architecture docs
```

See `docs/README-ARCHITECTURE.md` for detailed migration notes.

## Local development

### Web app

```bash
cd apps/web
npm i
npm run dev
```

### Cloudflare Worker

```bash
cd infra/worker
wrangler dev
```

> Build the web app first so `apps/web/dist` exists if you want the Worker to serve assets.

### Render upstream

```bash
cd infra/upstream-render
npm i
npm start
```

## Deployments

### Render upstream

1. Create a Render **Web Service** with **Root Directory** `infra/upstream-render`.
2. Build: `npm ci`
3. Start: `node src/server.js`
4. Set env vars (see table below).

### Cloudflare Worker

1. Set Worker vars (see table below).
2. Run `wrangler deploy` from `infra/worker`.

### Optional: GitHub Pages (web app)

The GitHub Actions workflow builds the web app from `apps/web` and publishes `apps/web/dist`.

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | Cloudflare Worker | CORS allowlist for `/generate`. |
| `UPSTREAM_URL` | Cloudflare Worker | Full upstream URL (e.g. `https://<service>.onrender.com/generate`). |
| `UPSTREAM_TOKEN` | Cloudflare Worker | Proxy token shared with Render upstream. |
| `GEMINI_API_KEY` | Render upstream | Gemini API key (server-side only). |
| `PROXY_TOKEN` | Render upstream | Token validated by the upstream. |

## SGK knowledge (markdown + manifest)

SGK data lives in `apps/web/public/sgk/`.

To add books:

1. Add the new markdown files to `apps/web/public/sgk/`.
2. Update `apps/web/public/sgk/manifest.json` with the new files.
3. Rebuild the web app so the updated manifest is bundled.

## Docs

- `docs/DEPLOY_CLOUDFLARE.md`
- `docs/UPSTREAM_DEPLOY.md`
- `docs/GRADE10-LITERATURE-GUIDE.md`
- `docs/README-ARCHITECTURE.md`
