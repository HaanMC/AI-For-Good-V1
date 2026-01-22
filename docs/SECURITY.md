# Security

## Authentication

- All API routes under `/api/*` require a Firebase ID token.
- Tokens are validated server-side with the Firebase Admin SDK.

## Authorization (RBAC)

- Custom claims define roles (`role=admin` or `role=student`).
- `/api/admin/*` and `/adminpanel/*` require `role=admin`.

## No frontend secrets

- The web app never includes API keys for LLM usage.
- LLM calls are strictly server-side via Cloud Run.

## Abuse protection

- Rate limit per UID/IP with short window.
- Daily quota enforcement using `DAILY_QUOTA` environment variable.

## Observability

- Each request has a `requestId` logged and returned in `x-request-id`.
- Usage logs stored in Firestore for auditing.

