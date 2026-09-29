'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Plus, Search, Trash2 } from 'lucide-react';
import type { Item } from '@shared/content/types';
import { COLLECTIONS, getPath } from '@shared/content/schema';
import type { CollectionKey } from '@shared/content/types';
import { deleteItemAction, reorderAction, setPublishedAction } from '@/app/actions';
import { Thumb } from './media';

export function CollectionList({ collection, items: initial }: { collection: CollectionKey; items: Item[] }) {
    const config = COLLECTIONS[collection];
    const [items, setItems] = useState(initial);
    const [drag, setDrag] = useState<number | null>(null);
    const [q, setQ] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [, start] = useTransition();

    const title = (it: Item) => String(getPath(it.data, config.listTitle) || getPath(it.data, config.listTitle.replace('.en', '.ar')) || 'Untitled');
    const subtitle = (it: Item) => (config.listSubtitle ? String(getPath(it.data, config.listSubtitle) ?? '') : '');
    const filtered = q ? items.filter((it) => JSON.stringify(it.data).toLowerCase().includes(q.toLowerCase())) : items;

    const persistOrder = (next: Item[]) => {
        const prev = items;
        setItems(next);
        start(async () => {
            const res = await reorderAction(config.key, next.map((x) => x.id));
            if (!res.ok) { setItems(prev); setError(res.error); } else setWarning(res.warning ?? null);
        });
    };
    const move = (from: number, to: number) => {
        if (to < 0 || to >= items.length) return;
        const next = [...items];
        const [x] = next.splice(from, 1);
        next.splice(to, 0, x);
        persistOrder(next);
    };
    const togglePublished = (it: Item) => {
        setItems((all) => all.map((x) => (x.id === it.id ? { ...x, published: !x.published } : x)));
        start(async () => {
            const res = await setPublishedAction(config.key, it.id, !it.published);
            if (!res.ok) setError(res.error); else setWarning(res.warning ?? null);
        });
    };
    const remove = (it: Item) => {
        if (!confirm(`Delete “${title(it)}”? This cannot be undone.`)) return;
        setItems((all) => all.filter((x) => x.id !== it.id));
        start(async () => {
            const res = await deleteItemAction(config.key, it.id);
            if (!res.ok) setError(res.error); else setWarning(res.warning ?? null);
        });
    };

    return (
        <div className="space-y-5">
            <header className="flex flex-wrap items-end gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">{config.label} <span className="text-lg font-normal text-neutral-400">· {config.labelAr}</span></h1>
                    <p className="mt-1 text-sm text-neutral-500">{config.description}</p>
                </div>
                <Link href={`/${config.key}/new`} className="btn-primary ml-auto"><Plus className="h-4 w-4" /> New {config.singular.toLowerCase()}</Link>
            </header>

            <div className="relative max-w-xs">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <input className="input pl-8" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {warning && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{warning}</p>}
            {!q && items.length > 1 && <p className="text-xs text-neutral-500">Drag rows (or use the arrows) to change the order shown on the site.</p>}

            <ul className="card divide-y divide-neutral-100">
                {!filtered.length && <li className="p-6 text-center text-sm text-neutral-500">Nothing here yet.</li>}
                {filtered.map((it) => {
                    const i = items.indexOf(it);
                    return (
                        <li
                            key={it.id}
                            draggable={!q}
                            onDragStart={() => setDrag(i)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => { if (drag !== null && drag !== i) move(drag, i); setDrag(null); }}
                            onDragEnd={() => setDrag(null)}
                            className={`flex items-center gap-3 px-3 py-2.5 ${drag === i ? 'bg-neutral-50 opacity-60' : ''}`}
                        >
                            {!q && <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-neutral-300" aria-hidden />}
                            {config.listImage && <Thumb url={String(getPath(it.data, config.listImage) ?? '')} className="h-11 w-11 shrink-0" />}
                            <Link href={`/${config.key}/${it.id}`} className="min-w-0 flex-1">
                                <p className={`truncate font-medium ${it.published ? '' : 'text-neutral-400'}`}>{title(it)}</p>
                                <p className="truncate text-xs text-neutral-500">{subtitle(it)}{!it.published && ' · Hidden'}</p>
                            </Link>
                            <div className="flex shrink-0 items-center gap-0.5">
                                {!q && <>
                                    <button className="btn-ghost p-1.5" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                                    <button className="btn-ghost p-1.5" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                                </>}
                                <button className="btn-ghost p-1.5" onClick={() => togglePublished(it)} title={it.published ? 'Hide from site' : 'Publish'} aria-label={it.published ? 'Unpublish' : 'Publish'}>
                                    {it.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-neutral-400" />}
                                </button>
                                <button className="btn-ghost p-1.5 text-red-600" onClick={() => remove(it)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
