import 'server-only';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { del } from '@vercel/blob';

/**
 * Where uploaded files live.
 *
 * - Production: Vercel Blob (public CDN URLs). Enabled when the project has a Blob
 *   store connected, which sets BLOB_READ_WRITE_TOKEN. The browser uploads straight
 *   to Blob (see /api/blob), so large PDFs are not limited by the 4.5 MB request cap.
 * - Local development: files are written to admin/.media and served by /media/*.
 */
export type StorageMode = 'blob' | 'local';

export function storageMode(): StorageMode {
    return process.env.BLOB_READ_WRITE_TOKEN ? 'blob' : 'local';
}

export const ALLOWED_TYPES = [
    'image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const localDir = () => process.env.MEDIA_LOCAL_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), '.media');
const localBaseUrl = () => (process.env.ADMIN_PUBLIC_URL || 'http://localhost:3002').replace(/\/$/, '');

export function safeFileName(name: string): string {
    const ext = path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const base = path.basename(name, path.extname(name)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'file';
    return `${base}${ext}`;
}

/** Local mode only. */
export async function saveLocal(file: File): Promise<{ url: string; pathname: string }> {
    const now = new Date();
    const key = `${now.getUTCFullYear()}/${randomUUID().slice(0, 8)}-${safeFileName(file.name)}`;
    const target = path.join(/*turbopackIgnore: true*/ localDir(), key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(await file.arrayBuffer()));
    return { url: `${localBaseUrl()}/media/${key}`, pathname: key };
}

/** Resolves a /media/<key> request to a file path inside the local media dir. */
export function localPathFor(key: string): string | null {
    const root = path.resolve(/*turbopackIgnore: true*/ localDir());
    const target = path.resolve(/*turbopackIgnore: true*/ root, key);
    return target.startsWith(root + path.sep) ? target : null;
}

export async function removeStoredFile(url: string, pathname: string, source: string): Promise<void> {
    if (source !== 'upload') return; // bundled files ship with the portfolio
    if (/\.blob\.vercel-storage\.com\//.test(url)) {
        await del(url);
        return;
    }
    const target = localPathFor(pathname);
    if (target) await unlink(target).catch(() => undefined);
}

export function isStorageUrl(url: string): boolean {
    try {
        const u = new URL(url);
        return u.hostname.endsWith('.public.blob.vercel-storage.com') || url.startsWith(`${localBaseUrl()}/media/`);
    } catch {
        return false;
    }
}
