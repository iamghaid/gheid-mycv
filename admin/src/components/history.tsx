'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { ChevronDown, ChevronRight, Eye, History, Loader2, RotateCcw, Undo2 } from 'lucide-react';
import {
    listRevisionsAction, restoreRevisionAction, revisionPreviewAction,
    type RevisionPreview, type RevisionSummary,
} from '@/app/actions';

const riyadh = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
export const formatRiyadh = (iso: string) => `${riyadh.format(new Date(iso))} (Riyadh)`;

/* ----------------------------------------------------------- save flash */

/**
 * Editors remount after a save (they are keyed by the record's update time), so the
 * save result — warning and the Undo target — is handed over through sessionStorage.
 */
export type Flash = { warning: string | null; undo: { revisionId: string; until: number } | null };
const FLASH_KEY = 'admin-save-result';
export const UNDO_MS = 15_000;

export function writeFlash(scope: string, warning: string | undefined, revisionId: string | null | undefined) {
    const flash: Flash = { warning: warning ?? null, undo: revisionId ? { revisionId, until: Date.now() + UNDO_MS } : null };
    try { sessionStorage.setItem(FLASH_KEY, JSON.stringify({ scope, at: Date.now(), ...flash })); } catch { /* storage unavailable */ }
    return flash;
}

export function useFlash(scope: string) {
    const [flash, setFlash] = useState<Flash | null>(null);
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(FLASH_KEY);
            if (!raw) return;
            sessionStorage.removeItem(FLASH_KEY);
            const f = JSON.parse(raw) as Flash & { scope: string; at: number };
            // Only a save that just happened (not one left over from an earlier visit).
            if (f.scope === scope && Date.now() - f.at < 30_000) setFlash({ warning: f.warning, undo: f.undo && f.undo.until > Date.now() ? f.undo : null });
        } catch { /* ignore */ }
    }, [scope]);
    return [flash, setFlash] as const;
}

/* ----------------------------------------------------------------- undo */

/** "Undo" for a few seconds after a save; restores the state before that save. */
export function UndoButton({ undo, onDone, onError }: {
    undo: { revisionId: string; until: number } | null;
    onDone: (revisionId: string | null, warning?: string) => void;
    onError: (message: string) => void;
}) {
    const [left, setLeft] = useState(0);
    const [pending, start] = useTransition();
    useEffect(() => {
        if (!undo) return setLeft(0);
        const tick = () => setLeft(Math.max(0, Math.ceil((undo.until - Date.now()) / 1000)));
        tick();
        const t = setInterval(tick, 500);
        return () => clearInterval(t);
    }, [undo]);
    if (!undo || (left <= 0 && !pending)) return null;
    return (
        <button
            type="button"
            className="btn-secondary whitespace-nowrap"
            disabled={pending}
            onClick={() => start(async () => {
                const res = await restoreRevisionAction(undo.revisionId);
                if (!res.ok) return onError(res.error);
                onDone(res.data?.revisionId ?? null, res.warning);
            })}
        >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />} Undo · تراجع
            {!pending && <span className="tabular-nums text-neutral-400">{left}s</span>}
        </button>
    );
}

/* -------------------------------------------------------------- history */

