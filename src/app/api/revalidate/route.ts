import { createHash, timingSafeEqual } from 'crypto';
import { revalidateTag } from 'next/cache';
import { CONTENT_TAG } from '@/lib/content/server';

/**
 * POST /api/revalidate — called by the admin app after every save.
 *
 * Expires the cached content immediately (`expire: 0`: the next read refills it
 * from the database instead of serving the old copy). The admin then warms the
 * cache by requesting /api/content-version, so visitors never do the refill.
 *
 * Protected by REVALIDATE_SECRET, shared between the two Vercel projects.
 */
const digest = (s: string) => createHash('sha256').update(s, 'utf8').digest();

export async function POST(request: Request) {
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret || secret.length < 32) {
        return Response.json({ ok: false, error: 'REVALIDATE_SECRET is not configured on the portfolio.' }, { status: 500 });
    }
    const given = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
    if (!timingSafeEqual(digest(given), digest(secret))) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    revalidateTag(CONTENT_TAG, { expire: 0 });
    return Response.json({ ok: true });
}
