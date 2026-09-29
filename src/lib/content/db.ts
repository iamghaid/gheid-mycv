import 'server-only';
import postgres from 'postgres';
import type { CollectionKey, Item, SiteContent } from '@shared/content/types';
import { COLLECTION_KEYS } from '@shared/content/types';

/**
 * Read-only database access for the public site. All writes happen in the admin
 * app; this side only ever runs SELECTs, and only for published records.
 */
const globalForDb = globalThis as unknown as { __portfolioSql?: postgres.Sql };

export function hasDatabase(): boolean {
    return !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

function sql(): postgres.Sql {
    if (!globalForDb.__portfolioSql) {
        const url = (process.env.DATABASE_URL || process.env.POSTGRES_URL)!;
        const local = /localhost|127\.0\.0\.1/.test(url);
        globalForDb.__portfolioSql = postgres(url, {
            prepare: false, // required behind Neon's PgBouncer pooler
            max: 3,
            idle_timeout: 20,
            connect_timeout: 10,
            ssl: local ? false : 'require',
        });
    }
    return globalForDb.__portfolioSql;
}

export async function fetchVersion(): Promise<number | null> {
    const rows = await sql()`select value from content_meta where key = 'version'`;
    return rows[0] ? Number(rows[0].value) : null;
}

type Row = { id: string; collection: string; data: unknown; sort_order: number; published: boolean; updated_at: Date };

export async function fetchContent(version: number): Promise<SiteContent | null> {
    const db = sql();
    const [singles, rows] = await Promise.all([
        db`select key, data from singletons`,
        db<Row[]>`
            select id, collection, data, sort_order, published, updated_at
            from content_items where published order by collection, sort_order, created_at`,
    ]);
    const profile = singles.find((s) => s.key === 'profile')?.data;
    if (!profile) return null; // database exists but has not been initialised by the admin yet

    const collections = Object.fromEntries(COLLECTION_KEYS.map((k) => [k, [] as Item[]])) as SiteContent['collections'];
    for (const r of rows) {
        const key = r.collection as CollectionKey;
        if (!collections[key]) continue;
        (collections[key] as Item[]).push({
            id: r.id,
            collection: key,
            data: r.data as Item['data'],
            sortOrder: r.sort_order,
            published: r.published,
            updatedAt: r.updated_at.toISOString(),
        });
    }
    return {
        version,
        profile: profile as SiteContent['profile'],
        resume: (singles.find((s) => s.key === 'resume')?.data as SiteContent['resume']) ?? { url: '', fileName: '', updatedAt: '' },
        collections,
    };
}
