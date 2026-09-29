import 'server-only';
import { unstable_cache } from 'next/cache';
import type { SiteContent } from '@shared/content/types';
import seed from '@shared/content/seed.json';
import { fetchContent, hasDatabase } from './db';

/**
 * The site's content.
 *
 * Visitors never wait on the database. Content is read from Next's data cache under
 * the `content` tag; the database is only queried when that cache is refilled:
 *
 * - On save: the admin calls POST /api/revalidate, which expires the tag, then
 *   warms it again straight away (the database is awake at that moment, because the
 *   admin just wrote to it). The next visitor gets the new content from the cache.
 * - As a safety net: the entry is refreshed in the background every few hours, in
 *   case a revalidation call from the admin was ever lost. Background refreshes
 *   serve the cached content while they run, so a sleeping database is never on a
 *   visitor's critical path, and a failed refresh keeps the previous content.
 *
 * Fallback: if the cache is empty and the database cannot be reached, the last
 * content this server instance loaded is used; the bundled seed is only a last
 * resort (before any database is connected, or on a cold instance during an outage).
 */
export const CONTENT_TAG = 'content';
const SAFETY_REFRESH_SECONDS = 6 * 60 * 60;

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

class NotInitialisedError extends Error {}

const cachedContent = unstable_cache(
    async () => {
        const content = await fetchContent();
        // Throwing (rather than returning null) keeps an empty result out of the cache,
        // so the site picks the content up as soon as the admin initialises the database.
        if (!content) throw new NotInitialisedError('database has no content yet');
        return content;
    },
    ['site-content-v2'],
    { tags: [CONTENT_TAG], revalidate: SAFETY_REFRESH_SECONDS }
);

const memory = globalThis as unknown as { __lastGoodContent?: SiteContent };

export async function getSiteContent(): Promise<SiteContent> {
    if (!hasDatabase()) return fallback();
    try {
        const content = await cachedContent();
        memory.__lastGoodContent = content;
        return content;
    } catch (err) {
        if (!(err instanceof NotInitialisedError)) {
            console.error('[content] cache empty and database unavailable:', (err as Error).message);
        }
        return memory.__lastGoodContent ?? fallback();
    }
}
