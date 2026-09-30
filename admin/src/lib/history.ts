import type { Field } from '@shared/content/schema';

/**
 * Turns two states of a record into "what changed" for the History panel: the
 * labels of changed fields at a glance, and readable before/after values for the
 * preview.
 */
export type State = { data: Record<string, unknown>; published: boolean | null };

export interface FieldChange {
    label: string;
    before: string;
    after: string;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const fileName = (u: string) => decodeURIComponent(u.split('/').pop() || u);

function l10n(v: unknown): string {
    const x = (v ?? {}) as { en?: unknown; ar?: unknown };
    const part = (s: unknown) => (Array.isArray(s) ? s.join(' • ') : String(s ?? ''));
    const en = part(x.en);
    const ar = part(x.ar);
    if (!en && !ar) return '';
    return [en && `EN: ${en}`, ar && `AR: ${ar}`].filter(Boolean).join('\n');
}

/** A readable, bounded rendering of one field's value. */
export function formatValue(field: Field, v: unknown): string {
    let out: string;
    switch (field.type) {
        case 'l10n':
        case 'l10nText':
        case 'l10nList':
        case 'l10nFile':
            out = l10n(v);
            break;
        case 'image':
        case 'file':
            out = v ? fileName(String(v)) : '';
            break;
        case 'images':
        case 'files':
            out = Array.isArray(v) ? v.map((u) => fileName(String(u))).join('\n') : '';
            break;
        case 'tags':
            out = Array.isArray(v) ? v.join(', ') : '';
            break;
        case 'boolean':
            out = v ? 'Yes' : 'No';
            break;
        case 'links':
            out = Array.isArray(v) ? v.map((l: { label?: { en?: string }; url?: string }) => `${l.label?.en || ''} ${l.url || ''}`.trim()).join('\n') : '';
            break;
        case 'challenges':
            out = Array.isArray(v) ? v.map((c: { problem?: { en?: string } }) => `• ${c.problem?.en || ''}`).join('\n') : '';
            break;
        case 'social':
            out = Array.isArray(v) ? v.map((s: { platform?: string; url?: string }) => `${s.platform}: ${s.url}`).join('\n') : '';
            break;
        case 'languages':
            out = Array.isArray(v) ? v.map((l: { name?: { en?: string }; level?: { en?: string } }) => `${l.name?.en} (${l.level?.en})`).join(', ') : '';
            break;
        case 'select':
            out = field.options?.find((o) => o.value === v)?.label ?? String(v ?? '');
            break;
        default:
            out = v == null ? '' : String(v);
    }
    return out.length > 1200 ? `${out.slice(0, 1200)}…` : out;
}

export function changes(fields: Field[], before: State, after: State): FieldChange[] {
    const list: FieldChange[] = [];
    if (before.published !== null && after.published !== null && before.published !== after.published) {
        list.push({ label: 'Published', before: before.published ? 'Visible' : 'Hidden', after: after.published ? 'Visible' : 'Hidden' });
    }
    for (const f of fields) {
        if (same(before.data[f.key], after.data[f.key])) continue;
        list.push({ label: f.label, before: formatValue(f, before.data[f.key]), after: formatValue(f, after.data[f.key]) });
    }
    return list;
}
