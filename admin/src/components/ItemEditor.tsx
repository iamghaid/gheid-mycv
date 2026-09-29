'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Trash2 } from 'lucide-react';
import { COLLECTIONS } from '@shared/content/schema';
import type { CollectionKey } from '@shared/content/types';
import { deleteItemAction, saveItemAction } from '@/app/actions';
import { FieldBlock } from './fields';

export function ItemEditor({ collection, id, initial, initialPublished }: {
    collection: CollectionKey;
    id: string | null;
    initial: Record<string, unknown>;
    initialPublished: boolean;
}) {
    const config = COLLECTIONS[collection];
    const router = useRouter();
    const [data, setData] = useState(initial);
    const [published, setPublished] = useState(initialPublished);
    const [dirty, setDirty] = useState(false);
    const [error, setError] = useState<{ message: string; field?: string } | null>(null);
    const [saved, setSaved] = useState(false);
    const [pending, start] = useTransition();

    // Warn before leaving with unsaved edits.
    useEffect(() => {
        const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
        window.addEventListener('beforeunload', h);
        return () => window.removeEventListener('beforeunload', h);
    }, [dirty]);

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
        setDirty(false);
        setSaved(true);
        if (!id) router.replace(`/${config.key}/${res.data!.id}`);
        else router.refresh();
    });

    const remove = () => {
        if (!id || !confirm(`Delete this ${config.singular.toLowerCase()}? This cannot be undone.`)) return;
        start(async () => {
            const res = await deleteItemAction(config.key, id);
            if (!res.ok) return setError({ message: res.error });
            setDirty(false);
            router.push(`/${config.key}`);
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

            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur lg:left-64">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-8">
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" className="h-4 w-4 accent-neutral-900" checked={published} onChange={(e) => { setPublished(e.target.checked); setDirty(true); }} />
                        Published <span className="text-neutral-400">(visible on the site)</span>
                    </label>
                    <div className="ml-auto flex items-center gap-2">
                        {error && !error.field && <span className="text-sm text-red-600">{error.message}</span>}
                        {error?.field && <span className="text-sm text-red-600">Please fix the highlighted field.</span>}
                        {saved && !dirty && <span className="inline-flex items-center gap-1 text-sm text-emerald-700"><Check className="h-4 w-4" /> Saved — live on the site</span>}
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
