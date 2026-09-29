'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, ImageIcon, Loader2, Search, Upload, X } from 'lucide-react';
import type { MediaRecord } from '@shared/content/types';
import {
    findDuplicateAction, listMediaAction, registerMediaAction, storageModeAction, uploadLocalAction,
} from '@/app/actions';
import { previewUrl } from '@/lib/nav';

export type MediaKind = 'image' | 'document' | 'any';

export const isImageUrl = (url: string) => /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(url);
export const kindOf = (accept?: string): MediaKind =>
    !accept ? 'any' : accept.includes('pdf') || accept.includes('doc') ? (accept.includes('image/') ? 'any' : 'document') : 'image';

async function sha256Hex(file: File): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Uploads a file and registers it in the media library. Identical content that was
 * uploaded before is reused instead of stored twice.
 */
export async function uploadFile(file: File, onProgress?: (pct: number) => void): Promise<MediaRecord> {
    const hash = await sha256Hex(file);
    const existing = await findDuplicateAction(hash);
    if (existing) return existing;

    const mode = await storageModeAction();
    if (mode === 'blob') {
        const { upload } = await import('@vercel/blob/client');
        const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
        const blob = await upload(`uploads/${safe}`, file, {
            access: 'public',
            handleUploadUrl: '/api/blob',
            onUploadProgress: (e) => onProgress?.(e.percentage),
        });
        const res = await registerMediaAction({
            url: blob.url, pathname: blob.pathname, fileName: file.name, contentType: file.type, size: file.size, sha256: hash,
        });
        if (!res.ok) throw new Error(res.error);
        return res.data!;
    }

    const fd = new FormData();
    fd.set('file', file);
    fd.set('sha256', hash);
    const res = await uploadLocalAction(fd);
    if (!res.ok) throw new Error(res.error);
    return res.data!;
}

export function Thumb({ url, className = 'h-16 w-16' }: { url: string; className?: string }) {
    if (!url) {
        return <div className={`${className} flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-400`}><ImageIcon className="h-5 w-5" /></div>;
    }
    if (isImageUrl(url)) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={previewUrl(url)} alt="" className={`${className} rounded-lg border border-neutral-200 bg-neutral-100 object-cover`} />;
    }
    return (
        <div className={`${className} flex flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500`}>
            <FileText className="h-5 w-5" />
            <span className="mt-0.5 text-[10px] uppercase">{url.split('.').pop()?.slice(0, 4)}</span>
        </div>
    );
}

export function UploadButton({ accept, multiple, onUploaded, label = 'Upload' }: {
    accept?: string; multiple?: boolean; onUploaded: (m: MediaRecord[]) => void; label?: string;
}) {
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handle(files: FileList | null) {
        if (!files?.length) return;
        setError(null);
        const done: MediaRecord[] = [];
        try {
            for (const [i, f] of [...files].entries()) {
                setBusy(files.length > 1 ? `Uploading ${i + 1}/${files.length}…` : 'Uploading…');
                done.push(await uploadFile(f, (p) => setBusy(`Uploading ${Math.round(p)}%`)));
            }
            onUploaded(done);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(null);
            if (input.current) input.current.value = '';
        }
    }

    return (
        <span className="inline-flex flex-col">
            <input ref={input} type="file" hidden accept={accept} multiple={multiple} onChange={(e) => handle(e.target.files)} />
            <button type="button" className="btn-secondary" disabled={!!busy} onClick={() => input.current?.click()}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {busy ?? label}
            </button>
            {error && <span className="mt-1 text-xs text-red-600">{error}</span>}
        </span>
    );
}

/** Modal to reuse a file that is already in the library. */
export function MediaPicker({ kind, multiple, onPick, onClose }: {
    kind: MediaKind; multiple?: boolean; onPick: (urls: string[]) => void; onClose: () => void;
}) {
    const [items, setItems] = useState<MediaRecord[] | null>(null);
    const [q, setQ] = useState('');
    const [picked, setPicked] = useState<string[]>([]);

    useEffect(() => {
        listMediaAction().then(setItems);
    }, []);

    const visible = useMemo(() => (items ?? []).filter((m) => {
        const img = isImageUrl(m.url);
        if (kind === 'image' && !img) return false;
        if (kind === 'document' && img) return false;
        return !q || m.fileName.toLowerCase().includes(q.toLowerCase());
    }), [items, kind, q]);

    const toggle = (url: string) =>
        multiple ? setPicked((p) => (p.includes(url) ? p.filter((x) => x !== url) : [...p, url])) : onPick([url]);

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" onClick={onClose}>
            <div className="card flex max-h-[85vh] w-full max-w-3xl flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 border-b border-neutral-200 p-4">
                    <h2 className="font-semibold">Choose from library</h2>
                    <div className="relative ml-auto w-48">
                        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                        <input className="input pl-8" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
                    </div>
                    <button className="btn-ghost p-2" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
                </div>
                <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-5">
                    {!items && <p className="col-span-full text-sm text-neutral-500">Loading…</p>}
                    {items && !visible.length && <p className="col-span-full text-sm text-neutral-500">Nothing here yet.</p>}
                    {visible.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => toggle(m.url)}
                            className={`rounded-lg p-1 text-left ring-2 transition ${picked.includes(m.url) ? 'ring-neutral-900' : 'ring-transparent hover:ring-neutral-300'}`}
                        >
                            <Thumb url={m.url} className="aspect-square h-auto w-full" />
                            <span className="mt-1 block truncate text-[11px] text-neutral-500">{m.fileName}</span>
                        </button>
                    ))}
                </div>
                {multiple && (
                    <div className="flex justify-end gap-2 border-t border-neutral-200 p-3">
                        <button className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn-primary" disabled={!picked.length} onClick={() => onPick(picked)}>Add {picked.length || ''}</button>
                    </div>
                )}
            </div>
        </div>
    );
}
