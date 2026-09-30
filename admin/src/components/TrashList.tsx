'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RotateCcw, Trash2 } from 'lucide-react';
import { deleteForeverAction, restoreFromTrashAction } from '@/app/actions';
import { Thumb } from './media';
import { formatRiyadh } from './history';

export type TrashEntry = {
    targetId: string; collection: string; collectionLabel: string; title: string; image: string; deletedAt: string; daysLeft: number;
};

export function TrashList({ entries }: { entries: TrashEntry[] }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<{ text: string; href?: string } | null>(null);
    const [pending, start] = useTransition();

    const restore = (e: TrashEntry) => start(async () => {
        setError(null);
        const res = await restoreFromTrashAction(e.targetId);
        if (!res.ok) return setError(res.error);
        setNotice({ text: res.warning ? `Restored “${e.title}”. ${res.warning}` : `Restored “${e.title}”.`, href: res.data?.href });
        router.refresh();
    });
    const destroy = (e: TrashEntry) => {
        if (!confirm(`Delete “${e.title}” forever? This cannot be undone.`)) return;
        start(async () => {
            setError(null);
            const res = await deleteForeverAction(e.targetId);
            if (!res.ok) return setError(res.error);
            setNotice({ text: `Deleted “${e.title}” permanently.` });
            router.refresh();
        });
    };

    return (
        <div className="space-y-3">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {notice && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    {notice.text} {notice.href && <Link className="font-medium underline" href={notice.href}>Open it</Link>}
                </p>
            )}
            <ul className="card divide-y divide-neutral-100">
                {!entries.length && <li className="p-6 text-center text-sm text-neutral-500">The Trash is empty.</li>}
                {entries.map((e) => (
                    <li key={e.targetId} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                        {e.image && <Thumb url={e.image} className="h-11 w-11 shrink-0" />}
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{e.title}</p>
                            <p className="truncate text-xs text-neutral-500">
                                {e.collectionLabel} · deleted {formatRiyadh(e.deletedAt)} · removed in {e.daysLeft} {e.daysLeft === 1 ? 'day' : 'days'}
                            </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <button className="btn-secondary px-2.5 py-1.5 text-xs" disabled={pending} onClick={() => restore(e)}>
                                <RotateCcw className="h-3.5 w-3.5" /> Restore · استرجاع
                            </button>
                            <button className="btn-danger px-2.5 py-1.5 text-xs" disabled={pending} onClick={() => destroy(e)}>
                                <Trash2 className="h-3.5 w-3.5" /> Delete forever
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
