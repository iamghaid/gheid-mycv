import { unstable_cache } from 'next/cache';
import { type NextRequest } from 'next/server';
import { getSiteContent } from '@/lib/content/server';
import { checkEmbeddable } from '@/lib/content/embed';
import type { ProjectData } from '@shared/content/types';

/**
 * GET /api/embed-check?slug=<project slug>
 *
 * Only checks the live URL saved on a published project — never an arbitrary URL
 * from the query string — so this cannot be used to make the server fetch
 * other addresses. Results are cached for 12 hours per URL.
 */
const cachedCheck = unstable_cache(
    async (url: string, origin: string) => checkEmbeddable(url, origin),
    ['embed-check'],
    { revalidate: 60 * 60 * 12 }
);

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get('slug') ?? '';
    const content = await getSiteContent();
    const project = content.collections.projects.map((i) => i.data as ProjectData).find((p) => p.slug === slug);
    if (!project?.liveUrl) return Response.json({ embeddable: false, reason: 'no live URL' }, { status: 404 });
    if (project.embedMode === 'off') return Response.json({ embeddable: false, reason: 'disabled in admin' });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const verdict = await cachedCheck(project.liveUrl, origin);
    return Response.json(verdict, { headers: { 'cache-control': 'public, max-age=300' } });
}
