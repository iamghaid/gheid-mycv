import 'server-only';
import { createHash } from 'crypto';
import { hasDatabase, sql } from '@/lib/content/db';

/**
 * Per-IP limits for the public chatbot, so one visitor can't burn the AI quota.
 *
 * Counters live in Postgres because serverless instances don't share memory. Only
 * /api/chat imports this module, so page rendering never writes to the database.
 * Without a database (local dev) or if it errors, an in-memory counter is used; that
 * is per instance and therefore only best-effort.
 */
export const LIMITS = [
    { name: 'minute', windowMs: 60_000, max: Number(process.env.CHAT_LIMIT_PER_MINUTE) || 10 },
    { name: 'day', windowMs: 86_400_000, max: Number(process.env.CHAT_LIMIT_PER_DAY) || 60 },
] as const;

export interface RateResult {
    ok: boolean;
    /** Seconds until the window that refused the request resets. */
    retryAfter: number;
}

// Visitors' IPs are not stored as-is.
const hashIp = (ip: string) => createHash('sha256').update(`chat:${ip}`).digest('hex').slice(0, 32);

export function clientIp(headers: Headers): string {
    // On Vercel these are set by the platform, not taken from the client.
    return headers.get('x-real-ip') || headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

function buckets(ip: string, now: number) {
    const id = hashIp(ip);
    return LIMITS.map((l) => {
        const start = Math.floor(now / l.windowMs) * l.windowMs;
        return { ...l, key: `${id}:${l.name}:${start}`, resetAt: start + l.windowMs };
    });
}

function verdict(counts: number[], list: ReturnType<typeof buckets>, now: number): RateResult {
    let retryAfter = 0;
    list.forEach((b, i) => {
        if (counts[i] > b.max) retryAfter = Math.max(retryAfter, Math.ceil((b.resetAt - now) / 1000));
    });
    return { ok: retryAfter === 0, retryAfter };
}

let tableReady: Promise<unknown> | null = null;
function ensureTable() {
    // Normally created by the admin's schema setup; this covers a portfolio-only database.
    tableReady ??= sql()`
        create table if not exists chat_rate_limits (
            bucket text primary key,
            count integer not null default 0,
            expires_at timestamptz not null
        )`.catch((err) => {
        tableReady = null;
        throw err;
    });
    return tableReady;
}

async function hitDb(list: ReturnType<typeof buckets>): Promise<number[]> {
    await ensureTable();
    const db = sql();
    const counts: number[] = [];
    for (const b of list) {
        const [row] = await db`
            insert into chat_rate_limits (bucket, count, expires_at)
            values (${b.key}, 1, ${new Date(b.resetAt)})
            on conflict (bucket) do update set count = chat_rate_limits.count + 1
            returning count`;
        counts.push(Number(row.count));
    }
    // Occasionally clear finished windows.
    if (Math.random() < 0.02) db`delete from chat_rate_limits where expires_at < now()`.catch(() => {});
    return counts;
}

const memory = new Map<string, { count: number; resetAt: number }>();
function hitMemory(list: ReturnType<typeof buckets>, now: number): number[] {
    if (memory.size > 10_000) for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
    return list.map((b) => {
        const entry = memory.get(b.key) ?? { count: 0, resetAt: b.resetAt };
        entry.count += 1;
        memory.set(b.key, entry);
        return entry.count;
    });
}

export async function checkChatRate(ip: string): Promise<RateResult> {
    const now = Date.now();
    const list = buckets(ip, now);
    if (hasDatabase()) {
        try {
            return verdict(await hitDb(list), list, now);
        } catch (err) {
            console.error('[Chat] Rate-limit store unavailable, using in-memory limits:', err);
        }
    }
    return verdict(hitMemory(list, now), list, now);
}
