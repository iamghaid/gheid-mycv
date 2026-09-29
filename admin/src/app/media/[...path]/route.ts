import { readFile } from 'fs/promises';
import path from 'path';
import { localPathFor, storageMode } from '@/lib/storage';

/** Serves locally stored uploads during development. Production uses Vercel Blob URLs. */
const TYPES: Record<string, string> = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
    '.gif': 'image/gif', '.svg': 'image/svg+xml', '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
    if (storageMode() !== 'local') return new Response('Not found', { status: 404 });
    const { path: parts } = await ctx.params;
    const file = localPathFor(parts.join('/'));
    if (!file) return new Response('Not found', { status: 404 });
    try {
        const data = await readFile(file);
        const type = TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
        return new Response(new Uint8Array(data), {
            headers: {
                'content-type': type,
                'cache-control': 'public, max-age=31536000, immutable',
                'access-control-allow-origin': '*',
                // Never let an uploaded SVG run script in this origin.
                'content-security-policy': "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
                'x-content-type-options': 'nosniff',
            },
        });
    } catch {
        return new Response('Not found', { status: 404 });
    }
}