export function HistoryPanel({ target, refreshKey, disabled, onRestored }: {
    target: { kind: 'item' | 'singleton'; id: string };
    /** Changes whenever the record is saved, so the list reloads. */
    refreshKey: string;
    /** Set while there are unsaved edits: restoring would discard them. */
    disabled?: boolean;
    onRestored: (revisionId: string | null, warning?: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<RevisionSummary[] | null>(null);
    const [preview, setPreview] = useState<Record<string, RevisionPreview | 'loading' | null>>({});
    const [error, setError] = useState<string | null>(null);
    const [pending, start] = useTransition();

    const load = useCallback(() => {
        listRevisionsAction(target).then(setItems).catch(() => setError('Could not load the history.'));
    }, [target]);
    useEffect(() => { if (open) load(); }, [open, load, refreshKey]);

    const togglePreview = async (id: string) => {
        if (preview[id]) return setPreview((p) => ({ ...p, [id]: null }));
        setPreview((p) => ({ ...p, [id]: 'loading' }));
        const data = await revisionPreviewAction(id);
        setPreview((p) => ({ ...p, [id]: data }));
    };

    const restore = (r: RevisionSummary) => {
        if (disabled && !confirm('You have unsaved changes. Restoring will discard them. Continue?')) return;
        if (!disabled && !confirm(`Restore the version from before ${formatRiyadh(r.createdAt)}?\nThe current content is kept in the history, so you can undo this.`)) return;
        start(async () => {
            setError(null);
            const res = await restoreRevisionAction(r.id);
            if (!res.ok) return setError(res.error);
            onRestored(res.data?.revisionId ?? null, res.warning);
        });
    };

    return (
        <section className="card">
            <button type="button" className="flex w-full items-center gap-2 px-5 py-4 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <History className="h-4 w-4 text-neutral-500" />
                <span className="font-medium">History</span>
                <span className="text-sm text-neutral-400">· السجل</span>
                {items && <span className="ml-auto text-xs text-neutral-500">{items.length} {items.length === 1 ? 'version' : 'versions'}</span>}
            </button>
            {open && (
                <div className="border-t border-neutral-100 px-5 pb-5 pt-3">
                    <p className="mb-3 text-xs text-neutral-500">Each entry is how this looked <em>before</em> a change. Restoring it is a normal save, so it can be undone too. The last 30 versions are kept.</p>
                    {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                    {!items && <p className="text-sm text-neutral-500"><Loader2 className="inline h-4 w-4 animate-spin" /> Loading…</p>}
                    {items?.length === 0 && <p className="text-sm text-neutral-500">No earlier versions yet. They appear after the first save.</p>}
                    <ol className="space-y-2">
                        {items?.map((r) => {
                            const p = preview[r.id];
                            return (
                                <li key={r.id} className="rounded-lg border border-neutral-200">
                                    <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                                        <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
                                            <p className="text-sm font-medium">{formatRiyadh(r.createdAt)}</p>
                                            <p className="text-xs text-neutral-500 sm:truncate">
                                                {r.changed.length ? `Changed: ${r.changed.join(', ')}` : 'Saved without changes'}
                                            </p>
                                        </div>
                                        <button type="button" className="btn-ghost px-2 py-1 text-xs max-sm:-ml-2" onClick={() => togglePreview(r.id)}>
                                            <Eye className="h-3.5 w-3.5" /> {p ? 'Hide' : 'Preview'}
                                        </button>
                                        <button type="button" className="btn-secondary px-2 py-1 text-xs" disabled={pending} onClick={() => restore(r)}>
                                            <RotateCcw className="h-3.5 w-3.5" /> Restore · استرجاع
                                        </button>
                                    </div>
                                    {p === 'loading' && <p className="border-t border-neutral-100 px-3 py-2 text-xs text-neutral-500">Loading…</p>}
                                    {p && p !== 'loading' && <PreviewBody preview={p} />}
                                </li>
                            );
                        })}
                    </ol>
                </div>
            )}
        </section>
    );
}

function PreviewBody({ preview }: { preview: RevisionPreview }) {
    return (
        <div className="space-y-3 border-t border-neutral-100 px-3 py-3 text-sm">
            {preview.changes.length > 0 && (
                <div className="space-y-2">
                    {preview.changes.map((c) => (
                        <div key={c.label}>
                            <p className="text-xs font-semibold text-neutral-600">{c.label}</p>
                            <div className="mt-1 grid gap-2 sm:grid-cols-2">
                                <Value tone="before" text={c.before} />
                                <Value tone="after" text={c.after} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <details>
                <summary className="cursor-pointer text-xs text-neutral-500">Full content of this version</summary>
                <dl className="mt-2 space-y-1.5">
                    {preview.snapshot.map((s) => (
                        <div key={s.label}>
                            <dt className="text-xs text-neutral-500">{s.label}</dt>
                            <dd dir="auto" className="whitespace-pre-wrap break-words text-xs">{s.value}</dd>
                        </div>
                    ))}
                </dl>
            </details>
        </div>
    );
}

function Value({ tone, text }: { tone: 'before' | 'after'; text: string }) {
    return (
        <div className={`rounded-md px-2 py-1.5 text-xs ${tone === 'before' ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-900'}`}>
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide opacity-60">{tone === 'before' ? 'This version' : 'Changed to'}</span>
            <span dir="auto" className="whitespace-pre-wrap break-words">{text || '—'}</span>
        </div>
    );
}
