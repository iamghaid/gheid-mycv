import 'server-only';
import type postgres from 'postgres';
import { ensureReady, sql } from './db';
import type { CollectionKey, Item, MediaRecord, SingletonKey, SingletonMap } from '@shared/content/types';

/* All writes bump content_meta.version in the same transaction. The public site
   keys its cache on that number, so a saved change is served on the next request.

   Every change to an existing record first copies the record's current state into
   content_revisions, in the same transaction, so it can be undone. */

type Tx = postgres.TransactionSql;

export const REVISIONS_KEPT = 30;
export const TRASH_DAYS = 30;

/** Copies the item's current row into content_revisions. Returns the revision id, or null if the item doesn't exist. */
async function snapshotItem(tx: Tx, id: string, action: 'update' | 'delete'): Promise<string | null> {
    const [row] = await tx`
        insert into content_revisions (target_kind, target_id, collection, data, published, sort_order, action)
        select 'item', id::text, collection, data, published, sort_order, ${action}
        from content_items where id = ${id}
        for update
        returning id`;
    if (!row) return null;
    await prune(tx, 'item', id);
    return String(row.id);
}

async function snapshotSingleton(tx: Tx, key: string): Promise<string | null> {
    const [row] = await tx`
        insert into content_revisions (target_kind, target_id, data, action)
        select 'singleton', key, data, 'update' from singletons where key = ${key}
        for update
        returning id`;
    if (!row) return null;
    await prune(tx, 'singleton', key);
    return String(row.id);
}

async function prune(tx: Tx, kind: 'item' | 'singleton', target: string) {
    await tx`
        delete from content_revisions
        where target_kind = ${kind} and target_id = ${target} and id not in (
            select id from content_revisions
            where target_kind = ${kind} and target_id = ${target}
            order by id desc limit ${REVISIONS_KEPT})`;
}

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

/** Returns the id of the revision holding the previous state (for Undo). */
export async function updateItem(id: string, data: unknown, published: boolean): Promise<string | null> {
    await ensureReady();
    return sql().begin(async (tx) => {
        const revision = await snapshotItem(tx, id, 'update');
        await tx`update content_items set data = ${tx.json(data as never)}, published = ${published}, updated_at = now() where id = ${id}`;
        await tx`update content_meta set value = value + 1 where key = 'version'`;
        return revision;
    });
}

export async function setPublished(id: string, published: boolean): Promise<void> {
    await ensureReady();
    await sql().begin(async (tx) => {
        await snapshotItem(tx, id, 'update');
        await tx`update content_items set published = ${published}, updated_at = now() where id = ${id}`;
        await tx`update content_meta set value = value + 1 where key = 'version'`;
    });
}

