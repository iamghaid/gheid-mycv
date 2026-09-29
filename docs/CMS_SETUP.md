# Content management setup / إعداد لوحة التحكم

The repository now holds two Vercel projects:

| Folder | Project | What it is |
|---|---|---|
| `/` (root) | `gheid-mycv` (existing) | The public portfolio. Read-only: it only reads published content from the database. |
| `/admin` | new project, e.g. `gheid-mycv-admin` | The admin dashboard. Login required for every page and action. |
| `/shared` | — | Content types, validation and the initial content (`seed.json`), used by both. |

Both projects use the **same Postgres database**. Only the admin writes to it and to Blob storage.

---

## 1. Database (Neon Postgres) — قاعدة البيانات

1. Vercel → project **gheid-mycv** → **Storage** → **Create Database** → **Neon (Postgres)** → create it.
2. Connect it to **gheid-mycv** (all environments). This adds `DATABASE_URL` (and `POSTGRES_URL`).
3. After creating the admin project (step 3), connect the **same** database to it as well.

## 2. File storage (Vercel Blob) — تخزين الملفات

1. Vercel → **Storage** → **Create** → **Blob** → create a store.
2. Connect it to the **admin** project only. This adds `BLOB_READ_WRITE_TOKEN`.

The portfolio doesn't need the token: Blob files are public URLs and `next.config.ts` already allows `*.public.blob.vercel-storage.com`.

## 3. Create the admin project — إنشاء مشروع لوحة التحكم

Vercel → **Add New → Project** → import the same GitHub repo (`iamghaid/gheid-mycv`), then:

- **Root Directory:** `admin`
- Keep **"Include files outside the root directory in the Build Step"** enabled (it is on by default). The admin imports `../shared`.
- Framework preset: Next.js (auto-detected).

Environment variables (Settings → Environment Variables):

| Variable | Value |
|---|---|
| `ADMIN_EMAIL` | the email you log in with |
| `ADMIN_PASSWORD` | a strong password |
| `AUTH_SECRET` | at least 32 random characters, e.g. the output of `openssl rand -base64 48` |
| `NEXT_PUBLIC_PORTFOLIO_URL` | `https://gheid-mycv.vercel.app` (or your custom domain), used for the "View on site" links |
| `DATABASE_URL` | added automatically when you connect Neon |
| `BLOB_READ_WRITE_TOKEN` | added automatically when you connect Blob |

Optional on the **portfolio** project: `NEXT_PUBLIC_SITE_URL` = the public domain (used for metadata and the live-preview check).

Redeploy both projects after adding the variables.

## 4. First login — أول دخول

Open the admin URL → `/login`. On the first visit the admin:

- creates the tables;
- imports the current site content from `shared/content/seed.json`.

If something is missing (a variable, or no database), the login page lists it under **Setup needed** instead of crashing.

Until the database is connected, the portfolio keeps showing the bundled content, so nothing breaks in the meantime.

## How updates reach the public site — كيف تظهر التعديلات

- Every save, delete, reorder or publish toggle writes to Postgres and bumps a content version.
- The portfolio reads published content per request (cached per version), so any new page load shows the change immediately. No rebuild or redeploy is needed.
- Pages that are already open check `/api/content-version` every 20 seconds and refresh their data in place when it changes.

## Live project previews — المعاينة الحية للمشاريع

A project's **Live URL** is embedded in desktop/mobile frames only when the site allows framing. The check reads the `X-Frame-Options` and CSP `frame-ancestors` headers, runs on the server, and only runs for published projects.

If the site blocks framing, the page shows the project thumbnail and an **Open live project** button instead. The restriction is never bypassed.

Set **Embed mode = off** on a project to always use the screenshot.

## Local development

```bash
# Postgres running locally, then:
cd admin && npm install && npm run dev      # http://localhost:3002
npm install && npm run dev                  # portfolio, http://localhost:3000
```

`admin/.env.local`:

```
DATABASE_URL=postgres://user:pass@localhost:5432/portfolio
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
AUTH_SECRET=<32+ chars>
NEXT_PUBLIC_PORTFOLIO_URL=http://localhost:3000
```

Portfolio `.env.local`:

```
DATABASE_URL=...
ADMIN_MEDIA_ORIGIN=http://localhost:3002
```

Without `BLOB_READ_WRITE_TOKEN`, uploads are saved to `admin/.media` and served by the admin at `/media/*`. This is for local development only.
