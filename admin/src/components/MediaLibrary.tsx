'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, ExternalLink, Search, Trash2 } from 'lucide-react';
import type { MediaRecord } from '@shared/content/types';
import { deleteMediaAction, mediaUsageAction } from '@/app/actions';
import { Thumb, UploadButton, isImageUrl } from './media';
import { previewUrl } from '@/lib/nav';

const fmtSize = (n: number) => (n ? (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`) : '');

export function MediaLibrary({ media }: { media: MediaRecord[] }) {
    const router = useRouter();
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState<'all' | 'images' | 'documents'>('all');
    const [selected, setSelected] = useState<MediaRecord | null>(null);
    const [usage, setUsage] = useState<{ label: string; href: string }[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, start] = useTransition();

    const visible = useMemo(() => media.filter((m) => {
        const img = isImageUrl(m.url);
        if (filter === 'images' && !img) return false;
        if (filter === 'documents' && img) return false;
        return !q || m.fileName.toLowerCase().includes(q.toLowerCase());
    }), [media, q, filter]);

    const open = (m: MediaRecord) => {
        setSelected(m);
        setUsage(null);
        setError(null);
        mediaUsageAction(m.url).then(setUsage);
    };

    const remove = (m: MediaRecord) => {
        if (!confirm(`Delete ${m.fileName}? ${m.source === 'upload' ? 'The file is removed from storage.' : ''}`)) return;
        start(async () => {
            const res = await deleteMediaAction(m.id);
            if (!res.ok) return setError(res.error);
            setSelected(null);
            router.refresh();
        });
    };

    return (
        <div className="space-y-5">
            <header className="flex flex-wrap items-end gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Media library <span className="text-lg font-normal text-neutral-400">· مكتبة الوسائط</span></h1>
                    <p className="mt-1 text-sm text-neutral-500">Every image and document. Uploading the same file twice reuses the existing copy.</p>
                </div>
                <div className="ml-auto"><UploadButton multiple label="Upload files" onUploaded={() => router.refresh()} /></div>
            </header>
            <div className="flex flex-wrap gap-2">
                <div className="relative w-56">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                    <input className="input pl-8" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
                {(['all', 'images', 'documents'] as const).map((f) => (
                    <button key={f} className={f === filter ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {visible.map((m) => (
                    <button key={m.id} onClick={() => open(m)} className={`card p-1.5 text-left transition hover:border-neutral-400 ${selected?.id === m.id ? 'ring-2 ring-neutral-900' : ''}`}>
                        <Thumb url={m.url} className="aspect-square h-auto w-full" />
                        <p className="mt-1 truncate px-0.5 text-xs">{m.fileName}</p>
                        <p className="px-0.5 text-[10px] text-neutral-400">{m.source === 'bundled' ? 'Bundled with site' : fmtSize(m.size)}</p>
                    </button>
                ))}
                {!visible.length && <p className="col-span-full text-sm text-neutral-500">No files.</p>}
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={() => setSelected(null)}>
                    <div className="card w-full max-w-lg space-y-4 p-5" onClick={(e) => e.stopPropagation()}>
                        {isImageUrl(selected.url) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewUrl(selected.url)} alt="" className="max-h-72 w-full rounded-lg bg-neutral-100 object-contain" />
                        ) : <Thumb url={selected.url} className="h-24 w-24" />}
                        <div>
                            <p className="font-medium">{selected.fileName}</p>
                            <p className="text-xs text-neutral-500">{selected.contentType} {fmtSize(selected.size)}</p>
                        </div>
                        <div className="flex gap-2">
                            <input readOnly className="input text-xs" value={selected.url} />
                            <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(selected.url)} aria-label="Copy URL"><Copy className="h-4 w-4" /></button>
                            <a className="btn-secondary" href={previewUrl(selected.url)} target="_blank" rel="noreferrer" aria-label="Open"><ExternalLink className="h-4 w-4" /></a>
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">Used by</p>
                            {usage === null ? <p className="text-neutral-500">Checking…</p> : usage.length ? (
                                <ul className="mt-1 list-disc pl-5">{usage.map((u) => <li key={u.href}><a className="underline" href={u.href}>{u.label}</a></li>)}</ul>
                            ) : <p className="text-neutral-500">Not used anywhere — safe to delete.</p>}
                        </div>
                        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                        <div className="flex justify-end gap-2">
                            <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
                            <button className="btn-danger" disabled={pending || !!usage?.length} onClick={() => remove(selected)}><Trash2 className="h-4 w-4" /> Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
