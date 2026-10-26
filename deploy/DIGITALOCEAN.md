# DigitalOcean droplet — redeploy the storefront

The droplet (`ssh droplet` → 139.59.65.141) must pull from the **current** GitHub repo
`https://github.com/adarsh-refurbincs-work/Dundu-Store-Online` (the repo moved on 2026-10-20;
if the server still points at `adarsh-techy/Dundu_Store` it never receives new code).

```bash
ssh droplet
cd <path-to-repo>                      # e.g. /var/www/dundu or /root/DUNDU-STORE
git remote set-url origin https://github.com/adarsh-refurbincs-work/Dundu-Store-Online.git
git fetch origin && git reset --hard origin/main

# A) docker-compose stack (backend + web + admin + postgres)
docker compose build backend web admin
docker compose up -d
docker compose exec backend npm run migrate     # new migrations (e.g. combo_images)

# B) bare install (nginx serving web/dist, node/pm2 for the API)
cd backend && npm ci && npm run migrate && pm2 restart dundu-api   # or: systemctl restart dundu-api
cd ../web   && npm ci && npm run build          # nginx serves web/dist
cd ../admin && npm ci && npm run build
sudo systemctl reload nginx
```

Confirm the new build is live: the storefront footer shows **`Build <commit> · <time> UTC`**
(must equal `git rev-parse --short HEAD` on the server), and `POST /api/orders/quote`
returns 401 (route present) instead of 404.

## Signup / login "silent" on the https site (2026-10-26)

`https://139-59-65-141.sslip.io/api/*` is proxied to a **different / outdated backend**:
`POST /api/auth/signup` → `404 Route not found`, `GET /api/settings/payment` → 404, and the login
error text is not Dundu's. The Dundu stack on `:8082` answers all of these correctly.

Fix the https server block so `/api/` and `/uploads/` go to the Dundu backend (the same
upstream the `:8082` site uses — `docker compose ps` / `ss -ltnp` shows its port), then reload:

```nginx
location /api/     { proxy_pass http://127.0.0.1:<dundu-backend-port>; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; client_max_body_size 50M; }
location /uploads/ { proxy_pass http://127.0.0.1:<dundu-backend-port>; proxy_set_header Host $host; }
```

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -s -X POST https://139-59-65-141.sslip.io/api/auth/signup -H 'Content-Type: application/json' -d '{}'
# expect a Dundu validation error ({"success":false,"message":"Name is required"}), not 404
```
