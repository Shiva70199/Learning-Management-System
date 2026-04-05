# LMS monorepo

## Prerequisites

- Node.js 20+
- MySQL 8+

## Backend (`backend/`)

1. Copy `backend/.env.example` to `backend/.env` and set a real `DATABASE_URL` plus long random `JWT_*_SECRET` values (32+ characters each).
2. Set `CLIENT_ORIGIN` to every exact browser origin you use, comma-separated (e.g. `http://localhost:3000,http://127.0.0.1:3000`). A mismatch here breaks registration/login from the browser.
3. `cd backend`
4. `npm install`
5. `npx prisma migrate dev --name init` (or `npx prisma db push` for prototyping)
6. `npx prisma db seed`
7. `npm run dev` — API on `http://localhost:4000`

## Frontend (`frontend/`)

1. Copy `frontend/.env.local.example` to `frontend/.env.local`. Set **`NEXT_PUBLIC_API_BASE_URL`** (or `NEXT_PUBLIC_API_URL`) to your API base, e.g. `http://localhost:4000`. Use the **same host** as in the address bar (`localhost` vs `127.0.0.1`) so cookies and CORS line up.
2. `cd frontend`
3. `npm install`
4. `npm run dev` — App on `http://localhost:3000`

## API overview

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | No | Liveness + DB ping |
| POST | `/api/auth/register` | No | Register; sets refresh cookie |
| POST | `/api/auth/login` | No | Login; sets refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh; new access token |
| POST | `/api/auth/logout` | Bearer | Revoke current refresh session |
| GET | `/api/users/me` | Bearer | Profile |
| GET | `/api/subjects` | Bearer | Catalog |
| GET | `/api/subjects/:id/tree` | Bearer | Sections/videos + `locked` + completion |
| POST | `/api/enrollments` | Bearer | Body `{ subjectId }` |
| GET | `/api/enrollments/me` | Bearer | Enrolled subject ids |
| GET | `/api/videos/:id` | Bearer | Lesson meta + prev/next + `locked` |
| GET | `/api/progress/videos/:id` | Bearer | Resume + completion |
| POST | `/api/progress/videos/:id` | Bearer | Upsert progress (blocked if locked) |
| POST | `/api/ai/sentiment` | Bearer | Hugging Face sentiment (needs `HUGGINGFACE_API_KEY`) |

## Notes

- Access token: `Authorization: Bearer <token>` (short-lived, in-memory on the client).
- Refresh token: HTTP-only cookie `refresh_token` (rotated on `/refresh`).
- Lesson order: all videos in section order `order`, then by video `order` within each section; the first video is always unlocked.
- **AI sentiment** uses Hugging Face **router** inference: `https://router.huggingface.co/hf-inference/models/distilbert-base-uncased-finetuned-sst-2-english` (same `{ inputs: "text" }` body). Use a token with inference access.
- **Demo YouTube links** in `prisma/seed.ts` match lesson titles. To refresh existing DB data, reset or update rows, or run `npx prisma migrate reset` / re-seed (destructive) in development.
