# Minerals Web Store

React storefront + Express/Prisma API + PostgreSQL.

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop **or Podman** (only for full stack with real API + PostgreSQL)

## Demo on a PC without Docker / DB

Use **mock mode** — frontend only, in-browser data (catalog, auth, cart, wishlist, admin). No server or Postgres needed.

```bash
npm install
npm run dev:mock
```

Open http://localhost:5174

| Field    | Value                   |
|----------|-------------------------|
| Phone    | `0501112233` (UI shows **+38**) |
| Email    | `admin@luxstones.local` |
| Password | `admin123`              |

You can browse the catalog, register/login (**phone** or **Google**), use cart & wishlist, view order history / favourites / personal discounts on the profile, and admin CRUD. Changes persist in `localStorage` for the session (clear site data or bump mock DB version to reset). In mock mode, Google sign-in creates a demo Google user instantly.

## Full stack quick start

### Option A — Docker

```bash
# 1. Start PostgreSQL (port 55432)
docker compose up -d
```

Then continue from **Install & run** below.

### Option B — Podman (no Docker)

`podman compose` may be missing on Windows. Start Postgres with a plain `podman run` (same ports/creds as `docker-compose.yml`):

```powershell
# 0. Ensure Podman machine is running (Windows)
podman machine start

# 1. Start PostgreSQL (port 55432) — first time only; later use `podman start minerals-postgres`
podman run -d `
  --name minerals-postgres `
  --restart unless-stopped `
  -p 55432:5432 `
  -e POSTGRES_USER=minerals `
  -e POSTGRES_PASSWORD=minerals `
  -e POSTGRES_DB=minerals `
  -v minerals_pg_data:/var/lib/postgresql/data `
  docker.io/library/postgres:16-alpine

# Wait until ready
podman exec minerals-postgres pg_isready -U minerals -d minerals
```

Useful Podman commands:

| Command | Description |
|---------|-------------|
| `podman start minerals-postgres` | Start existing container |
| `podman stop minerals-postgres` | Stop Postgres |
| `podman rm -f minerals-postgres` | Remove container (volume keeps data) |
| `podman volume rm minerals_pg_data` | Delete DB data volume |

Then continue from **Install & run** below.

### Install & run (Docker or Podman)

```bash
# 2. Env files (once)
copy .env.example .env
copy server\.env.example server\.env

# 3. Install API deps, push schema, seed catalog
cd server
npm install
npx prisma db push
npx prisma db seed
cd ..

# 4. Install frontend deps
npm install

# 5. Run API (terminal 1)
npm run dev:server

# 6. Run frontend (terminal 2)
npm run dev
```

> **PowerShell tip:** if `npm` fails with *running scripts is disabled*, use `npm.cmd` instead (e.g. `npm.cmd run dev`).

- Frontend: http://localhost:5174  
- API: http://localhost:3001  
- API health: http://localhost:3001/api/health  

## Default admin account

**Real API / Postgres:** the operator is created (or promoted) automatically on every API start. Override via `ADMIN_*` in `server/.env`.

| Field    | Value                   |
|----------|-------------------------|
| Phone    | `0668344322` (UI shows **+38**) |
| Email    | `admin@luxstones.local` |
| Password | `hMJ5Pz&B6*%*Efez33`    |

Login accepts **phone only** (or Google). Open http://localhost:5174/login, sign in, then go to **Profile → Admin** or http://localhost:5174/admin.

**Mock mode** uses a separate demo admin: phone `0501112233`, password `admin123`.

In mock mode you can also try a demo customer with orders and a personal discount:

| Field    | Value            |
|----------|------------------|
| Phone    | `0671234567` (UI shows **+38**) |
| Password | `demo1234`       |

## Environment

### Root `.env`

```env
VITE_API_URL=http://localhost:3001
```

Copy from `.env.example` if needed.

### `server/.env`

```env
PORT=3001
CLIENT_URL=http://localhost:5174
DATABASE_URL=postgresql://minerals:minerals@127.0.0.1:55432/minerals?schema=public
JWT_SECRET=dev-change-me-minerals-jwt-secret
JWT_EXPIRES_IN=7d
API_URL=http://localhost:3001

# Bootstrap admin (created/updated on every API start; defaults work without these)
# ADMIN_PHONE=0668344322
# ADMIN_PASSWORD=hMJ5Pz&B6*%*Efez33

# Optional — Google OAuth (account chooser)
# Redirect URI: http://localhost:3001/api/auth/google/callback
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional — Apple Sign In
APPLE_CLIENT_ID=
```

Copy from `server/.env.example`.

> **Note:** Postgres is mapped to host port **55432** so it does not clash with a local Postgres on 5432/5433.

## Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev:mock` | Frontend only with in-browser mock API (no Docker/DB) |
| `npm run db:up` | Start Docker Postgres (`docker compose up -d`) |
| `npm run db:down` | Stop Docker Postgres |
| *(Podman)* `podman start/stop minerals-postgres` | Start/stop Postgres without Docker |
| `npm run db:migrate` | `prisma db push` |
| `npm run db:seed` | Reseed catalog (admin is bootstrapped on API start) |
| `npm run db:clear-seed` | Remove mock products and leftover demo reviews (keeps the 5 categories, users, admin) |
| `npm run dev:server` | Start Express API |
| `npm run dev` | Start Vite frontend (needs API running) |

## Admin features

Signed-in admins can:

- Create / edit / delete products
- Change product stock (quantity)
- Create new subcategories under existing categories
- Upload / paste multiple product images and import a product video
- Assign personal discounts (%) to selected customers (Profile → Admin → Customers). Personal % applies to everything except «Низки»; strands use the volume discount system separately.
- Cart/checkout automatically apply volume discounts (1000→2% … up to 10%) and free delivery from 3000 UAH

On the product form: click the media area and press **Ctrl+V** (or **⌘V**) to paste images, or use **Add photos** / **Add video**.

Logged-in customers see on **Profile**: order history, favourite products, and any personal discount granted by the owner.

## Project layout

```
web-site-minerals/
  src/                 # React frontend
  server/              # Express + Prisma API
  docker-compose.yml   # PostgreSQL 16 (local dev)
  docker-compose.prod.yml  # Caddy + API + Postgres (Lightsail)
  deploy/              # Production Caddyfile, env example, Lightsail guide
```

## Deploy (AWS Lightsail)

See [deploy/README.md](deploy/README.md) for IP-whitelisted production deploy with Docker Compose.

## Google OAuth (optional)

1. Create an OAuth **Web** client in Google Cloud Console.
2. Authorized JavaScript origin: `http://localhost:5174`
3. Authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
4. Put client ID/secret in `server/.env` and restart the API.
