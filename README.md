# LMS monorepo

**Production / deploy everything (Vercel + Railway + Docker + Render troubleshooting):** see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

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

## Deploy (Vercel + API host)

**Step-by-step for Railway, Fly.io, Docker VPS, Render fixes, and env tables:** **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

Vercel runs **Next.js** well; your **Express API** should run as a **separate service** (Railway, Render, Fly.io, etc.). The `experimentalServices` JSON in some dashboards tries to attach a second app—**you do not need that** if you deploy the API elsewhere.

### 1) Deploy the frontend on Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com) → **Add New Project** → import the repo.
3. **Root Directory**: set to **`frontend`** (important for this monorepo).
4. Framework: **Next.js** (auto-detected).
5. **Environment variables** (Production + Preview if you want):
   - `NEXT_PUBLIC_API_BASE_URL` = your public API URL, e.g. `https://your-api.up.railway.app` (no trailing slash).
6. Deploy.

### 2) Deploy the backend (example: Railway)

1. Create a **MySQL** database (Railway plugin, PlanetScale, etc.) and copy `DATABASE_URL`.
2. New **Web service** from the same GitHub repo, **root directory** = **`backend`**.
3. **Start command**: `npx prisma migrate deploy && node dist/server.js` (or use `tsx` / build step—see below).
4. **Build** (example): `npm install && npx prisma generate && npm run build`
5. **Environment variables** on the API:
   - `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (32+ chars each)
   - `NODE_ENV=production`
   - `CLIENT_ORIGIN` = your Vercel URL(s), e.g. `https://your-app.vercel.app` (comma-separate preview URLs if needed)
   - `COOKIE_CROSS_SITE=true` (required when the site is `*.vercel.app` and the API is another domain)
   - Optional: `HUGGINGFACE_API_KEY`
6. Ensure the API **build** outputs `dist/` (`npm run build` in `backend`) and the process runs `node dist/server.js`, or adjust the host’s start command.

### 2b) Deploy the backend on [Render](https://render.com)

Render runs this API as a **Web Service** (Node). This app uses **MySQL**; Render’s free **PostgreSQL** will not work without changing Prisma. Use an external MySQL URL (e.g. [PlanetScale](https://planetscale.com), [Railway MySQL](https://railway.app), [Aiven](https://aiven.io), etc.) and set `DATABASE_URL`.

#### Option A — Blueprint (`render.yaml`)

1. Push the repo (includes `render.yaml` at the **repository root**).
2. Render Dashboard → **New** → **Blueprint** → connect the repo → apply.
3. When prompted, set **secret** env vars: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_ORIGIN` (your frontend URL(s), comma-separated).
4. Optional: `HUGGINGFACE_API_KEY`. `COOKIE_CROSS_SITE=true` is already set for Vercel + separate API domain.
5. After deploy, copy the service URL (e.g. `https://lms-backend.onrender.com`) into Vercel’s `NEXT_PUBLIC_API_BASE_URL`.

#### Option B — Manual Web Service

1. **New** → **Web Service** → connect GitHub → select this repo.
2. **Root Directory**: `backend`
3. **Runtime**: Node
4. **Build Command**:  
   `npm install && npx prisma generate && npm run build`
5. **Start Command**:  
   `npx prisma migrate deploy && node dist/server.js`
6. **Instance type**: Free (spins down after idle; first request may be slow).
7. **Environment** → add variables (same as `backend/.env.example` + production notes below).

| Variable | Example / notes |
|----------|------------------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | MySQL connection string (must allow SSL if provider requires it; add `?sslaccept=strict` if needed) |
| `JWT_ACCESS_SECRET` | 32+ random characters |
| `JWT_REFRESH_SECRET` | 32+ different random characters |
| `CLIENT_ORIGIN` | `https://your-app.vercel.app` (comma-separate preview URLs if needed) |
| `COOKIE_CROSS_SITE` | `true` if frontend is on another domain (e.g. Vercel) |
| `HUGGINGFACE_API_KEY` | Optional, for AI tab |

8. **Health check path** (optional): `/api/health`

Render injects **`PORT`** automatically; the app already reads `process.env.PORT`.

#### After first deploy

- Open `https://<your-service>.onrender.com/api/health` — you should see JSON with `"status":"ok"`.
- Seed production data once (SSH/shell on paid plans, or run seed locally pointed at prod DB—be careful):  
  `npx prisma db seed` only if the DB is empty.

### 3) Why not two “services” inside one Vercel project?

Express needs a **long-running Node server** with WebSockets/Prisma/MySQL patterns that don’t map 1:1 to Vercel’s default serverless model without a larger refactor. Running the API on Railway/Render avoids that and matches this repo as written.

### 4) After adding more seed courses locally

The catalog reads from MySQL. To get **six** demo subjects from `prisma/seed.ts` on a **fresh** database:

```bash
cd backend
npx prisma migrate reset   # wipes data; confirm
# or: npx prisma db push && npx prisma db seed on empty DB
```

On **production**, run `npx prisma db seed` only if your DB is empty, or add subjects via Prisma Studio / SQL.

## Notes

- Access token: `Authorization: Bearer <token>` (short-lived, in-memory on the client).
- Refresh token: HTTP-only cookie `refresh_token` (rotated on `/refresh`).
- Lesson order: all videos in section order `order`, then by video `order` within each section; the first video is always unlocked.
- **AI sentiment** uses Hugging Face **router** inference: `https://router.huggingface.co/hf-inference/models/distilbert-base-uncased-finetuned-sst-2-english` (same `{ inputs: "text" }` body). Use a token with inference access.
- **Demo YouTube links** in `prisma/seed.ts` match lesson titles. To refresh existing DB data, reset or update rows, or run `npx prisma migrate reset` / re-seed (destructive) in development.
