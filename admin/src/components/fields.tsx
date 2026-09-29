'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Library, Plus, Trash2, X } from 'lucide-react';
import type { Field } from '@shared/content/schema';
import { MediaPicker, Thumb, UploadButton, kindOf } from './media';
import { previewUrl } from '@/lib/nav';

type L10n = { en: string; ar: string };
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/* ------------------------------------------------------------ helpers */

function move<T>(arr: T[], from: number, to: number): T[] {
    if (to < 0 || to >= arr.length) return arr;
    const next = [...arr];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    return next;
}

/** Reorderable list: drag the handle, or use the arrow buttons (keyboard/touch). */
export function SortableList<T>({ items, onChange, render, empty }: {
    items: T[];
    onChange: (next: T[]) => void;
    render: (item: T, index: number, update: (v: T) => void) => React.ReactNode;
    empty?: string;
}) {
    const [drag, setDrag] = useState<number | null>(null);
    if (!items.length) return empty ? <p className="text-sm text-neutral-400">{empty}</p> : null;
    return (
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li
                    key={i}
                    draggable
                    onDragStart={() => setDrag(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (drag !== null) onChange(move(items, drag, i)); setDrag(null); }}
                    onDragEnd={() => setDrag(null)}
                    className={`flex items-start gap-2 rounded-lg border bg-white p-2 ${drag === i ? 'border-neutral-900 opacity-60' : 'border-neutral-200'}`}
                >
                    <GripVertical className="mt-2 h-4 w-4 shrink-0 cursor-grab text-neutral-400" aria-hidden />
                    <div className="min-w-0 flex-1">{render(item, i, (v) => onChange(items.map((x, j) => (j === i ? v : x))))}</div>
                    <div className="flex shrink-0 flex-col gap-0.5">
                        <button type="button" className="btn-ghost p-1" onClick={() => onChange(move(items, i, i - 1))} disabled={i === 0} aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
                        <button type="button" className="btn-ghost p-1" onClick={() => onChange(move(items, i, i + 1))} disabled={i === items.length - 1} aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
                        <button type="button" className="btn-ghost p-1 text-red-600" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function BiInput({ value, onChange, multiline }: { value: L10n; onChange: (v: L10n) => void; multiline?: boolean }) {
    const v = value ?? { en: '', ar: '' };
    const Tag = multiline ? 'textarea' : 'input';
    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {(['en', 'ar'] as const).map((lang) => (
                <div key={lang} className="relative">
                    <span className="pointer-events-none absolute top-2 text-[10px] font-semibold uppercase text-neutral-400 ltr:right-2 rtl:left-2" style={lang === 'ar' ? { left: 8 } : { right: 8 }}>{lang === 'en' ? 'EN' : 'ع'}</span>
                    <Tag
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        className={`input ${multiline ? 'min-h-[110px] resize-y' : ''} ${lang === 'ar' ? 'pl-8' : 'pr-8'}`}
                        value={v[lang]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...v, [lang]: e.target.value })}
                        placeholder={lang === 'en' ? 'English' : 'العربية'}
                    />
                </div>
            ))}
        </div>
    );
}

function LinesInput({ value, onChange, dir }: { value: string[]; onChange: (v: string[]) => void; dir: 'ltr' | 'rtl' }) {
    const [draft, setDraft] = useState('');
    const add = () => { if (draft.trim()) { onChange([...(value ?? []), draft.trim()]); setDraft(''); } };
    return (
        <div className="space-y-2" dir={dir}>
            <SortableList items={value ?? []} onChange={onChange} render={(item, _i, update) => (
                <input className="input" dir={dir} value={item} onChange={(e) => update(e.target.value)} />
            )} />
            <div className="flex gap-2">
                <input className="input" dir={dir} value={draft} placeholder={dir === 'rtl' ? 'أضيفي سطرًا…' : 'Add a line…'}
                    onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
                <button type="button" className="btn-secondary" onClick={add}><Plus className="h-4 w-4" /></button>
            </div>
        </div>
    );
}

function TagsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    const [draft, setDraft] = useState('');
    const tags = value ?? [];
    const add = () => {
        const parts = draft.split(',').map((s) => s.trim()).filter(Boolean).filter((s) => !tags.includes(s));
        if (parts.length) onChange([...tags, ...parts]);
        setDraft('');
    };
    return (
        <div className="rounded-lg border border-neutral-300 bg-white p-2">
            <div className="flex flex-wrap gap-1.5">
                {tags.map((t, i) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-xs">
                        <button type="button" className="text-neutral-400 hover:text-neutral-700" onClick={() => onChange(tags.filter((_, j) => j !== i))} aria-label={`Remove ${t}`}><X className="h-3 w-3" /></button>
                        {t}
                        {i > 0 && <button type="button" className="text-neutral-400 hover:text-neutral-700" onClick={() => onChange(move(tags, i, i - 1))} aria-label="Move left">‹</button>}
                    </span>
                ))}
                <input
                    className="min-w-[140px] flex-1 px-1 text-sm outline-none"
                    value={draft}
                    placeholder="Type and press Enter (comma for several)"
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
                    onBlur={add}
                />
            </div>
        </div>
    );
}

