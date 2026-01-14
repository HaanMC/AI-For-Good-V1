# Cloudflare Pages/Workers deploy

## Build & deploy commands

Use these settings in Cloudflare build configuration:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (or `npm run deploy:cf`)

## Notes

- `wrangler.jsonc` is configured to upload `./dist` and enable SPA routing via `assets.not_found_handling = single-page-application`.
- `wrangler deploy` uploads the latest build and deploys it to the global network.
