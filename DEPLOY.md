# Deploying Khushi's Fairy Land to Render 🌷

The site is a Next.js 16 app with a PostgreSQL database (wishes, discoveries and ring moments).
Render can host both. Total time: ~10 minutes.

---

## 1. Put the code on GitHub

Render deploys from a Git repository.

```bash
# inside the project folder
git init
git add .
git commit -m "Khushi's fairy land 🌷"
```

Create an **empty** repository on https://github.com/new (private is fine), then:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

> `.gitignore` already keeps `node_modules`, `.next` and `.env` out of the repo.

---

## 2. Deploy with the Blueprint (recommended — one click)

The repo contains `render.yaml`, which describes the web service **and** the database.

1. Sign in at https://dashboard.render.com (free, no card needed).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub account and pick the repository.
4. Render shows two resources: `khushi-fairy-land` (web) and `khushi-fairy-land-db` (Postgres). Click **Apply**.
5. Wait for the first deploy (3–6 minutes). The build log will show
   `drizzle-kit push` creating the tables, then `next build`.
6. Open the URL shown at the top of the service page:
   `https://khushi-fairy-land.onrender.com` (Render adds a suffix if the name is taken).

That's it — the fairy land is live. 🎉

### Want a different region?
Edit `region:` in `render.yaml` **for both resources** (`oregon`, `ohio`, `virginia`, `frankfurt`, `singapore`)
before applying. Singapore is the closest to India.

---

## 3. Manual setup (if you prefer clicking through the dashboard)

**a) Database** — **New +** → **Postgres**
- Name: `khushi-fairy-land-db`, Region: `Singapore`, Plan: Free → **Create Database**
- On the database page copy the **Internal Database URL**.

**b) Web service** — **New +** → **Web Service** → pick the repo
| Setting | Value |
| --- | --- |
| Runtime | Node |
| Region | same as the database |
| Build Command | `npm ci --include=dev && npx drizzle-kit push && npm run build` |
| Start Command | `npm run start` |
| Health Check Path | `/api/health` |
| Instance type | Free |

**c) Environment variables** (Advanced → Add Environment Variable)
| Key | Value |
| --- | --- |
| `DATABASE_URL` | the *Internal Database URL* from step a |
| `NODE_VERSION` | `22.22.1` |
| `NODE_ENV` | `production` |

Click **Create Web Service** and wait for the deploy to finish.

---

## 4. Things to know about Render's free tier

- **The site sleeps after 15 minutes without visitors** and takes ~1 minute to wake up.
  👉 Open the link yourself a couple of minutes before showing it to Khushi so it loads instantly.
  (Upgrading the web service to *Starter* removes the sleeping completely.)
- **Free databases expire 30 days after creation** (14-day grace period, then the data is deleted).
  If the wishes should live longer, upgrade the database to the smallest paid plan
  (*Database → Settings → Instance type → Basic*) any time before it expires.
- The 3 starter wishes are re-created automatically if the database is ever empty.

---

## 5. Updating the site later

Just push to `main` — Render rebuilds and redeploys automatically (`autoDeploy: true`).

```bash
git add .
git commit -m "more tulips"
git push
```

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Build fails at `drizzle-kit push` with a connection error | The web service and database must be in the **same region**, and `DATABASE_URL` must be the **Internal** URL. |
| Build hangs at `drizzle-kit push` after a schema change | Change the build command to `npx drizzle-kit push --force` once, then remove `--force`. |
| Using an **External** URL / Neon / Supabase | Add env var `DATABASE_SSL=true` and append `?sslmode=require&uselibpqcompat=true` to `DATABASE_URL`. |
| `Cannot find module 'typescript'` during build | The build command must contain `--include=dev`. |
| `/api/health` returns `{"ok":false}` | The app can't reach the database — check `DATABASE_URL`. |

Custom domain (e.g. `khushi.love`): *Service → Settings → Custom Domains* — Render issues HTTPS automatically.
