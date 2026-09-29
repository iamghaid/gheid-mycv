import 'server-only';
import { unstable_cache } from 'next/cache';
import type { SiteContent } from '@shared/content/types';
import seed from '@shared/content/seed.json';
import { fetchContent, fetchVersion, hasDatabase } from './db';

/**
 * The site's content, from the database.
 *
 * Freshness: every change made in the admin bumps `content_meta.version` in the same
 * transaction. Each request reads that one number (a single-row lookup) and the
 * full content is cached *per version*, so a saved change is served on the very next
 * request, with no webhook, rebuild or stale window — while unchanged content is
 * never re-queried.
 *
 * Resilience: without a database (e.g. before one is connected), or if it cannot be
 * reached, the site renders the bundled initial content instead of failing.
 */
const fallback = (): SiteContent => {
    const s = seed as unknown as Omit<SiteContent, 'version'> & { collections: Record<string, unknown[]> };
    const collections = Object.fromEntries(
        Object.entries(s.collections).map(([k, rows]) => [
            k,
            (rows as { id: string; data: unknown; sortOrder: number; published: boolean }[])
                .filter((r) => r.published)
                .map((r) => ({ ...r, collection: k, updatedAt: '' })),
        ])
    ) as SiteContent['collections'];
    return { version: 0, profile: s.profile, resume: s.resume, collections };
};

const cachedContent = unstable_cache(
    async (version: number) => fetchContent(version),
    ['site-content'],
    { tags: ['content'] }
);

export async function getSiteContent(): Promise<SiteContent> {
    if (!hasDatabase()) return fallback();
    try {
        const version = await fetchVersion();
        if (version == null) return fallback();
        return (await cachedContent(version)) ?? fallback();
    } catch (err) {
        console.error('[content] database unavailable, serving bundled content:', (err as Error).message);
        return fallback();
    }
}

export async function getContentVersion(): Promise<number> {
    if (!hasDatabase()) return 0;
    try {
        return (await fetchVersion()) ?? 0;
    } catch {
        return 0;
    }
}
