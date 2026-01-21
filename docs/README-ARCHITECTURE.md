# Architecture & Migration Notes

## High-level architecture

- **Web app**: Vite React application that runs in the browser.
- **Cloudflare Worker**: Proxy that serves the web build and forwards `/generate` requests.
- **Render upstream**: Server that calls Gemini with server-side secrets.

```
Browser -> Cloudflare Worker (/generate) -> Render upstream -> Gemini
```

## Migration notes (what moved where)

| Old location | New location |
| --- | --- |
| Root Vite files | `apps/web/` |
| Root `index.tsx` | `apps/web/src/main.tsx` |
| Root `index.css` | `apps/web/src/styles/index.css` |
| Root `App.tsx` | `apps/web/src/app/App.tsx` |
| `services/` | `apps/web/src/shared/services/` |
| `utils/` | `apps/web/src/shared/utils/` |
| `data/` | `apps/web/src/shared/data/` |
| `types.ts` | `apps/web/src/shared/types/` |
| `constants.ts` | `apps/web/src/shared/constants/` |
| `grade10-literature-knowledge.ts` | `apps/web/src/shared/knowledge/` |
| `worker/` + `wrangler.jsonc` | `infra/worker/` |
| `render-upstream/` | `infra/upstream-render/` |
| Root docs | `docs/` |

## Feature/module layout (web)

- `apps/web/src/features/*` holds feature UI and feature-specific helpers.
- `apps/web/src/shared/*` holds shared data, services, utilities, and UI helpers.
- `apps/web/src/sgk` and `apps/web/src/ai` keep SGK logic.
