import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

/**
 * Gate for the whole admin site: anything except the login page, public media
 * files and Next's own assets requires a valid session.
 */
export async function proxy(request: NextRequest) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (session) return NextResponse.next();

    if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
}

export const config = {
    // /media/* serves uploaded files in local development only (see lib/storage.ts).
    // /api/blob is Vercel Blob's upload endpoint: the browser's token request is
    // checked against the session inside the route, and Blob's completion callback
    // (which has no cookie) is verified by Blob's own signature.
    matcher: ['/((?!login|media/|api/blob|_next/static|_next/image|favicon.ico).*)'],
};