/** Moves the item to the Trash: its last state is kept as a 'delete' revision. */
export async function deleteItem(id: string): Promise<void> {
    await ensureReady();
    await sql().begin(async (tx) => {
        await snapshotItem(tx, id, 'delete');
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

export async function singletonUpdatedAt(key: SingletonKey): Promise<string | undefined> {
    await ensureReady();
    const rows = await sql()`select updated_at from singletons where key = ${key}`;
    return rows[0] ? (rows[0].updated_at as Date).toISOString() : undefined;
}

export async function saveSingleton<K extends SingletonKey>(key: K, data: SingletonMap[K]): Promise<string | null> {
    await ensureReady();
    return sql().begin(async (tx) => {
        const revision = await snapshotSingleton(tx, key);
        await tx`
            insert into singletons (key, data, updated_at) values (${key}, ${tx.json(data as never)}, now())
            on conflict (key) do update set data = excluded.data, updated_at = now()`;
        await tx`update content_meta set value = value + 1 where key = 'version'`;
        return revision;
    });
}

export async function contentVersion(): Promise<number> {
    await ensureReady();
    const [row] = await sql()`select value from content_meta where key = 'version'`;
    return Number(row?.value ?? 0);
}

/* -------------------------------------------------------------- revisions */

export type RevisionRow = {
    id: string; target_kind: 'item' | 'singleton'; target_id: string; collection: string | null;
    data: Record<string, unknown>; published: boolean | null; sort_order: number | null;
    action: 'update' | 'delete'; created_at: Date;
};

export async function listRevisions(kind: 'item' | 'singleton', target: string): Promise<RevisionRow[]> {
    await ensureReady();
    return sql()<RevisionRow[]>`
        select * from content_revisions where target_kind = ${kind} and target_id = ${target}
        order by id desc limit ${REVISIONS_KEPT}`;
}

export async function getRevision(id: string): Promise<RevisionRow | null> {
    await ensureReady();
    if (!/^\d{1,18}$/.test(id)) return null;
    const rows = await sql()<RevisionRow[]>`select * from content_revisions where id = ${id}`;
    return rows[0] ?? null;
}

/** The revision saved right after this one (its successor state), if any. */
export async function nextRevision(rev: RevisionRow): Promise<RevisionRow | null> {
    const rows = await sql()<RevisionRow[]>`
        select * from content_revisions
        where target_kind = ${rev.target_kind} and target_id = ${rev.target_id} and id > ${rev.id}
        order by id asc limit 1`;
    return rows[0] ?? null;
}

/* ------------------------------------------------------------------ trash */

/** Deleted items: their latest 'delete' revision, while the item is gone from content_items. */
const TRASHED = (db: postgres.Sql | Tx) => db`
    select distinct on (r.target_id) r.*
    from content_revisions r
    where r.target_kind = 'item' and r.action = 'delete'
      and not exists (select 1 from content_items i where i.id::text = r.target_id)
    order by r.target_id, r.id desc`;

/** Permanently removes items that have been in the Trash for more than TRASH_DAYS. */
export async function purgeTrash(): Promise<number> {
    await ensureReady();
    const rows = await sql()`
        with expired as (
            select r.target_id from content_revisions r
            where r.target_kind = 'item' and r.action = 'delete'
              and not exists (select 1 from content_items i where i.id::text = r.target_id)
            group by r.target_id
            having max(r.created_at) < now() - make_interval(days => ${TRASH_DAYS})
        )
        delete from content_revisions where target_kind = 'item' and target_id in (select target_id from expired)
        returning id`;
    return rows.length;
}

export async function listTrash(): Promise<RevisionRow[]> {
    await purgeTrash();
    const rows = (await TRASHED(sql())) as unknown as RevisionRow[];
    return rows.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
}

export async function getTrashed(targetId: string): Promise<RevisionRow | null> {
    await ensureReady();
    const rows = await sql()<RevisionRow[]>`
        select * from content_revisions r
        where r.target_kind = 'item' and r.target_id = ${targetId} and r.action = 'delete'
          and not exists (select 1 from content_items i where i.id::text = r.target_id)
        order by id desc limit 1`;
    return rows[0] ?? null;
}

/** Puts a trashed item back under its original id. The deleted revision stays in its history. */
export async function restoreTrashed(rev: RevisionRow, data: unknown, published: boolean): Promise<void> {
    await ensureReady();
    await sql().begin(async (tx) => {
        const [{ next }] = await tx`select coalesce(max(sort_order), -1) + 1 as next from content_items where collection = ${rev.collection}`;
        await tx`
            insert into content_items (id, collection, data, sort_order, published)
            values (${rev.target_id}, ${rev.collection}, ${tx.json(data as never)}, ${rev.sort_order ?? next}, ${published})`;
        await tx`update content_meta set value = value + 1 where key = 'version'`;
    });
}

/** Deletes a trashed item and all its history for good. */
export async function deleteForever(targetId: string): Promise<void> {
    await ensureReady();
    await sql()`
        delete from content_revisions
        where target_kind = 'item' and target_id = ${targetId}
          and not exists (select 1 from content_items i where i.id::text = ${targetId})`;
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

export function recordTitle(data: unknown): string | undefined {
    const d = (data ?? {}) as Record<string, { en?: string; ar?: string } | string>;
    return ['name', 'title', 'position', 'institution', 'company']
        .map((k) => (typeof d[k] === 'object' ? (d[k] as { en?: string; ar?: string }).en || (d[k] as { ar?: string }).ar : undefined))
        .find(Boolean);
}

/** Where a URL is referenced — so a file in use is never deleted by accident. */
export async function mediaUsage(url: string): Promise<{ label: string; href: string }[]> {
    await ensureReady();
    const needle = JSON.stringify(url).slice(1, -1);
    const items = await sql()<Row[]>`
        select id, collection, data, sort_order, published, updated_at from content_items
        where position(${needle} in data::text) > 0`;
    const singles = await sql()`select key from singletons where position(${needle} in data::text) > 0`;
    // Files of trashed items stay protected until the item is purged.
    await purgeTrash();
    const trashed = ((await TRASHED(sql())) as unknown as RevisionRow[]).filter((r) => JSON.stringify(r.data).includes(needle));
    return [
        ...trashed.map((r) => ({ label: `Trash: ${r.collection}: ${recordTitle(r.data) ?? r.target_id.slice(0, 8)}`, href: '/trash' })),
        ...items.map((r) => ({ label: `${r.collection}: ${recordTitle(r.data) ?? r.id.slice(0, 8)}`, href: `/${r.collection}/${r.id}` })),
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
