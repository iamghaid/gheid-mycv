'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { COLLECTIONS, SINGLETONS, ValidationError, sanitize, cleanUrl } from '@shared/content/schema';
import type { CollectionKey, MediaRecord, SingletonKey, SingletonMap } from '@shared/content/types';
import { login, logout, requireAdmin } from '@/lib/auth';
import * as repo from '@/lib/repo';
import { publishToSite } from '@/lib/publish';
import { changes, formatValue, type FieldChange, type State } from '@/lib/history';
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, isStorageUrl, removeStoredFile, saveLocal, storageMode } from '@/lib/storage';

/** `warning`: the change was saved but the public site could not be refreshed right away. */
export type ActionResult<T = unknown> = { ok: true; data?: T; warning?: string } | { ok: false; error: string; field?: string };

const isCollection = (k: string): k is CollectionKey => k in COLLECTIONS;
const isSingleton = (k: string): k is SingletonKey => k in SINGLETONS;

function fail(err: unknown): ActionResult<never> {
    if (err instanceof ValidationError) return { ok: false, error: err.message, field: err.field };
    console.error(err);
    return { ok: false, error: (err as Error)?.message || 'Something went wrong.' };
}

/* ------------------------------------------------------------------ auth */

export type LoginState = { error: string; email: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
    const email = String(formData.get('email') ?? '');
    const result = await login(email, String(formData.get('password') ?? ''));
    // Returning the email lets the form keep it: React resets form fields after an action.
    if (!result.ok) return { error: result.error, email };
    redirect('/');
}

export async function logoutAction() {
    await logout();
    redirect('/login');
}

/* ------------------------------------------------------------ collections */

/** Validates and stores an item. Shared by Save, Restore and Undo, so they behave the same. */
async function persistItem(collection: CollectionKey, id: string | null, input: unknown, published: boolean) {
    const config = COLLECTIONS[collection];
    const data = sanitize(config.fields, input, config.defaults());

    // Slugs address pages (/projects/<slug>), so they must be unique.
    if ('slug' in data) {
        const others = await repo.listItems(collection);
        const clash = others.find((o) => o.id !== id && (o.data as unknown as { slug?: string }).slug === data.slug);
        if (clash) throw new ValidationError('slug', `Another ${config.singular.toLowerCase()} already uses the slug "${data.slug}".`);
    }

    if (id) {
        if (!(await repo.getItem(id))) throw new Error('This item no longer exists.');
        return { id, revisionId: await repo.updateItem(id, data, published) };
    }
    return { id: await repo.createItem(collection, data, published), revisionId: null };
}

/** `revisionId`: the previous state, which Undo restores. Null for a new item. */
export async function saveItemAction(
    collection: string,
    id: string | null,
    input: unknown,
    published: boolean
): Promise<ActionResult<{ id: string; revisionId: string | null }>> {
    await requireAdmin();
    if (!isCollection(collection)) return { ok: false, error: 'Unknown collection.' };
    try {
        const saved = await persistItem(collection, id, input, published);
        revalidatePath(`/${collection}`);
        return { ok: true, data: saved, warning: await publishToSite() };
    } catch (err) {
        return fail(err);
    }
}

export async function deleteItemAction(collection: string, id: string): Promise<ActionResult> {
    await requireAdmin();
    try {
        await repo.deleteItem(id); // moves it to the Trash
        revalidatePath(`/${collection}`);
        revalidatePath('/trash');
        return { ok: true, warning: await publishToSite() };
    } catch (err) {
        return fail(err);
    }
}

export async function setPublishedAction(collection: string, id: string, published: boolean): Promise<ActionResult> {
    await requireAdmin();
    try {
        await repo.setPublished(id, published);
        revalidatePath(`/${collection}`);
        return { ok: true, warning: await publishToSite() };
    } catch (err) {
        return fail(err);
    }
}

export async function reorderAction(collection: string, ids: string[]): Promise<ActionResult> {
    await requireAdmin();
    if (!isCollection(collection)) return { ok: false, error: 'Unknown collection.' };
    try {
        await repo.reorder(collection, ids.filter((x) => typeof x === 'string').slice(0, 1000));
        revalidatePath(`/${collection}`);
        return { ok: true, warning: await publishToSite() };
    } catch (err) {
        return fail(err);
    }
}

/* ------------------------------------------------------------- singletons */

async function persistSingleton(key: SingletonKey, input: unknown, stampResume: boolean) {
    const config = SINGLETONS[key];
    const data = sanitize(config.fields, input, config.defaults()) as unknown as SingletonMap[typeof key];
    if (key === 'resume' && stampResume) {
        const r = data as SingletonMap['resume'];
        r.updatedAt = new Date().toISOString();
        if (r.url && !r.fileName) r.fileName = decodeURIComponent(r.url.split('/').pop() ?? '').replace(/-[A-Za-z0-9]{20,}(\.pdf)$/i, '$1');
    }
    return repo.saveSingleton(key, data);
}