/* -------------------------------------------------------- media fields */

function SingleMedia({ value, onChange, accept }: { value: string; onChange: (v: string) => void; accept?: string }) {
    const [picking, setPicking] = useState(false);
    return (
        <div className="flex flex-wrap items-start gap-3">
            {value ? (
                <a href={previewUrl(value)} target="_blank" rel="noreferrer"><Thumb url={value} className="h-24 w-24" /></a>
            ) : (
                <Thumb url="" className="h-24 w-24" />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                    <UploadButton accept={accept} label={value ? 'Replace' : 'Upload'} onUploaded={(m) => onChange(m[0].url)} />
                    <button type="button" className="btn-secondary" onClick={() => setPicking(true)}><Library className="h-4 w-4" /> Library</button>
                    {value && <button type="button" className="btn-danger" onClick={() => onChange('')}><Trash2 className="h-4 w-4" /> Remove</button>}
                </div>
                <input className="input text-xs" value={value ?? ''} placeholder="…or paste a URL" onChange={(e) => onChange(e.target.value)} />
            </div>
            {picking && <MediaPicker kind={kindOf(accept)} onClose={() => setPicking(false)} onPick={(u) => { onChange(u[0]); setPicking(false); }} />}
        </div>
    );
}

function MultiMedia({ value, onChange, accept }: { value: string[]; onChange: (v: string[]) => void; accept?: string }) {
    const [picking, setPicking] = useState(false);
    const list = value ?? [];
    return (
        <div className="space-y-2">
            <SortableList
                items={list}
                onChange={onChange}
                empty="No files yet."
                render={(url, i) => (
                    <div className="flex items-center gap-3">
                        <a href={previewUrl(url)} target="_blank" rel="noreferrer"><Thumb url={url} className="h-14 w-14" /></a>
                        <div className="min-w-0">
                            <p className="truncate text-sm">{decodeURIComponent(url.split('/').pop() ?? url)}</p>
                            {i === 0 && <p className="text-xs text-neutral-500">First — used as the main image</p>}
                        </div>
                    </div>
                )}
            />
            <div className="flex flex-wrap gap-2">
                <UploadButton accept={accept} multiple label="Upload" onUploaded={(m) => onChange([...list, ...m.map((x) => x.url).filter((u) => !list.includes(u))])} />
                <button type="button" className="btn-secondary" onClick={() => setPicking(true)}><Library className="h-4 w-4" /> Library</button>
            </div>
            {picking && (
                <MediaPicker kind={kindOf(accept)} multiple onClose={() => setPicking(false)}
                    onPick={(u) => { onChange([...list, ...u.filter((x) => !list.includes(x))]); setPicking(false); }} />
            )}
        </div>
    );
}

/* ------------------------------------------------------------ renderer */

export function FieldInput({ field, value, onChange }: { field: Field; value: Any; onChange: (v: Any) => void }) {
    switch (field.type) {
        case 'text':
        case 'slug':
        case 'email':
        case 'url':
            return (
                <input
                    className="input"
                    dir="ltr"
                    type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                    value={value ?? ''}
                    placeholder={field.type === 'url' ? 'https://' : undefined}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        case 'number':
            return <input className="input" type="number" step="any" value={value ?? 0} onChange={(e) => onChange(e.target.valueAsNumber)} />;
        case 'date':
            return (
                <div className="flex gap-2">
                    <input className="input" type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
                    {value && <button type="button" className="btn-ghost" onClick={() => onChange('')} aria-label="Clear date"><X className="h-4 w-4" /></button>}
                </div>
            );
        case 'boolean':
            return (
                <label className="inline-flex cursor-pointer items-center gap-2 pt-1 text-sm">
                    <input type="checkbox" className="h-4 w-4 accent-neutral-900" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
                    {value ? 'Yes' : 'No'}
                </label>
            );
        case 'color':
            return (
                <div className="flex items-center gap-2">
                    <input type="color" className="h-10 w-14 cursor-pointer rounded border border-neutral-300" value={value || '#1E6B52'} onChange={(e) => onChange(e.target.value)} />
                    <input className="input font-mono" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
                </div>
            );
        case 'select':
            return (
                <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
                    {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            );
        case 'l10n':
            return <BiInput value={value} onChange={onChange} />;
        case 'l10nText':
            return <BiInput value={value} onChange={onChange} multiline />;
        case 'l10nList':
            return (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div><p className="mb-1 text-xs text-neutral-500">English</p><LinesInput dir="ltr" value={value?.en ?? []} onChange={(en) => onChange({ ...value, en })} /></div>
                    <div><p className="mb-1 text-xs text-neutral-500">العربية</p><LinesInput dir="rtl" value={value?.ar ?? []} onChange={(ar) => onChange({ ...value, ar })} /></div>
                </div>
            );
        case 'l10nFile':
            return (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div><p className="mb-1 text-xs text-neutral-500">English version</p><SingleMedia accept={field.accept} value={value?.en ?? ''} onChange={(en) => onChange({ ...value, en })} /></div>
                    <div><p className="mb-1 text-xs text-neutral-500">النسخة العربية (optional)</p><SingleMedia accept={field.accept} value={value?.ar ?? ''} onChange={(ar) => onChange({ ...value, ar })} /></div>
                </div>
            );
        case 'tags':
            return <TagsInput value={value} onChange={onChange} />;
        case 'image':
        case 'file':
            return <SingleMedia accept={field.accept} value={value ?? ''} onChange={onChange} />;
        case 'images':
        case 'files':
            return <MultiMedia accept={field.accept} value={value ?? []} onChange={onChange} />;
        case 'links':
            return (
                <ObjectList value={value} onChange={onChange} blank={{ label: { en: '', ar: '' }, url: '' }} addLabel="Add link"
                    render={(item, update) => (
                        <div className="space-y-2">
                            <BiInput value={item.label} onChange={(label) => update({ ...item, label })} />
                            <input className="input" dir="ltr" placeholder="https://" value={item.url} onChange={(e) => update({ ...item, url: e.target.value })} />
                        </div>
                    )} />
            );
        case 'challenges':
            return (
                <ObjectList value={value} onChange={onChange} blank={{ problem: { en: '', ar: '' }, solution: { en: '', ar: '' } }} addLabel="Add challenge"
                    render={(item, update) => (
                        <div className="space-y-2">
                            <p className="text-xs text-neutral-500">Problem</p>
                            <BiInput multiline value={item.problem} onChange={(problem) => update({ ...item, problem })} />
                            <p className="text-xs text-neutral-500">Solution</p>
                            <BiInput multiline value={item.solution} onChange={(solution) => update({ ...item, solution })} />
                        </div>
                    )} />
            );
        case 'social':
            return (
                <ObjectList value={value} onChange={onChange} blank={{ platform: '', url: '', username: '' }} addLabel="Add social link"
                    render={(item, update) => (
                        <div className="grid gap-2 sm:grid-cols-3">
                            <input className="input" list="platforms" placeholder="Platform (GitHub, LinkedIn…)" value={item.platform} onChange={(e) => update({ ...item, platform: e.target.value })} />
                            <input className="input" dir="ltr" placeholder="https://" value={item.url} onChange={(e) => update({ ...item, url: e.target.value })} />
                            <input className="input" placeholder="Username (optional)" value={item.username ?? ''} onChange={(e) => update({ ...item, username: e.target.value })} />
                            <datalist id="platforms">{['GitHub', 'LinkedIn', 'Instagram', 'X', 'YouTube', 'Behance', 'Dribbble', 'Website'].map((p) => <option key={p} value={p} />)}</datalist>
                        </div>
                    )} />
            );
        case 'languages':
            return (
                <ObjectList value={value} onChange={onChange} blank={{ name: { en: '', ar: '' }, level: { en: '', ar: '' } }} addLabel="Add language"
                    render={(item, update) => (
                        <div className="space-y-2">
                            <BiInput value={item.name} onChange={(name) => update({ ...item, name })} />
                            <BiInput value={item.level} onChange={(level) => update({ ...item, level })} />
                        </div>
                    )} />
            );
    }
}

function ObjectList({ value, onChange, render, blank, addLabel }: {
    value: Any[]; onChange: (v: Any[]) => void; render: (item: Any, update: (v: Any) => void) => React.ReactNode; blank: Any; addLabel: string;
}) {
    const list = value ?? [];
    return (
        <div className="space-y-2">
            <SortableList items={list} onChange={onChange} render={(item, _i, update) => render(item, update)} />
            <button type="button" className="btn-secondary" onClick={() => onChange([...list, structuredClone(blank)])}><Plus className="h-4 w-4" /> {addLabel}</button>
        </div>
    );
}

export function FieldBlock({ field, value, onChange, error }: { field: Field; value: Any; onChange: (v: Any) => void; error?: string }) {
    return (
        <div className={field.half ? '' : 'sm:col-span-2'} id={`field-${field.key}`}>
            <div className="label">
                <span>{field.label}{field.required && <span className="text-red-500"> *</span>}</span>
                <span className="label-ar" dir="rtl">{field.labelAr}</span>
            </div>
            <FieldInput field={field} value={value} onChange={onChange} />
            {field.help && <p className="help">{field.help}</p>}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
