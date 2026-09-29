import 'server-only';
import { PORTFOLIO_URL } from './nav';

/**
 * Tells the public site that content changed.
 *
 * 1. POST /api/revalidate expires the site's content cache.
 * 2. GET /api/content-version makes the site reload the content right away, while
 *    the database is awake from the write we just did — so the first visitor after
 *    a save is served from the cache instead of waiting on the database.
 *
 * Returns a warning for the admin UI when the site could not be reached; the change
 * is saved either way and will appear at the next scheduled refresh.
 */
async function call(url: string, init: RequestInit, ms: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' });
    } finally {
        clearTimeout(timer);
    }
}

export async function publishToSite(): Promise<string | undefined> {
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret) return 'Saved, but REVALIDATE_SECRET is not set on the admin project, so the site will only pick this up at its next scheduled refresh (within 6 hours).';
    try {
        const res = await call(`${PORTFOLIO_URL}/api/revalidate`, {
            method: 'POST',
            headers: { authorization: `Bearer ${secret}` },
        }, 10_000);
        if (!res.ok) {
            const body = (await res.json().catch(() => null)) as { error?: unknown } | null;
            return `Saved, but the site refused the update (${res.status}${typeof body?.error === 'string' ? `: ${body.error}` : ''}). It will appear at the next scheduled refresh.`;
        }
    } catch (err) {
        console.error('[publish] revalidate failed:', err);
        return 'Saved, but the site could not be reached to refresh. It will appear at the next scheduled refresh.';
    }
    // Warm the cache. A failure here is harmless: the next visitor refills it instead.
    await call(`${PORTFOLIO_URL}/api/content-version`, {}, 20_000).catch(() => undefined);
    return undefined;
}
