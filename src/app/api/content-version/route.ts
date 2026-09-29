import { connection } from 'next/server';
import { getContentVersion } from '@/lib/content/server';

/**
 * Current content version (bumped by every admin save). Open pages poll this to know
 * when to refresh. One single-row query; never cached.
 */
export async function GET() {
    await connection();
    return Response.json(
        { version: await getContentVersion() },
        { headers: { 'cache-control': 'no-store, max-age=0' } }
    );
}
