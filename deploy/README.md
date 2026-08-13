# Deploy to AWS Lightsail (IP whitelist)

Basic production stack: **Caddy + Express API + Postgres** via Docker Compose on a single Lightsail Linux instance. Access is limited to allowlisted IPs through the **Lightsail Networking firewall** (not application code).

## Architecture

```
Browser (allowlisted IP)
  → Lightsail firewall :80
    → Caddy
         ├─ /              → SPA (/srv)
         └─ /api|/media|/uploads → api:3001 → postgres (internal)
```

## 1. Create a Lightsail instance

1. AWS Console → **Lightsail** → **Create instance**.
2. Platform: **Linux/Unix**, blueprint: **Ubuntu 24.04** (or 22.04).
3. Plan: **$5–$10/mo** (1–2 GB RAM). Prefer 2 GB if builds run on the instance.
4. Create and attach a **Static IP**.
5. Download or use an SSH key pair.

## 2. Restrict firewall to your IPs

Lightsail → your instance → **Networking**:

1. Remove the default **HTTP** rule that allows `0.0.0.0/0` (and the same for **SSH** if present).
2. Add **Custom** / application rules:

| Application | Port | Restrict to |
|-------------|------|-------------|
| HTTP        | 80   | `YOUR_IP_1/32`, `YOUR_IP_2/32`, … |
| SSH         | 22   | same CIDRs |

Placeholders are also listed in [`deploy/.env.example`](.env.example) under `ALLOWED_IPS` (documentation only — the app does not read them).

Find your public IP: [https://checkip.amazonaws.com](https://checkip.amazonaws.com).

## 3. Install Docker on the instance

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

## 4. Get the code and configure env

```bash
git clone <YOUR_REPO_URL> web-site-minerals
cd web-site-minerals

cp deploy/.env.example .env
nano .env   # or vim
```

Set at least:

- `CLIENT_URL=http://YOUR_STATIC_IP`
- `API_URL=http://YOUR_STATIC_IP`
- `JWT_SECRET` — long random string
- `POSTGRES_PASSWORD` — strong password

OAuth and Nova Poshta keys are optional.

## 5. Build and start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The API entrypoint runs `prisma db push` on each start, then bootstraps the admin user from `ADMIN_*` env (defaults: phone `0668344322`, password `hMJ5Pz&B6*%*Efez33`). First-time catalog seed:

```bash
docker compose -f docker-compose.prod.yml exec api npx prisma db seed
```

## 6. Verify

From an allowlisted IP open `http://YOUR_STATIC_IP`.

- Health: `http://YOUR_STATIC_IP/api/health` → `{"ok":true}`
- From a non-allowlisted IP the connection should time out / be refused by the firewall.

Useful commands:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f caddy
```

## Updates

```bash
cd web-site-minerals
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Notes

- **No HTTPS/domain** in this basic setup (HTTP on port 80). Add TLS / custom domain later if needed.
- Postgres is **not** published to the host; only reachable on the Docker network.
- Uploads persist in the `minerals_uploads` volume; DB data in `minerals_pg_data`.
- Local dev still uses root [`docker-compose.yml`](../docker-compose.yml) (Postgres only) and is unchanged.
