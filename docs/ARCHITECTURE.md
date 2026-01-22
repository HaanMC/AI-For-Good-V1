# Architecture

## Overview

AI For Good V1 uses a static frontend deployed on GitHub Pages and a secure Cloud Run API for all server-side logic and LLM calls.

```
Browser (GitHub Pages)
  -> Cloud Run API (services/api)
      -> Firestore
      -> Firebase Auth (custom claims)
      -> Vertex AI Gemini
```

## Frontend

- **Framework**: Vite + React
- **Routing**: BrowserRouter with SPA fallback (404 redirect + route restoration)
- **Auth**: Firebase Auth (Google sign-in)
- **RBAC**: Admin-only routes at `/adminpanel` based on custom claims

## Backend (Cloud Run)

- **Runtime**: Node.js + TypeScript + Express
- **Auth**: Firebase Admin SDK verifies ID tokens and custom claims
- **LLM**: Vertex AI Gemini via service account (no API keys on frontend)
- **Observability**: requestId, structured logs, and latency tracking

## Firestore data model

```
users/{uid}
  role, displayName, email, createdAt

classes/{classId}
  name, grade, createdAt, createdByUid

classCodes/{code}
  classId, createdAt, expiresAt

classMembers/{classId}_{uid}
  classId, uid, joinedAt

assignments/{assignmentId}
  classId, type, rubricId?, dueAt, createdByUid, createdAt

submissions/{submissionId}
  assignmentId, uid, content, score?, feedback?, createdAt

usageLogs/{logId}
  uid, feature, status, latencyMs, createdAt, requestId

proctoringEvents/{eventId}
  uid, examSessionId, type, detail, createdAt

safetyFlags/{flagId}
  uid, feature, reason, createdAt, requestId
```

## Routing map

- `/` dashboard
- `/login`
- `/chat`
- `/roleplay`
- `/exam`
- `/exam/mock`
- `/writing`
- `/dictionary`
- `/flashcards`
- `/mindmap`
- `/study-plan`
- `/settings`
- `/adminpanel/*` (admin-only)

