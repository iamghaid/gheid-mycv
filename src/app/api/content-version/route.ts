import { connection } from 'next/server';
import { getSiteContent } from '@/lib/content/server';

/**
 * Version of the content the site is currently serving. Open pages poll this to know
 * when to refresh, and the admin requests it right after a save to warm the cache.
 * Served from the content cache: polling never touches (or wakes) the database.
 */
export async function GET() {
    await connection();
    const { version } = await getSiteContent();
    return Response.json({ version }, { headers: { 'cache-control': 'no-store, max-age=0' } });
}