export async function saveSingletonAction(key: string, input: unknown): Promise<ActionResult<{ revisionId: string | null }>> {
    await requireAdmin();
    if (!isSingleton(key)) return { ok: false, error: 'Unknown section.' };
    try {
        const revisionId = await persistSingleton(key, input, true);
        revalidatePath(`/${key}`);
        return { ok: true, data: { revisionId }, warning: await publishToSite() };
    } catch (err) {
        return fail(err);
    }
}

/* -------------------------------------------------------------- history */

export type RevisionSummary = { id: string; createdAt: string; action: 'update' | 'delete'; changed: string[] };
export type RevisionPreview = { id: string; createdAt: string; changes: FieldChange[]; snapshot: { label: string; value: string }[] };

type Target = { kind: 'item' | 'singleton'; id: string };

function fieldsFor(rev: { target_kind: string; target_id: string; collection: string | null }) {
    if (rev.target_kind === 'singleton') return isSingleton(rev.target_id) ? SINGLETONS[rev.target_id].fields : [];
    return rev.collection && isCollection(rev.collection) ? COLLECTIONS[rev.collection].fields : [];
}

async function currentState(t: Target): Promise<State | null> {
    if (t.kind === 'singleton') {
        if (!isSingleton(t.id)) return null;
        const d = await repo.getSingleton(t.id);
        return d ? { data: d as unknown as Record<string, unknown>, published: null } : null;
    }
    const it = await repo.getItem(t.id);
    return it ? { data: it.data as unknown as Record<string, unknown>, published: it.published } : null;
}

const stateOf = (r: repo.RevisionRow): State => ({ data: r.data, published: r.published });

/** Newest first. Each entry is the state before the change made at `createdAt`. */
export async function listRevisionsAction(target: Target): Promise<RevisionSummary[]> {
    await requireAdmin();
    const kind = target.kind === 'singleton' ? 'singleton' : 'item';
    const revs = await repo.listRevisions(kind, String(target.id));
    if (!revs.length) return [];
    const current = await currentState({ kind, id: String(target.id) });
    return revs.map((r, i) => {
        const newer = i === 0 ? current : stateOf(revs[i - 1]);
        const changed = r.action === 'delete'
            ? ['Deleted, then restored from Trash']
            : newer ? changes(fieldsFor(r), stateOf(r), newer).map((c) => c.label) : [];
        return { id: r.id, createdAt: r.created_at.toISOString(), action: r.action, changed };
    });
}

export async function revisionPreviewAction(id: string): Promise<RevisionPreview | null> {
    await requireAdmin();
    const rev = await repo.getRevision(String(id));
    if (!rev) return null;
    const fields = fieldsFor(rev);
    const next = await repo.nextRevision(rev);
    const newer = next ? stateOf(next) : await currentState({ kind: rev.target_kind, id: rev.target_id });
    return {
        id: rev.id,
        createdAt: rev.created_at.toISOString(),
        changes: newer ? changes(fields, stateOf(rev), newer) : [],
        snapshot: fields
            .map((f) => ({ label: f.label, value: formatValue(f, rev.data[f.key]) }))
            .filter((x) => x.value.trim()),
    };
}

/**
 * Makes a revision the current content. It is an ordinary save, so the state it
 * replaces becomes a revision too and the restore can itself be undone.
 */
export async function restoreRevisionAction(id: string): Promise<ActionResult<{ revisionId: string | null }>> {
    await requireAdmin();
    try {
        const rev = await repo.getRevision(String(id));
        if (!rev) return { ok: false, error: 'That version no longer exists.' };
        let revisionId: string | null;
        if (rev.target_kind === 'singleton') {
            if (!isSingleton(rev.target_id)) return { ok: false, error: 'Unknown section.' };
            revisionId = await persistSingleton(rev.target_id, rev.data, false);
            revalidatePath(`/${rev.target_id}`);
        } else {
            if (!rev.collection || !isCollection(rev.collection)) return { ok: false, error: 'Unknown collection.' };
            if (!(await repo.getItem(rev.target_id))) return { ok: false, error: 'This item is in the Trash. Restore it from there first.' };
            ({ revisionId } = await persistItem(rev.collection, rev.target_id, rev.data, rev.published ?? true));
            revalidatePath(`/${rev.collection}`);
        }
        return { ok: true, data: { revisionId }, warning: await publishToSite() };
    } catch (err) {
        return fail(err);
    }
}

/* ------------------------------------------------------------------ trash */

