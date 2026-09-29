import 'server-only';
import { ensureReady, sql } from './db';
import type { CollectionKey, Item, MediaRecord, SingletonKey, SingletonMap } from '@shared/content/types';

/* All writes bump content_meta.version in the same transaction. The public site
   keys its cache on that number, so a saved change is served on the next request. */

type Row = { id: string; collection: string; data: unknown; sort_order: number; published: boolean; updated_at: Date };

const toItem = (r: Row): Item => ({
    id: r.id,
    collection: r.collection as CollectionKey,
    data: r.data as Item['data'],
    sortOrder: r.sort_order,
    published: r.published,
    updatedAt: r.updated_at.toISOString(),
});

export async function listItems(collection: CollectionKey): Promise<Item[]> {
    await ensureReady();
    const rows = await sql()<Row[]>`
        select id, collection, data, sort_order, published, updated_at
        from content_items where collection = ${collection}
        order by sort_order, created_at`;
    return rows.map(toItem);
}

export async function getItem(id: string): Promise<Item | null> {
    await ensureReady();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const rows = await sql()<Row[]>`
        select id, collection, data, sort_order, published, updated_at from content_items where id = ${id}`;
    return rows[0] ? toItem(rows[0]) : null;
}

export async function counts(): Promise<Record<string, { total: number; published: number }>> {
    await ensureReady();
    const rows = await sql()<{ collection: string; total: number; published: number }[]>`
        select collection, count(*)::int as total, count(*) filter (where published)::int as published
        from content_items group by collection`;
    return Object.fromEntries(rows.map((r) => [r.collection, { total: r.total, published: r.published }]));
}

export async function createItem(collection: CollectionKey, data: unknown, published: boolean): Promise<string> {
    await ensureReady();
    return sql().begin(async (tx) => {
        const [{ next }] = await tx`select coalesce(max(sort_order), -1) + 1 as next from content_items where collection = ${collection}`;
        const [row] = await tx`
            insert into content_items (collection, data, sort_order, published)
            values (${collection}, ${tx.json(data as never)}, ${next}, ${published})
            returning id`;
        await tx`update content_meta set value = value + 1 where key = 'version'`;
        return row.id as string;
    });
}

export async function updateItem(id: string, data: unknown, published: boolean): Promise<void> {
    await ensureReady();
    await sql().begin(async (tx) => {
        await tx`update content_items set data = ${tx.json(data as never)}, published = ${published}, updated_at = now() where id = ${id}`;
        await tx`update content_meta set value = value + 1 where key = 'version'`;
    });
}

export async function setPublished(id: string, published: boolean): Promise<void> {
    await ensureReady();
    await sql().begin(async (tx) => {
        await tx`update content_items set published = ${published}, updated_at = now() where id = ${id}`;
        await tx`update content_meta set value = value + 1 where key = 'version'`;
    });
}

export async function deleteItem(id: string): Promise<void> {
    await ensureReady();
    await sql().begin(async (tx) => {
        await tx`delete from content_items where id = ${id}`;
        await tx`update content_meta set value = value + 1 where key = 'version'`;
    });
}

/** Rewrites sort_order to match the given id order (ids not listed keep theirs). */
export async function reorder(collection: CollectionKey, ids: string[]): Promise<void> {
    await ensureReady();
    await sql().begin(async (tx) => {
        for (let i = 0; i < ids.length; i++) {
            await tx`update content_items set sort_order = ${i} where id = ${ids[i]} and collection = ${collection}`;
        }
        await tx`update content_meta set value = value + 1 where key = 'version'`;
    });
}

export async function getSingleton<K extends SingletonKey>(key: K): Promise<SingletonMap[K] | null> {
    await ensureReady();
    const rows = await sql()`select data from singletons where key = ${key}`;
    return (rows[0]?.data as SingletonMap[K]) ?? null;
}

