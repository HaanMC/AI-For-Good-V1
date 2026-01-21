# Cloudflare Worker Proxy

This Worker proxies `/generate` requests to the Render upstream and serves the built web app
as a static asset bundle.

## Environment variables

| Variable | Description |
| --- | --- |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins. |
| `UPSTREAM_URL` | Full URL to the Render upstream `/generate` endpoint. |
| `UPSTREAM_TOKEN` | Shared token passed as `X-Proxy-Token` to the upstream. |

## Local development

```bash
wrangler dev
```

Ensure the web app has been built so `apps/web/dist` exists.

## Deploy

```bash
wrangler deploy
```
