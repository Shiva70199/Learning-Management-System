# Production deployment — complete setup

Your LMS is a **monorepo**:

| Part | Tech | Where it usually runs |
|------|------|------------------------|
| **Frontend** | Next.js 14 | **Vercel** (or any Node host) |
| **Backend** | Express + Prisma | **Railway**, **Fly.io**, **Render**, **Docker VPS**, etc. |
| **Database** | MySQL 8 | Same host as API (Railway plugin), or **managed MySQL** |

You need **two public URLs** in the end:

1. `https://your-frontend.vercel.app` — set `CLIENT_ORIGIN` on the API to this (comma-separate preview URLs if needed).  
2. `https://your-api....` — set `NEXT_PUBLIC_API_BASE_URL` on Vercel to this (no trailing slash).

If the frontend and API are on **different domains**, set **`COOKIE_CROSS_SITE=true`** on the API so refresh cookies work.

---

## Recommended: Vercel + Railway (simplest “final product”)

Railway can host **MySQL + Node API** in one project with little config.

### 1) Create Railway project

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → select **Learning-Management-System**.
2. Add **MySQL**: **New** → **Database** → **MySQL**. Wait until it’s ready.
3. Add **API service**: **New** → **GitHub Repo** → same repo → set **Root Directory** to **`backend`**.

### 2) Connect MySQL to the API

1. Open the **MySQL** service → **Variables** → copy **`MYSQL_URL`** or **`DATABASE_URL`** if Railway provides a Prisma-style URL.
2. If you only get discrete vars, build:  
   `mysql://USER:PASSWORD@HOST:PORT/DATABASE`  
   (use the values from the MySQL service; enable **SSL** if Railway shows a `?sslmode=` or public URL requirement).

3. On the **backend** service → **Variables** → add:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Paste from MySQL (must be reachable from the API service) |
| `NODE_ENV` | `production` |
| `JWT_ACCESS_SECRET` | 32+ random characters |
| `JWT_REFRESH_SECRET` | 32+ different random characters |
| `CLIENT_ORIGIN` | `https://your-app.vercel.app` (comma-separated list for preview URLs) |
| `COOKIE_CROSS_SITE` | `true` |
| `HUGGINGFACE_API_KEY` | optional |

4. **Deploy** settings for the backend service:
   - **Build command**: `npm install && npx prisma generate && npm run build`
   - **Start command**: `npx prisma migrate deploy && node dist/server.js`

5. Railway assigns a URL like `https://lms-backend-production.up.railway.app`. Open **`/api/health`**.

### 3) Seed production data (once)

From your laptop (with `DATABASE_URL` pointing at Railway MySQL), or Railway **Shell** if available:

```bash
cd backend
npx prisma db seed
```

Only if the database is **empty** (or you accept duplicate errors).

### 4) Deploy frontend on Vercel

1. **Import** the same GitHub repo.  
2. **Root Directory**: **`frontend`**.  
3. **Environment variable**:  
   `NEXT_PUBLIC_API_BASE_URL` = `https://your-api.up.railway.app`  
4. Deploy.

---

## Option B: Vercel + Fly.io

1. Create a **MySQL** database elsewhere (Railway MySQL only, PlanetScale, Aiven, etc.) and note `DATABASE_URL`.
2. Install [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/).
3. In `backend/`: `fly launch` — Dockerfile path `./Dockerfile` or let Fly use Nixpacks with root `backend`.
4. `fly secrets set DATABASE_URL=... JWT_ACCESS_SECRET=... JWT_REFRESH_SECRET=... CLIENT_ORIGIN=... COOKIE_CROSS_SITE=true`
5. Ensure `fly.toml` runs migrate + start (or use Dockerfile `CMD` as in this repo).
6. Point Vercel `NEXT_PUBLIC_API_BASE_URL` at your `*.fly.dev` URL.

---

## Option C: Render (if it fails, check this)

Common issues:

| Problem | Fix |
|---------|-----|
| Build fails | Root directory must be **`backend`**. Build: `npm install && npx prisma generate && npm run build` |
| Start crashes | Start: `npx prisma migrate deploy && node dist/server.js` |
| DB connection | Use **MySQL**, not Render Postgres, unless you change Prisma to `postgresql` |
| CORS / login | `CLIENT_ORIGIN` must match the **exact** browser origin; `COOKIE_CROSS_SITE=true` if frontend ≠ API domain |
| Cold start | Free tier sleeps; first request can take ~1 minute |

If Render stays painful, use **Railway** or **Docker on a VPS** (below).

---

## Option D: One VPS + Docker Compose (you control everything)

Good for Hetzner, DigitalOcean, Linode, AWS EC2, etc.

### 1) Server prerequisites

- Ubuntu 22.04+ (or similar)  
- Docker + Docker Compose plugin installed  
- Domain + DNS **A record** pointing to the server (optional but recommended)

### 2) Configure env

```bash
cp env.docker.example .env.docker
nano .env.docker   # set MYSQL_ROOT_PASSWORD, JWT_*, CLIENT_ORIGIN, COOKIE_CROSS_SITE
```

For production with Vercel frontend: `CLIENT_ORIGIN=https://your-app.vercel.app`, `COOKIE_CROSS_SITE=true`.

### 3) Start stack

```bash
docker compose --env-file .env.docker up -d --build
```

API: `http://SERVER_IP:4000` — put **Caddy** or **Nginx** in front for HTTPS (see below).

### 4) Seed from your laptop

MySQL is exposed on port `3306` by default (or change `MYSQL_PORT`). From project root:

```bash
cd backend
set DATABASE_URL=mysql://root:YOUR_PASSWORD@SERVER_IP:3306/lms
npx prisma db seed
```

(Use `export` on Linux/macOS.)

### 5) HTTPS reverse proxy (Caddy example)

Install Caddy, create `/etc/caddy/Caddyfile`:

```text
api.yourdomain.com {
    reverse_proxy localhost:4000
}
```

Reload Caddy. Set Vercel:

`NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com`

And API `CLIENT_ORIGIN` to your Vercel URL.

---

## Environment variable reference (API)

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | yes | MySQL connection string |
| `JWT_ACCESS_SECRET` | yes | ≥32 chars |
| `JWT_REFRESH_SECRET` | yes | ≥32 chars, different from access |
| `CLIENT_ORIGIN` | yes | Comma-separated allowed browser origins (CORS + cookie logic) |
| `NODE_ENV` | yes for prod | `production` |
| `COOKIE_CROSS_SITE` | for split domains | `true` when UI is Vercel and API is another host |
| `PORT` | optional | Defaults `4000`; PaaS usually injects `PORT` |
| `HUGGINGFACE_API_KEY` | optional | AI sentiment tab |

Frontend (Vercel):

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | yes — public API URL, no trailing `/` |

---

## Checklist before calling it “done”

- [ ] `GET https://your-api/.../api/health` returns `ok` and DB connected  
- [ ] Register + login from the **real** frontend URL works  
- [ ] Catalog and course pages load  
- [ ] `CLIENT_ORIGIN` includes every URL you use (production + previews)  
- [ ] `COOKIE_CROSS_SITE=true` if frontend and API are different sites  
- [ ] Secrets not committed (`.env`, `.env.docker` gitignored)

---

## Files in this repo that help

| File | Purpose |
|------|---------|
| `render.yaml` | Render Blueprint for the API only |
| `docker-compose.yml` | MySQL + API on one machine |
| `backend/Dockerfile` | Production API image |
| `env.docker.example` | Template for Compose env |

For day-to-day local dev, keep using `README.md` in the repo root.
