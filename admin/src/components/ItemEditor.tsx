'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Trash2 } from 'lucide-react';
import { COLLECTIONS } from '@shared/content/schema';
import type { CollectionKey } from '@shared/content/types';
import { deleteItemAction, saveItemAction } from '@/app/actions';
import { FieldBlock } from './fields';
import { HistoryPanel, UndoButton, useFlash, writeFlash } from './history';

export function ItemEditor({ collection, id, initial, initialPublished, updatedAt }: {
    collection: CollectionKey;
    id: string | null;
    initial: Record<string, unknown>;
    initialPublished: boolean;
    updatedAt?: string;
}) {
    const config = COLLECTIONS[collection];
    const router = useRouter();
    const [data, setData] = useState(initial);
    const [published, setPublished] = useState(initialPublished);
    const [dirty, setDirty] = useState(false);
    const [error, setError] = useState<{ message: string; field?: string } | null>(null);
    const [pending, start] = useTransition();

    // Save result from before the remount (the page keys this editor by updatedAt).
    const [flash, setFlash] = useFlash(`item:${id}`);
    const [saved, setSaved] = useState(false);
    const warning = flash?.warning ?? null;
    useEffect(() => { if (flash) setSaved(true); }, [flash]);

    /** After any save or restore: hand the result to the remounted editor and reload. */
    const finish = (savedId: string, revisionId: string | null | undefined, warn: string | undefined) => {
        setDirty(false);
        setSaved(true);
        setFlash(writeFlash(`item:${savedId}`, warn, revisionId));
        if (!id) router.replace(`/${config.key}/${savedId}`);
        else router.refresh();
    };

    // Warn before leaving with unsaved edits.
    useEffect(() => {
        const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
        window.addEventListener('beforeunload', h);
        return () => window.removeEventListener('beforeunload', h);
    }, [dirty]);

    const historyTarget = useMemo(() => ({ kind: 'item' as const, id: id ?? '' }), [id]);

    const set = (key: string, value: unknown) => {
        setData((d) => ({ ...d, [key]: value }));
        setDirty(true);
        setSaved(false);
    };

    const save = () => start(async () => {
        setError(null);
        const res = await saveItemAction(config.key, id, data, published);
        if (!res.ok) {
            setError({ message: res.error, field: res.field });
            if (res.field) document.getElementById(`field-${res.field}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        finish(res.data!.id, res.data!.revisionId, res.warning);
    });

    const remove = () => {
        if (!id || !confirm(`Move this ${config.singular.toLowerCase()} to the Trash? It disappears from the site now and can be restored from the Trash for 30 days.`)) return;
        start(async () => {
            const res = await deleteItemAction(config.key, id);
            if (!res.ok) return setError({ message: res.error });
            setDirty(false);
            router.push(`/${config.key}?trashed=${id}&title=${encodeURIComponent('this ' + config.singular.toLowerCase())}`);
        });
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-wrap items-center gap-3">
                <Link href={`/${config.key}`} className="btn-ghost"><ArrowLeft className="h-4 w-4" /> {config.label}</Link>
                <h1 className="text-xl font-semibold">{id ? `Edit ${config.singular.toLowerCase()}` : `New ${config.singular.toLowerCase()}`}</h1>
            </div>

            <div className="card grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                {config.fields.map((f) => (
                    <FieldBlock key={f.key} field={f} value={data[f.key]} onChange={(v) => set(f.key, v)}
                        error={error?.field === f.key ? error.message : undefined} />
                ))}
            </div>

            {id && (
                <HistoryPanel
                    target={historyTarget}
                    refreshKey={updatedAt ?? ''}
                    disabled={dirty}
                    onRestored={(revisionId, warn) => finish(id, revisionId, warn)}
                />
            )}

            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur lg:left-64">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-8">
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" className="h-4 w-4 accent-neutral-900" checked={published} onChange={(e) => { setPublished(e.target.checked); setDirty(true); }} />
                        Published <span className="text-neutral-400">(visible on the site)</span>
                    </label>
                    <div className="ml-auto flex items-center gap-2">
                        {error && !error.field && <span className="text-sm text-red-600">{error.message}</span>}
                        {error?.field && <span className="text-sm text-red-600">Please fix the highlighted field.</span>}
                        {saved && !dirty && !warning && <span className="inline-flex items-center gap-1 text-sm text-emerald-700"><Check className="h-4 w-4" /> Saved — live on the site</span>}
                        {saved && !dirty && warning && <span className="max-w-md text-sm text-amber-700">{warning}</span>}
                        {!dirty && id && (
                            <UndoButton
                                undo={flash?.undo ?? null}
                                onDone={(revisionId, warn) => finish(id, revisionId, warn)}
                                onError={(message) => setError({ message })}
                            />
                        )}
                        {id && <button type="button" className="btn-danger" onClick={remove} disabled={pending}><Trash2 className="h-4 w-4" /> Delete</button>}
                        <button type="button" className="btn-primary" onClick={save} disabled={pending}>
                            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
