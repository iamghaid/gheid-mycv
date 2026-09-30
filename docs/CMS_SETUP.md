# Content management setup / إعداد لوحة التحكم

The repository now holds two Vercel projects:

| Folder | Project | What it is |
|---|---|---|
| `/` (root) | `gheid-mycv` (existing) | The public portfolio. Read-only: it only reads published content from the database, and serves it from a cache. |
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
| `NEXT_PUBLIC_PORTFOLIO_URL` | `https://gheid-mycv.vercel.app` (or your custom domain). Used for "View on site" links and to tell the site to refresh after a save |
| `REVALIDATE_SECRET` | at least 32 random characters. **Set the same value on the portfolio project too** |
| `DATABASE_URL` | added automatically when you connect Neon |
| `BLOB_READ_WRITE_TOKEN` | added automatically when you connect Blob |

Required on the **portfolio** project (`gheid-mycv`): `REVALIDATE_SECRET`, same value as on the admin. Without it the site still works, but edits only appear at the 6-hourly safety refresh.

Optional on the **portfolio** project: `NEXT_PUBLIC_SITE_URL` = the public domain (used for metadata and the live-preview check).

Redeploy both projects after adding the variables.

## 4. First login — أول دخول

Open the admin URL → `/login`. On the first visit the admin:

- creates the tables;
- imports the current site content from `shared/content/seed.json`.

If something is missing (a variable, or no database), the login page lists it under **Setup needed** instead of crashing.

Until the database is connected, the portfolio keeps showing the bundled content, so nothing breaks in the meantime.

## How updates reach the public site — كيف تظهر التعديلات

Visitors never wait on the database (Neon's free tier sleeps after 5 idle minutes):

- The portfolio serves content from Next's data cache (tag `content`). Page views do not query the database.
- Every save, delete, reorder or publish toggle writes to Postgres, then the admin calls the portfolio's `POST /api/revalidate` (authorised with `REVALIDATE_SECRET`), which expires the cache, and immediately requests `/api/content-version`, which reloads it while the database is awake. The next visitor sees the change straight from the cache.
- If that call fails, the admin shows an amber warning instead of "live on the site". The change is saved and appears at the next safety refresh (every 6 hours, done in the background so visitors are still served the cached content).
- If the database is unreachable while the cache is empty, the site uses the last content it loaded; the bundled `seed.json` is only a last resort.
- Pages that are already open check `/api/content-version` every 20 seconds (answered from the cache, so it never wakes the database) and refresh in place when the version changes.

## Live project previews — المعاينة الحية للمشاريع

A project's **Live URL** is embedded in desktop/mobile frames only when the site allows framing. The check reads the `X-Frame-Options` and CSP `frame-ancestors` headers, runs on the server, and only runs for published projects.

If the site blocks framing, the page shows the project thumbnail and an **Open live project** button instead. The restriction is never bypassed.

Set **Embed mode = off** on a project to always use the screenshot.

## Undo, history and Trash — التراجع والسجل وسلة المحذوفات

- **History / السجل**: every item, the profile and the CV have a History panel under the form. Each entry is how the record looked *before* a change (time in Asia/Riyadh, the fields that changed, a before/after preview). **Restore / استرجاع** is a normal save, so it can be undone as well. The last 30 versions per record are kept.
- **Undo / تراجع**: shown for 15 seconds after a save; it restores the state from before that save.
- **Trash / سلة المحذوفات**: Delete moves an item to the Trash (sidebar → Trash) and removes it from the site immediately. Restore puts it back with the same id and position; if its slug was taken in the meantime, it comes back hidden with a `-restored` slug. Items are purged automatically after 30 days, or with "Delete forever". Files used by trashed items can't be deleted from the media library until then.
- Reordering is not part of the history.
- The table (`content_revisions`) is created automatically the next time the admin starts; existing content is not touched. The public site never reads it.

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
REVALIDATE_SECRET=<32+ chars>
```

Portfolio `.env.local`:

```
DATABASE_URL=...
REVALIDATE_SECRET=<same value>
ADMIN_MEDIA_ORIGIN=http://localhost:3002
```

Without `BLOB_READ_WRITE_TOKEN`, uploads are saved to `admin/.media` and served by the admin at `/media/*`. This is for local development only.

## Chatbot / الشات بوت

Set these on the **portfolio** project (Settings → Environment Variables). At least one provider key is needed; Groq is tried first, then Gemini.

| Variable | Value |
|---|---|
| `GROQ_API_KEY` | optional, from console.groq.com |
| `GEMINI_API_KEY` | from aistudio.google.com → Get API key |
| `GEMINI_MODEL` | optional, defaults to `gemini-3.5-flash-lite` (see ai.google.dev/gemini-api/docs/models) |
| `CHAT_LIMIT_PER_MINUTE` / `CHAT_LIMIT_PER_DAY` | optional, default 10 and 60 requests per visitor IP |

Limits are stored in the same Postgres database (table `chat_rate_limits`, IPs hashed). Messages longer than 1000 characters are rejected. Provider errors are only written to the Vercel logs; visitors see a generic message.
