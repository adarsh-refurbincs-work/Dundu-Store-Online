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