export async function restoreFromTrashAction(targetId: string): Promise<ActionResult<{ href: string }>> {
    await requireAdmin();
    try {
        const rev = await repo.getTrashed(String(targetId));
        if (!rev || !rev.collection || !isCollection(rev.collection)) return { ok: false, error: 'This item is no longer in the Trash.' };
        const config = COLLECTIONS[rev.collection];
        const data = sanitize(config.fields, rev.data, config.defaults());
        let published = rev.published ?? true;
        let warning: string | undefined;

        // Another item may have taken the slug meanwhile: restore under a new one, hidden.
        if (typeof data.slug === 'string' && data.slug) {
            const taken = new Set((await repo.listItems(rev.collection)).map((o) => (o.data as unknown as { slug?: string }).slug));
            if (taken.has(data.slug)) {
                let slug = `${data.slug}-restored`;
                for (let n = 2; taken.has(slug); n++) slug = `${data.slug}-restored-${n}`;
                warning = `Restored as hidden with the slug "${slug}", because "${data.slug}" is used by another ${config.singular.toLowerCase()}.`;
                data.slug = slug;
                published = false;
            }
        }
        await repo.restoreTrashed(rev, data, published);
        revalidatePath(`/${rev.collection}`);
        revalidatePath('/trash');
        const publishWarning = await publishToSite();
        return { ok: true, data: { href: `/${rev.collection}/${rev.target_id}` }, warning: [warning, publishWarning].filter(Boolean).join(' ') || undefined };
    } catch (err) {
        return fail(err);
    }
}

export async function deleteForeverAction(targetId: string): Promise<ActionResult> {
    await requireAdmin();
    try {
        await repo.deleteForever(String(targetId));
        revalidatePath('/trash');
        return { ok: true };
    } catch (err) {
        return fail(err);
    }
}

/* ------------------------------------------------------------------ media */

export async function storageModeAction(): Promise<'blob' | 'local'> {
    await requireAdmin();
    return storageMode();
}

/** Returns the existing file when identical content was uploaded before. */
export async function findDuplicateAction(sha256: string): Promise<MediaRecord | null> {
    await requireAdmin();
    if (!/^[0-9a-f]{64}$/.test(sha256)) return null;
    return repo.findMediaBySha(sha256);
}

export async function registerMediaAction(input: {
    url: string; pathname: string; fileName: string; contentType: string; size: number; sha256: string;
}): Promise<ActionResult<MediaRecord>> {
    await requireAdmin();
    try {
        const url = cleanUrl(input.url);
        if (!url || !isStorageUrl(url)) return { ok: false, error: 'Unexpected file location.' };
        const record = await repo.insertMedia({
            url,
            pathname: String(input.pathname).slice(0, 500),
            fileName: String(input.fileName).slice(0, 255),
            contentType: String(input.contentType).slice(0, 120),
            size: Math.max(0, Number(input.size) || 0),
            sha256: /^[0-9a-f]{64}$/.test(input.sha256) ? input.sha256 : '',
            source: 'upload',
        });
        revalidatePath('/media');
        return { ok: true, data: record };
    } catch (err) {
        return fail(err);
    }
}

/** Local development upload (production uploads go browser → Vercel Blob). */
export async function uploadLocalAction(formData: FormData): Promise<ActionResult<MediaRecord>> {
    await requireAdmin();
    if (storageMode() !== 'local') return { ok: false, error: 'Local uploads are disabled.' };
    const file = formData.get('file');
    const sha256 = String(formData.get('sha256') ?? '');
    if (!(file instanceof File)) return { ok: false, error: 'No file received.' };
    if (!ALLOWED_TYPES.includes(file.type)) return { ok: false, error: `File type ${file.type || 'unknown'} is not allowed.` };
    if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: 'File is larger than 50 MB.' };
    try {
        const { url, pathname } = await saveLocal(file);
        const record = await repo.insertMedia({
            url, pathname, fileName: file.name.slice(0, 255), contentType: file.type, size: file.size,
            sha256: /^[0-9a-f]{64}$/.test(sha256) ? sha256 : '', source: 'upload',
        });
        revalidatePath('/media');
        return { ok: true, data: record };
    } catch (err) {
        return fail(err);
    }
}

export async function listMediaAction(): Promise<MediaRecord[]> {
    await requireAdmin();
    return repo.listMedia();
}

export async function mediaUsageAction(url: string) {
    await requireAdmin();
    return repo.mediaUsage(url);
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
    await requireAdmin();
    try {
        const media = await repo.getMedia(id);
        if (!media) return { ok: true };
        const usage = await repo.mediaUsage(media.url);
        if (usage.length) {
            return { ok: false, error: `Still used by: ${usage.map((u) => u.label).join(', ')}. Remove it there first.` };
        }
        await removeStoredFile(media.url, media.pathname, media.source);
        await repo.deleteMediaRow(id);
        revalidatePath('/media');
        return { ok: true };
    } catch (err) {
        return fail(err);
    }
}
