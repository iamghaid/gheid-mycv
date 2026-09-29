import 'server-only';
import postgres from 'postgres';
import { SCHEMA_SQL } from '@shared/content/sql';
import seed from '@shared/content/seed.json';

/**
 * Database connection.
 *
 * Vercel's Neon integration sets DATABASE_URL (pooled) and POSTGRES_URL; either
 * works. `prepare: false` is required behind Neon's PgBouncer pooler.
 */
function connectionString(): string {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) {
        throw new Error('DATABASE_URL is not set. Connect a Postgres database to this Vercel project (Storage → Neon).');
    }
    return url;
}

const globalForDb = globalThis as unknown as { __sql?: postgres.Sql; __ready?: Promise<void> };

export function sql(): postgres.Sql {
    if (!globalForDb.__sql) {
        const url = connectionString();
        const local = /localhost|127\.0\.0\.1/.test(url);
        globalForDb.__sql = postgres(url, {
            prepare: false,
            max: 5,
            idle_timeout: 20,
            onnotice: () => {}, // "already exists, skipping" from the idempotent schema
            ssl: local ? false : 'require',
        });
    }
    return globalForDb.__sql;
}

/**
 * Creates the tables if needed and, on a brand-new database, imports the site's
 * existing content so nothing has to be re-entered. Runs once per server instance.
 */
export function ensureReady(): Promise<void> {
    if (!globalForDb.__ready) {
        globalForDb.__ready = (async () => {
            const db = sql();
            await db.unsafe(SCHEMA_SQL);
            const [{ count }] = await db`select count(*)::int as count from singletons where key = 'profile'`;
            if (count === 0) await importSeed(db);
        })().catch((err) => {
            globalForDb.__ready = undefined; // retry on the next request
            throw err;
        });
    }
    return globalForDb.__ready;
}

type SeedRow = { id: string; data: unknown; sortOrder: number; published: boolean };

async function importSeed(db: postgres.Sql) {
    const s = seed as unknown as {
        profile: unknown;
        resume: unknown;
        collections: Record<string, SeedRow[]>;
    };
    await db.begin(async (tx) => {
        await tx`insert into singletons (key, data) values ('profile', ${tx.json(s.profile as never)}) on conflict (key) do nothing`;
        await tx`insert into singletons (key, data) values ('resume', ${tx.json(s.resume as never)}) on conflict (key) do nothing`;
        for (const [collection, rows] of Object.entries(s.collections)) {
            for (const r of rows) {
                await tx`
                    insert into content_items (id, collection, data, sort_order, published)
                    values (${r.id}, ${collection}, ${tx.json(r.data as never)}, ${r.sortOrder}, ${r.published})
                    on conflict (id) do nothing`;
            }
        }
        // Register the images that ship with the portfolio so they can be reused.
        const urls = new Set<string>();
        JSON.stringify(s).replace(/"(\/[^"]+\.(?:jpe?g|png|webp|avif|gif|svg|pdf|docx?))"/gi, (_m, u: string) => {
            urls.add(u);
            return '';
        });
        for (const url of urls) {
            await tx`
                insert into media (url, pathname, file_name, source)
                values (${url}, ${url}, ${url.split('/').pop() ?? url}, 'bundled')
                on conflict (url) do nothing`;
        }
        await tx`update content_meta set value = value + 1 where key = 'version'`;
    });
}
