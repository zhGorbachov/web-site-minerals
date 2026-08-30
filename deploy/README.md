# Deploy to AWS Lightsail

Production stack: **Caddy + Express API + Postgres** via Docker Compose on a single Lightsail Linux instance. Public HTTPS on [lux-stones.com.ua](https://lux-stones.com.ua); SSH stays IP-restricted.

## Architecture

```
Browser
  → Lightsail firewall :80 / :443
    → Caddy (Let's Encrypt)
         ├─ /              → SPA (/srv)
         └─ /api|/media|/uploads → api:3001 → postgres (internal)
```

`www.lux-stones.com.ua` redirects to the apex domain.

## 1. Create a Lightsail instance

1. AWS Console → **Lightsail** → **Create instance**.
2. Platform: **Linux/Unix**, blueprint: **Ubuntu 24.04** (or 22.04).
3. Plan: **$5–$10/mo** (1–2 GB RAM). Prefer 2 GB if builds run on the instance.
4. Create and attach a **Static IP**.
5. Download or use an SSH key pair.

## 2. Firewall

Lightsail → your instance → **Networking**:

| Application | Port | Restrict to |
|-------------|------|-------------|
| HTTP        | 80   | `0.0.0.0/0` (Let's Encrypt HTTP-01 + redirect to HTTPS) |
| HTTPS       | 443  | `0.0.0.0/0` |
| SSH         | 22   | `YOUR_IP/32` only |

If HTTP was previously limited to your IP, Let's Encrypt cannot issue a certificate — open port 80 to the world.

Find your public IP: [https://checkip.amazonaws.com](https://checkip.amazonaws.com).

## 3. DNS (nic.ua)

Domain DNS is **not** registered inside Lightsail. At the registrar:

1. Use **NIC.UA name servers** (not parking NS).
2. A records:

| Name | Type | Value |
|------|------|--------|
| `@`  | A    | Lightsail Static IP |
| `www`| A    | same IP |

Wait until `nslookup lux-stones.com.ua 8.8.8.8` returns that IP before starting Caddy with HTTPS.

## 4. Install Docker on the instance

SSH in, then:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
# re-login (or newgrp docker) so docker works without sudo
```

## 5. Get the code and configure env

```bash
git clone <YOUR_REPO_URL> web-site-minerals
cd web-site-minerals

cp deploy/.env.example .env
nano .env   # or vim
```

Set at least:

- `CLIENT_URL=https://lux-stones.com.ua`
- `API_URL=https://lux-stones.com.ua`
- `JWT_SECRET` — long random string
- `POSTGRES_PASSWORD` — strong password

OAuth and Nova Poshta keys are optional.

## 6. Build and start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The API entrypoint runs `prisma db push` on each start, then bootstraps:

- the five storefront categories (Низки, Підвіски, Браслети, Пахощі, Мінерали) — always present, home page stays **2+3**
- subcategory links for products saved before multi-subcategory support (idempotent, no-op afterwards)
- the admin user from `ADMIN_*` env (defaults: phone `0668344322`, password `hMJ5Pz&B6*%*Efez33`)

Subcategories are **not** created automatically — add them in admin as needed.

Optional demo catalog (mock products and seed subcategories). Skip this on a live shop:

```bash
docker compose -f docker-compose.prod.yml exec api npx prisma db seed
```

Strip mock products, default seed subcategories, and leftover demo reviews before going live. The five categories, users and admin stay:

```bash
docker compose -f docker-compose.prod.yml exec api npm run db:clear-seed
# or: sh deploy/clear-seed.sh
```

## 7. Verify

Open [https://lux-stones.com.ua](https://lux-stones.com.ua).

- Health: `https://lux-stones.com.ua/api/health` → `{"ok":true}`
- Certificate: Caddy logs should mention obtaining a certificate for `lux-stones.com.ua`

Useful commands:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f caddy
```

## Updates

`db:clear-seed` only changes the database — **no restart needed**.

To bounce the running stack without new code:

```bash
docker compose -f docker-compose.prod.yml restart
```

To deploy new code or media (images, frontend, API):

```bash
cd web-site-minerals
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

After changing `CLIENT_URL` / `API_URL` in `.env`, recreate the API container:

```bash
docker compose -f docker-compose.prod.yml up -d api
```

## Notes

- TLS certificates live in the `caddy_data` Docker volume (survive rebuilds).
- Postgres is **not** published to the host; only reachable on the Docker network.
- Uploads persist in the `minerals_uploads` volume; DB data in `minerals_pg_data`.
- Local dev still uses root [`docker-compose.yml`](../docker-compose.yml) (Postgres only) and is unchanged.