export async function saveSingleton<K extends SingletonKey>(key: K, data: SingletonMap[K]): Promise<void> {
    await ensureReady();
    await sql().begin(async (tx) => {
        await tx`
            insert into singletons (key, data, updated_at) values (${key}, ${tx.json(data as never)}, now())
            on conflict (key) do update set data = excluded.data, updated_at = now()`;
        await tx`update content_meta set value = value + 1 where key = 'version'`;
    });
}

export async function contentVersion(): Promise<number> {
    await ensureReady();
    const [row] = await sql()`select value from content_meta where key = 'version'`;
    return Number(row?.value ?? 0);
}

/* ------------------------------------------------------------------ media */

type MediaRow = {
    id: string; url: string; pathname: string; file_name: string; content_type: string;
    size: string | number; sha256: string | null; source: string; created_at: Date;
};
const toMedia = (r: MediaRow): MediaRecord => ({
    id: r.id,
    url: r.url,
    pathname: r.pathname,
    fileName: r.file_name,
    contentType: r.content_type,
    size: Number(r.size),
    sha256: r.sha256 ?? '',
    source: r.source as MediaRecord['source'],
    createdAt: r.created_at.toISOString(),
});

export async function listMedia(): Promise<MediaRecord[]> {
    await ensureReady();
    const rows = await sql()<MediaRow[]>`select * from media order by created_at desc`;
    return rows.map(toMedia);
}

export async function findMediaBySha(sha256: string): Promise<MediaRecord | null> {
    await ensureReady();
    const rows = await sql()<MediaRow[]>`select * from media where sha256 = ${sha256}`;
    return rows[0] ? toMedia(rows[0]) : null;
}

export async function getMedia(id: string): Promise<MediaRecord | null> {
    await ensureReady();
    const rows = await sql()<MediaRow[]>`select * from media where id = ${id}`;
    return rows[0] ? toMedia(rows[0]) : null;
}

export async function insertMedia(m: Omit<MediaRecord, 'id' | 'createdAt'>): Promise<MediaRecord> {
    await ensureReady();
    const rows = await sql()<MediaRow[]>`
        insert into media (url, pathname, file_name, content_type, size, sha256, source)
        values (${m.url}, ${m.pathname}, ${m.fileName}, ${m.contentType}, ${m.size}, ${m.sha256 || null}, ${m.source})
        on conflict (url) do update set file_name = excluded.file_name
        returning *`;
    return toMedia(rows[0]);
}

export async function deleteMediaRow(id: string): Promise<void> {
    await ensureReady();
    await sql()`delete from media where id = ${id}`;
}

/** Where a URL is referenced — so a file in use is never deleted by accident. */
export async function mediaUsage(url: string): Promise<{ label: string; href: string }[]> {
    await ensureReady();
    const needle = JSON.stringify(url).slice(1, -1);
    const items = await sql()<Row[]>`
        select id, collection, data, sort_order, published, updated_at from content_items
        where position(${needle} in data::text) > 0`;
    const singles = await sql()`select key from singletons where position(${needle} in data::text) > 0`;
    return [
        ...items.map((r) => {
            const d = r.data as Record<string, { en?: string } | string>;
            const title = ['name', 'title', 'position', 'institution']
                .map((k) => (typeof d[k] === 'object' ? (d[k] as { en?: string }).en : undefined))
                .find(Boolean);
            return { label: `${r.collection}: ${title ?? r.id.slice(0, 8)}`, href: `/${r.collection}/${r.id}` };
        }),
        ...singles.map((s) => ({ label: s.key as string, href: `/${s.key}` })),
    ];
}

/* ------------------------------------------------------------ rate limiting */

export async function recordFailedLogin(ip: string) {
    await ensureReady();
    await sql()`insert into login_attempts (ip) values (${ip})`;
    await sql()`delete from login_attempts where at < now() - interval '1 day'`;
}

export async function recentFailures(ip: string): Promise<number> {
    await ensureReady();
    const [{ n }] = await sql()`select count(*)::int as n from login_attempts where ip = ${ip} and at > now() - interval '15 minutes'`;
    return n as number;
}

export async function clearFailures(ip: string) {
    await sql()`delete from login_attempts where ip = ${ip}`;
}
