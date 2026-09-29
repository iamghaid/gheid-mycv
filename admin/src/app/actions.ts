'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { COLLECTIONS, SINGLETONS, ValidationError, sanitize, cleanUrl } from '@shared/content/schema';
import type { CollectionKey, MediaRecord, SingletonKey, SingletonMap } from '@shared/content/types';
import { login, logout, requireAdmin } from '@/lib/auth';
import * as repo from '@/lib/repo';
import { publishToSite } from '@/lib/publish';
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

export async function saveItemAction(
    collection: string,
    id: string | null,
    input: unknown,
    published: boolean
): Promise<ActionResult<{ id: string }>> {
    await requireAdmin();
    if (!isCollection(collection)) return { ok: false, error: 'Unknown collection.' };
    try {
        const config = COLLECTIONS[collection];
        const data = sanitize(config.fields, input, config.defaults());

        // Slugs address pages (/projects/<slug>), so they must be unique.
        if ('slug' in data) {
            const others = await repo.listItems(collection);
            const clash = others.find((o) => o.id !== id && (o.data as unknown as { slug?: string }).slug === data.slug);
            if (clash) throw new ValidationError('slug', `Another ${config.singular.toLowerCase()} already uses the slug "${data.slug}".`);
        }

        let savedId = id;
        if (id) {
            if (!(await repo.getItem(id))) return { ok: false, error: 'This item no longer exists.' };
            await repo.updateItem(id, data, published);
        } else {
            savedId = await repo.createItem(collection, data, published);
        }
        revalidatePath(`/${collection}`);
        return { ok: true, data: { id: savedId! }, warning: await publishToSite() };
    } catch (err) {
        return fail(err);
    }
}

export async function deleteItemAction(collection: string, id: string): Promise<ActionResult> {
    await requireAdmin();
    try {
        await repo.deleteItem(id);
        revalidatePath(`/${collection}`);
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

export async function saveSingletonAction(key: string, input: unknown): Promise<ActionResult> {
    await requireAdmin();
    if (!isSingleton(key)) return { ok: false, error: 'Unknown section.' };
    try {
        const config = SINGLETONS[key];
        const data = sanitize(config.fields, input, config.defaults()) as unknown as SingletonMap[typeof key];
        if (key === 'resume') {
            const r = data as SingletonMap['resume'];
            r.updatedAt = new Date().toISOString();
            if (r.url && !r.fileName) r.fileName = decodeURIComponent(r.url.split('/').pop() ?? '').replace(/-[A-Za-z0-9]{20,}(\.pdf)$/i, '$1');
        }
        await repo.saveSingleton(key, data);
        revalidatePath(`/${key}`);
        return { ok: true, warning: await publishToSite() };
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
