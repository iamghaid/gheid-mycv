'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { SINGLETONS } from '@shared/content/schema';
import type { SingletonKey } from '@shared/content/types';
import { saveSingletonAction } from '@/app/actions';
import { FieldBlock } from './fields';

export function SingletonEditor({ singleton, initial, children }: { singleton: SingletonKey; initial: Record<string, unknown>; children?: React.ReactNode }) {
    const config = SINGLETONS[singleton];
    const router = useRouter();
    const [data, setData] = useState(initial);
    const [dirty, setDirty] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<{ message: string; field?: string } | null>(null);
    const [pending, start] = useTransition();

    const save = () => start(async () => {
        setError(null);
        const res = await saveSingletonAction(config.key, data);
        if (!res.ok) return setError({ message: res.error, field: res.field });
        setDirty(false);
        setSaved(true);
        router.refresh();
    });

    return (
        <div className="space-y-6 pb-24">
            <header>
                <h1 className="text-2xl font-semibold">{config.label} <span className="text-lg font-normal text-neutral-400">· {config.labelAr}</span></h1>
                <p className="mt-1 text-sm text-neutral-500">{config.description}</p>
            </header>
            {children}
            <div className="card grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                {config.fields.map((f) => (
                    <FieldBlock key={f.key} field={f} value={data[f.key]} error={error?.field === f.key ? error.message : undefined}
                        onChange={(v) => { setData((d) => ({ ...d, [f.key]: v })); setDirty(true); setSaved(false); }} />
                ))}
            </div>
            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur lg:left-64">
                <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-4 py-3 sm:px-8">
                    {error && <span className="text-sm text-red-600">{error.message}</span>}
                    {saved && !dirty && <span className="inline-flex items-center gap-1 text-sm text-emerald-700"><Check className="h-4 w-4" /> Saved — live on the site</span>}
                    <button type="button" className="btn-primary" onClick={save} disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />} Save</button>
                </div>
            </div>
        </div>
    );
}
