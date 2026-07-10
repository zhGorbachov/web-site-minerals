# Minerals Web Store

React storefront + Express/Prisma API + PostgreSQL.

## Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL)
- npm

## Quick start

```bash
# 1. Start PostgreSQL (port 55432)
docker compose up -d

# 2. Install API deps, push schema, seed catalog + admin user
cd server
npm install
npx prisma db push
npx prisma db seed
cd ..

# 3. Install frontend deps
npm install

# 4. Run API (terminal 1)
npm run dev:server

# 5. Run frontend (terminal 2)
npm run dev
```

- Frontend: http://localhost:5174  
- API: http://localhost:3001  
- API health: http://localhost:3001/api/health  

## Default admin account

After seeding:

| Field    | Value              |
|----------|--------------------|
| Email    | `admin@luxstones.local` |
| Password | `admin123`         |

Open http://localhost:5174/login, sign in, then go to **Profile → Admin** or http://localhost:5174/admin.

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
| `npm run db:up` | Start Docker Postgres |
| `npm run db:down` | Stop Docker Postgres |
| `npm run db:migrate` | `prisma db push` |
| `npm run db:seed` | Reseed catalog + admin user |
| `npm run dev:server` | Start Express API |
| `npm run dev` | Start Vite frontend |

## Admin features

Signed-in admins can:

- Create / edit / delete products
- Change product stock (quantity)
- Create new subcategories under existing categories
- Upload / paste multiple product images and import a product video

On the product form: click the media area and press **Ctrl+V** (or **⌘V**) to paste images, or use **Add photos** / **Add video**.

## Project layout

```
web-site-minerals/
  src/                 # React frontend
  server/              # Express + Prisma API
  docker-compose.yml   # PostgreSQL 16
```

## Google OAuth (optional)

1. Create an OAuth **Web** client in Google Cloud Console.
2. Authorized JavaScript origin: `http://localhost:5174`
3. Authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
4. Put client ID/secret in `server/.env` and restart the API.
